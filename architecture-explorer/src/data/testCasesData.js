export const MULTI_STAGE_TEST_CASES = [
  {
    id: "case_clean_pass",
    title: "Case 1: Pristine Legitimate User (All 6 Stages Pass)",
    category: "Full Approval",
    tag: "ALLOW",
    tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Alice makes a routine $34.50 grocery payment from her home PC on residential Wi-Fi. Every single inspection layer gives a clean green pass.",
    payload: {
      account_id: "ACC_ALICE_101",
      amount: 34.50,
      device_id: "DEV_HOME_PC_ALICE",
      ip_address: "198.51.100.24",
      country: "US",
      is_emulator: false
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "PASS", latency: "1.2 ms", badge: "Valid UUID & Nonce", detail: "Payload schema valid. Zero replay match in 5-min cache." },
      { name: "2. Temporal Feature Store", status: "PASS", latency: "2.4 ms", badge: "Normal Velocity", detail: "1 transaction in last 24h. Spending z-score is 0.12 (baseline $45)." },
      { name: "3. Graph Intelligence", status: "PASS", latency: "3.1 ms", badge: "Isolated Topology", detail: "Hardware device and IP are dedicated solely to ACC_ALICE_101." },
      { name: "4. Dual ML & Anomaly", status: "PASS", latency: "4.5 ms", badge: "Low Risk P(fraud)=0.02", detail: "XGBoost trees and PyOD COPOD detect no tail anomalies." },
      { name: "5. Contextual FPO", status: "PASS", latency: "1.1 ms", badge: "Frictionless Policy", detail: "Local residential IP and trusted device qualify for 1-click checkout." },
      { name: "6. Decision & XAI", status: "PASS", latency: "1.0 ms", badge: "ALLOW ($34.50)", detail: "Decision emitted: ALLOW. Seamless payment processing." }
    ],
    finalDecision: "ALLOW",
    finalRisk: "0.02",
    failedAt: null,
    verdictMessage: "Transaction cleanly cleared all 6 defense stages with 0 friction."
  },
  {
    id: "case_fail_stage1",
    title: "Case 2: Replay Attack (Fails at Stage 1: Ingestion)",
    category: "Security Attack",
    tag: "BLOCK",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "An attacker intercepts and replays an identical raw transaction frame with the same UUID within 45 seconds to force double-spending.",
    payload: {
      account_id: "ACC_VICTIM_404",
      amount: 250.00,
      event_id: "EVT_PREV_SEEN_9981a",
      device_id: "DEV_UNKNOWN",
      ip_address: "185.220.101.5"
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "FAIL", latency: "0.8 ms", badge: "Duplicate UUID Match", detail: "Cryptographic hash matches active cache item recorded 45s ago. Replay attack blocked immediately." },
      { name: "2. Temporal Feature Store", status: "SKIPPED", latency: "-", badge: "Bypassed", detail: "Pipeline short-circuited to conserve compute." },
      { name: "3. Graph Intelligence", status: "SKIPPED", latency: "-", badge: "Bypassed", detail: "Pipeline short-circuited." },
      { name: "4. Dual ML & Anomaly", status: "SKIPPED", latency: "-", badge: "Bypassed", detail: "Pipeline short-circuited." },
      { name: "5. Contextual FPO", status: "SKIPPED", latency: "-", badge: "Bypassed", detail: "Pipeline short-circuited." },
      { name: "6. Decision & XAI", status: "FAIL", latency: "0.4 ms", badge: "BLOCK (Replay)", detail: "Decision emitted: IMMEDIATE HARD BLOCK (Replay Attack)." }
    ],
    finalDecision: "BLOCK",
    finalRisk: "1.00",
    failedAt: "1. Ingestion Gateway",
    verdictMessage: "Lapsed immediately at Stage 1 (Ingestion Gateway) — Replay Attack prevented within 0.8ms."
  },
  {
    id: "case_fail_stage2",
    title: "Case 3: Impossible Travel (Passes Stage 1, Fails at Stage 2)",
    category: "Geographic Velocity",
    tag: "BLOCK",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Account was active in San Francisco. Exactly 20 minutes later, a payment attempt originates from London (speed > 16,000 km/h).",
    payload: {
      account_id: "ACC_TRAVELLER_88",
      amount: 450.00,
      prev_location: "San Francisco, US (20 mins ago)",
      curr_location: "London, UK",
      calculated_speed: "16,240 km/h"
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "PASS", latency: "1.1 ms", badge: "Valid Schema", detail: "Valid format and unique event UUID." },
      { name: "2. Temporal Feature Store", status: "FAIL", latency: "2.8 ms", badge: "Geodesic Speed > 850 km/h", detail: "Haversine engine calculates 8,600 km in 0.33 hours (speed: 16,240 km/h). Flags IMPOSSIBLE_TRAVEL." },
      { name: "3. Graph Intelligence", status: "PASS", latency: "3.2 ms", badge: "Single Account", detail: "No shared devices recorded yet." },
      { name: "4. Dual ML & Anomaly", status: "FAIL", latency: "5.1 ms", badge: "Extreme Anomaly P=0.94", detail: "COPOD tail probability flags 6-sigma spatial outlier." },
      { name: "5. Contextual FPO", status: "FAIL", latency: "1.2 ms", badge: "FPO Disqualified", detail: "Physical impossibility violates commercial aviation bounds (<=850 km/h). FPO mitigation denied." },
      { name: "6. Decision & XAI", status: "FAIL", latency: "1.1 ms", badge: "BLOCK (Impossible Travel)", detail: "Decision emitted: BLOCK with geospatial velocity breach audit." }
    ],
    finalDecision: "BLOCK",
    finalRisk: "0.96",
    failedAt: "2. Temporal Feature Store",
    verdictMessage: "Passed Stage 1, but critically failed at Stage 2 (Temporal Feature Store: Geodesic Velocity)."
  },
  {
    id: "case_fail_stage3",
    title: "Case 4: Sybil Mule Ring (Passes 1 & 2, Fails at Stage 3: Graph)",
    category: "Graph Ring Attack",
    tag: "BLOCK",
    tagColor: "bg-rose-50 text-rose-700 border-rose-200",
    description: "A small payment ($75.00) with clean velocity, but the device emulator fingerprint is connected to 5 other stolen accounts on the entity graph.",
    payload: {
      account_id: "ACC_MULE_06",
      amount: 75.00,
      device_id: "EMULATOR_RING_X9",
      shared_accounts: 5
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "PASS", latency: "1.0 ms", badge: "Valid Payload", detail: "Pydantic validated." },
      { name: "2. Temporal Feature Store", status: "PASS", latency: "2.2 ms", badge: "Low Amount Velocity", detail: "Small $75 payment, no historical velocity spikes." },
      { name: "3. Graph Intelligence", status: "FAIL", latency: "4.8 ms", badge: "Sybil Ring (5 Accounts)", detail: "NetworkX bipartite check reveals EMULATOR_RING_X9 shared across 5 distinct accounts. High degree risk." },
      { name: "4. Dual ML & Anomaly", status: "FAIL", latency: "5.4 ms", badge: "High Risk P=0.91", detail: "XGBoost tree evaluates graph_degree=5 and in_fraud_ring=1." },
      { name: "5. Contextual FPO", status: "FAIL", latency: "1.0 ms", badge: "FPO Disqualified", detail: "Confirmed emulator fingerprint excludes residential sharing policy." },
      { name: "6. Decision & XAI", status: "FAIL", latency: "1.2 ms", badge: "BLOCK (Sybil Ring)", detail: "Decision emitted: BLOCK. Associated accounts quarantined." }
    ],
    finalDecision: "BLOCK",
    finalRisk: "0.93",
    failedAt: "3. Graph Intelligence",
    verdictMessage: "Passed Stages 1 and 2, but caught red-handed at Stage 3 (Graph Intelligence: Sybil Syndicate)."
  },
  {
    id: "case_fpo_challenge",
    title: "Case 5: ATO Step-Up (Passes 1-4, Routed at Stage 5: FPO)",
    category: "Contextual Challenge",
    tag: "CHALLENGE",
    tagColor: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Password reset 10 minutes ago, now accessing from a new device. Instead of a hard decline, the engine routes to Biometric Step-Up authentication.",
    payload: {
      account_id: "ACC_BOB_202",
      amount: 280.00,
      password_reset: "10 mins ago",
      device: "New iPad (Unrecognized)"
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "PASS", latency: "1.1 ms", badge: "Valid Schema", detail: "Standard payment request." },
      { name: "2. Temporal Feature Store", status: "WARN", latency: "2.5 ms", badge: "Password Reset 10m", detail: "password_changed_24h = 1, is_new_device = 1." },
      { name: "3. Graph Intelligence", status: "PASS", latency: "3.0 ms", badge: "No Syndicate Link", detail: "Clean single-user graph neighborhood." },
      { name: "4. Dual ML & Anomaly", status: "WARN", latency: "5.2 ms", badge: "Elevated Risk P=0.58", detail: "XGBoost flags new device ATO correlation." },
      { name: "5. Contextual FPO", status: "PASS", latency: "1.4 ms", badge: "Step-Up Escalation", detail: "FPO Policy: High risk on unestablished device routed to CHALLENGE rather than declining user." },
      { name: "6. Decision & XAI", status: "PASS", latency: "1.0 ms", badge: "CHALLENGE (Passkey)", detail: "Decision emitted: CHALLENGE (Biometric WebAuthn/Passkey)." }
    ],
    finalDecision: "CHALLENGE",
    finalRisk: "0.58",
    failedAt: null,
    verdictMessage: "Borderline ATO risk successfully saved from hard decline: Escalated to Biometric Step-Up Auth."
  },
  {
    id: "case_traveler_saved",
    title: "Case 6: Legitimate Traveler (FPO Saves from False Decline)",
    category: "False-Positive Saver",
    tag: "ALLOW (FPO)",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Alice travels from US to France. Traditional systems block her for foreign IP. PayShield AI verifies her trusted iPhone and valid flight time, approving her with zero friction.",
    payload: {
      account_id: "ACC_ALICE_101",
      amount: 145.00,
      device: "iPhone 15 Pro (Trusted Hardware)",
      flight_hours: 11.2,
      location: "Paris, France"
    },
    stages: [
      { name: "1. Ingestion Gateway", status: "PASS", latency: "1.0 ms", badge: "Valid Schema", detail: "Pydantic validated." },
      { name: "2. Temporal Feature Store", status: "WARN", latency: "2.6 ms", badge: "Cross-Border GPS", detail: "8,600 km distance in 11.2 hrs = 767 km/h (Commercially plausible flight speed)." },
      { name: "3. Graph Intelligence", status: "PASS", latency: "3.1 ms", badge: "Trusted Entity", detail: "Known user hardware." },
      { name: "4. Dual ML & Anomaly", status: "WARN", latency: "5.0 ms", badge: "Foreign IP (Raw P=0.48)", detail: "Unsupervised COPOD notices foreign country anomaly." },
      { name: "5. Contextual FPO", status: "PASS", latency: "1.8 ms", badge: "FPO-1 Triggered!", detail: "Policy FPO-1 executes: Trusted device + valid flight speed overrides block. Risk capped at 0.18." },
      { name: "6. Decision & XAI", status: "PASS", latency: "1.1 ms", badge: "ALLOW (FPO Override)", detail: "Decision emitted: ALLOW. Seamless cross-border checkout." }
    ],
    finalDecision: "ALLOW",
    finalRisk: "0.18 (Mitigated)",
    failedAt: null,
    verdictMessage: "Demonstrates False-Positive Optimization: Traditional rules would have blocked her, but PayShield AI approved her!"
  }
];

