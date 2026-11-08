import time
from typing import Dict, Any, List
from payshield.models.events import FinancialEvent, RiskAssessment
from payshield.ingest.gateway import IdempotencyGateway
from payshield.features.store import TemporalFeatureStore
from payshield.graph.engine import EntityGraphEngine
from payshield.ml.dual_engine import DualInferenceEngine
from payshield.decision.engine import ContextualDecisionEngine

class PayShieldOrchestrator:
    """
    Unified Real-Time Risk Processing Engine.
    Executes Ingestion -> Feature Store -> Graph Engine -> Dual ML -> FPO Decision Matrix
    Strictly within sub-30ms execution budget.
    """
    def __init__(self):
        self.gateway = IdempotencyGateway()
        self.feature_store = TemporalFeatureStore()
        self.graph_engine = EntityGraphEngine()
        self.ml_engine = DualInferenceEngine()
        self.decision_engine = ContextualDecisionEngine()

    def process_event(self, event: FinancialEvent) -> RiskAssessment:
        t0 = time.perf_counter()

        # 1. Ingestion & Replay Protection
        is_new = self.gateway.check_and_record(event)
        if not is_new:
            # Replay attack detected
            elapsed_ms = (time.perf_counter() - t0) * 1000.0
            return RiskAssessment(
                event_id=event.event_id,
                account_id=event.account_id,
                decision="BLOCK",
                risk_score=1.0,
                explanation="Duplicate event rejected: Replay attack or concurrent retry detected.",
                remediation_guidance="Drop duplicated network frame.",
                latency_ms=round(elapsed_ms, 2)
            )

        # 2. Extract Temporal Features
        temporal_feats = self.feature_store.extract_and_update(event)

        # 3. Graph Engine Update & Extraction
        self.graph_engine.update_graph(event)
        graph_feats = self.graph_engine.extract_graph_features(event.account_id)

        # Merge features for ML
        all_features = {**temporal_feats, **graph_feats}

        # 4. Dual ML Inference
        ml_score, xgb_score, copod_score, contribs = self.ml_engine.predict_risk(all_features)

        # 5. Contextual Decision & FPO
        (
            decision, composite_risk, challenge, fpo_override,
            fpo_policy, layer_scores, factors, explanation, remediation
        ) = self.decision_engine.evaluate_decision(all_features, ml_score, graph_feats)

        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        return RiskAssessment(
            event_id=event.event_id,
            timestamp=event.timestamp,
            account_id=event.account_id,
            decision=decision,
            risk_score=composite_risk,
            challenge_method=challenge,
            fpo_override=fpo_override,
            fpo_policy_applied=fpo_policy,
            layer_scores=layer_scores,
            contributing_factors=factors,
            explanation=explanation,
            remediation_guidance=remediation,
            latency_ms=round(elapsed_ms, 2)
        )

