from typing import Dict, Any, Tuple, Optional, List
from payshield.models.events import DecisionType, ChallengeMethod, RiskFactor

class ContextualDecisionEngine:
    """
    Combines ML scores, Graph risks, and Behavioral anomalies with
    contextual False-Positive Optimization (FPO) rules.
    Tri-State Decision:
    - ALLOW (< 0.35 or FPO Override)
    - CHALLENGE (0.35 <= Risk < 0.75)
    - BLOCK (Risk >= 0.75 or hard security trigger)
    """
    def __init__(self, allow_threshold: float = 0.35, block_threshold: float = 0.75):
        self.allow_threshold = allow_threshold
        self.block_threshold = block_threshold

    def evaluate_decision(
        self,
        features: Dict[str, float],
        ml_score: float,
        graph_features: Dict[str, float]
    ) -> Tuple[DecisionType, float, ChallengeMethod, bool, Optional[str], Dict[str, float], List[RiskFactor], str, str]:
        
        # 1. Base Layer Scores
        layer_scores = {
            "ml_probability": round(ml_score, 4),
            "graph_risk": 0.0,
            "policy_rules": 0.0,
            "behavioral": 0.0
        }

        # Graph risk
        in_ring = graph_features.get("in_fraud_ring", 0.0)
        shared_dev = graph_features.get("shared_device_accounts", 0.0)
        if in_ring > 0 or shared_dev >= 3:
            layer_scores["graph_risk"] = 0.95
        elif shared_dev >= 2:
            layer_scores["graph_risk"] = 0.65

        # Policy rules
        impossible_travel = features.get("impossible_travel", 0.0)
        pwd_changed_24h = features.get("password_changed_24h", 0.0)
        is_new_device = features.get("is_new_device", 0.0)
        is_emulator = features.get("is_emulator", 0.0)
        auth_fails_5m = features.get("auth_fails_5m", 0.0)

        # Hard triggers
        if is_emulator > 0 or in_ring > 0:
            layer_scores["policy_rules"] = 0.90
        elif impossible_travel > 0:
            layer_scores["policy_rules"] = 0.85
        elif auth_fails_5m >= 4:
            layer_scores["policy_rules"] = 0.75

        # Behavioral
        if features.get("spending_zscore", 0.0) > 3.0:
            layer_scores["behavioral"] = 0.70
        elif features.get("tx_count_5m", 0.0) >= 3:
            layer_scores["behavioral"] = 0.60

        # Weighted Composite Risk: 40% ML + 30% Graph + 20% Rules + 10% Behavioral
        composite_risk = (
            0.40 * layer_scores["ml_probability"] +
            0.30 * layer_scores["graph_risk"] +
            0.20 * layer_scores["policy_rules"] +
            0.10 * layer_scores["behavioral"]
        )

        # 2. Contextual False-Positive Optimization (FPO) Filters
        fpo_override = False
        fpo_policy = None

        # FPO-1: Legitimate Cross-Border Traveler
        # Traveled far, but physically plausible speed (impossible_travel == 0) + known trusted device
        travel_dist = features.get("travel_distance_km", 0.0)
        if travel_dist > 500.0 and impossible_travel == 0.0 and is_new_device == 0.0 and is_emulator == 0.0 and in_ring == 0.0:
            fpo_override = True
            fpo_policy = "FPO-1: Legitimate Cross-Border Traveler on Established Hardware"
            composite_risk = min(0.30, composite_risk)

        # FPO-2: Residential / Campus Shared IP
        # Multiple accounts share IP, but distinct hardware devices and cards
        shared_ips = graph_features.get("shared_ip_accounts", 0.0)
        if shared_ips >= 2 and shared_dev <= 1 and is_emulator == 0.0 and in_ring == 0.0:
            fpo_override = True
            fpo_policy = "FPO-2: Multi-User Residential Subnet (Distinct Hardware)"
            composite_risk = min(0.28, composite_risk)

        # FPO-3: Large Purchase on Trusted Device
        if features.get("amount", 0.0) >= 500.0 and is_new_device == 0.0 and pwd_changed_24h == 0.0 and in_ring == 0.0:
            if composite_risk < self.block_threshold:
                fpo_override = True
                fpo_policy = "FPO-3: High-Value Purchase on Established Hardware"
                # Keep as Challenge rather than Block

        # 3. Decision Matrix
        composite_risk = round(min(1.0, max(0.0, composite_risk)), 4)
        decision = DecisionType.ALLOW
        challenge = ChallengeMethod.NONE

        if composite_risk < self.allow_threshold:
            decision = DecisionType.ALLOW
            challenge = ChallengeMethod.NONE
        elif composite_risk < self.block_threshold:
            decision = DecisionType.CHALLENGE
            if is_new_device > 0:
                challenge = ChallengeMethod.PASSKEY_WEBAUTHN
            else:
                challenge = ChallengeMethod.BIOMETRIC_STEP_UP
        else:
            decision = DecisionType.BLOCK
            challenge = ChallengeMethod.NONE

        # 4. Factors and Plain-English Explanation
        factors = []
        if in_ring > 0:
            factors.append(RiskFactor(name="Sybil Fraud Ring", impact=0.85, description="Account linked to multiple accounts sharing hardware or funding instrument."))
        if impossible_travel > 0:
            factors.append(RiskFactor(name="Impossible Travel", impact=0.80, description=f"Speed ({features.get('travel_speed_kmh', 0):.0f} km/h) exceeds commercial aviation boundaries."))
        if is_emulator > 0:
            factors.append(RiskFactor(name="Device Virtualization", impact=0.75, description="Headless browser or Android emulator environment detected."))
        if pwd_changed_24h > 0 and is_new_device > 0:
            factors.append(RiskFactor(name="ATO Sequence", impact=0.70, description="Password changed within 24h combined with unrecognized hardware device."))
        if auth_fails_5m >= 3:
            factors.append(RiskFactor(name="Auth Velocity Spike", impact=0.60, description="High frequency authentication failures in short time horizon."))

        if decision == DecisionType.ALLOW:
            if fpo_override:
                explanation = f"Transaction approved under {fpo_policy}. Travel or shared network signals mitigated by verified trusted hardware."
            else:
                explanation = "Transaction approved. Behavioral velocity, hardware profile, and graph topology conform to legitimate patterns."
            remediation = "No intervention required. Allow frictionless settlement."
        elif decision == DecisionType.CHALLENGE:
            explanation = f"Transaction challenged for step-up verification. Risk factors present: {', '.join([f.name for f in factors]) or 'Elevated ML risk'}."
            remediation = "Halt immediate balance transfer and prompt customer with Passkey/WebAuthn biometrics."
        else:
            explanation = f"Transaction blocked due to severe security anomaly. Dominant threats: {', '.join([f.name for f in factors]) or 'Confirmed Syndicate Ring'}."
            remediation = "Freeze outbound transfers, revoke active session tokens, and escalate to PayPal Risk Operations."

        return (
            decision, composite_risk, challenge, fpo_override,
            fpo_policy, layer_scores, factors, explanation, remediation
        )

