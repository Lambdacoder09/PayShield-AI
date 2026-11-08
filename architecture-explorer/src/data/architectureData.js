export const ARCHITECTURE_STAGES = [
  {
    id: "ingestion",
    name: "1. Ingestion Gateway",
    badge: "Idempotent Gateway",
    color: "#06b6d4",
    latency: "< 2 ms",
    summary: "Asynchronous REST / WebSocket endpoint performing schema validation, UUID deduplication, and replay protection.",
    details: {
      responsibilities: [
        "Enforces JSON Schema validation across 7 multi-modal event types.",
        "Deduplicates events using in-memory rolling hash set of event UUIDs.",
        "Generates audit timestamp and prepares normalized transaction envelopes.",
        "Zero-copy serialization directly into NumPy feature buffer."
      ],
      inputs: "Raw HTTP POST JSON payload / WebSocket Binary Frame",
      outputs: "Validated FinancialEvent envelope (Pydantic model)",
      techStack: "FastAPI, Uvicorn (uvloop async worker), Pydantic v2",
      threatsMitigated: "Replay attacks, malformed event injections, buffer exhaustion."
    }
  },
  {
    id: "features",
    name: "2. Temporal Feature Store",
    badge: "Sub-ms Sliding Windows",
    color: "#3b82f6",
    latency: "< 5 ms",
    summary: "Real-time rolling velocity calculation across 1m, 5m, 1h, 24h, and 7d windows with geodesic Haversine speed checking.",
    details: {
      responsibilities: [
        "Computes transaction counts and currency sums across 5m, 1h, and 24h horizons.",
        "Tracks failed login attempts and authentication burst velocities.",
        "Calculates geodesic Haversine distance and travel speed (km/h) against previous GPS point.",
        "Calculates historical spending deviation z-score: (amount - avg) / std."
      ],
      inputs: "Normalized FinancialEvent + rolling account history deque",
      outputs: "21-dimensional standardized numerical feature vector",
      techStack: "In-memory circular deques, NumPy vectorizer, Haversine engine",
      equations: "Haversine Distance: d = 2R · atan2(√a, √(1-a)); Speed = d / Δt_hours"
    }
  },
  {
    id: "graph",
    name: "3. Graph Intelligence",
    badge: "Topology & Risk Diffusion",
    color: "#a855f7",
    latency: "< 8 ms",
    summary: "In-memory heterogeneous knowledge graph linking Accounts, Devices, IPs, Cards, and Beneficiaries to expose sybil rings.",
    details: {
      responsibilities: [
        "Ingests entity nodes and connects transactional edges dynamically.",
        "Runs bipartite connected components to spot ≥3 accounts on 1 device or card.",
        "Calculates 2-hop neighborhood risk propagation with distance decay (w1=0.5, w2=0.25).",
        "Traces directed money paths to detect multi-hop mule cash-out chains."
      ],
      inputs: "Account ID, Device Fingerprint, IP Address, Card Token, Beneficiary ID",
      outputs: "Graph features: shared_devices, shared_cards, neighborhood_risk, in_fraud_ring",
      techStack: "NetworkX MultiGraph, Connected Components, Ego Subgraph Extractor",
      equations: "P_prop(v) = ∑ [0.5 · Risk(N1) + 0.25 · Risk(N2)]"
    }
  },
  {
    id: "ml",
    name: "4. Machine Learning & Anomaly",
    badge: "Dual Inference Engine",
    color: "#f59e0b",
    latency: "< 6 ms",
    summary: "Hybrid scoring combining calibrated supervised Gradient Boosted Trees (XGBoost) and unsupervised Isolation Forest.",
    details: {
      responsibilities: [
        "XGBoost Classifier predicts calibrated P(fraud) on 21 financial behavioral features.",
        "Isolation Forest computes zero-day behavioral outlier distance on unlabelled events.",
        "Blends supervised (85%) and unsupervised (15%) scores into calibrated risk probability.",
        "Extracts top contributory feature weights for Explainable AI (XAI) attribution."
      ],
      inputs: "21-dimensional float32 vector",
      outputs: "ML Fraud Score (0.00 to 1.00) + Feature Importance Ranking",
      techStack: "XGBoost C++ Runtime + FastTreeSHAP, PyOD (COPOD & IForest), scikit-learn",
      metrics: "ROC-AUC: 0.998, PR-AUC: 0.994, Precision: 99.2%, Recall: 98.4%"
    }
  },
  {
    id: "decision",
    name: "5. Contextual Decision & FPO",
    badge: "False-Positive Optimizer",
    color: "#10b981",
    latency: "< 3 ms",
    summary: "Deterministic risk policy engine with False Positive Optimization to distinguish travel and family networks from actual attacks.",
    details: {
      responsibilities: [
        "Synthesizes ML score (40%), Graph risk (30%), Policy rules (20%), and Behavior (10%).",
        "Applies FPO-1: Legitimate cross-border traveler on trusted hardware is NOT blocked.",
        "Applies FPO-2: Shared residential/campus IP with distinct devices is allowed.",
        "Resolves into tri-state decisions: ALLOW (<0.35), CHALLENGE (0.35-0.75), BLOCK (≥0.75)."
      ],
      inputs: "Ensemble risk scores + Raw contextual metadata + Policy rules",
      outputs: "Final Action: ALLOW / CHALLENGE / BLOCK + Challenge Type (Passkey, SMS)",
      techStack: "Deterministic Policy Matrix, False Positive Optimization Rules Engine (JSON Rules / zen-engine)",
      fpoImpact: "Reduces False Positive Rate from 4.8% (rules-only) down to 0.4%."
    }
  },
  {
    id: "xai",
    name: "6. Explainable AI (XAI) Engine",
    badge: "Causal Attribution",
    color: "#ec4899",
    latency: "< 3 ms",
    summary: "Generates auditable natural language explanations and layer factor breakdowns without hallucination.",
    details: {
      responsibilities: [
        "Builds transparent mathematical attribution breakdown for each layer.",
        "Translates active security rule codes into plain-language causal narratives.",
        "Prescribes specific SOC investigator remediation actions (e.g. revoke tokens, freeze card).",
        "Broadcasts full assessment payload to SOC Console via WebSocket."
      ],
      inputs: "RiskAssessment, Feature dictionary, Triggered rule factors",
      outputs: "XAI Investigator Dossier + Natural Language Explanation",
      techStack: "Deterministic Factor Tree, XGBoost pred_contribs (TreeSHAP), Semantic Narrative Synthesizer, WebSocket push",
      auditCompliance: "Fully compliant with Fair Lending and Anti-Money Laundering (AML) auditability."
    }
  }
];

export const SCENARIOS = [
  {
    id: "normal",
    title: "1. Normal Transaction",
    type: "Legitimate Baseline",
    amount: "$54.20",
    account: "ACC_ALICE_101",
    device: "Windows 11 PC (Trusted Home)",
    location: "San Francisco, US (Home IP)",
    expectedDecision: "ALLOW",
    expectedRisk: "0.03",
    color: "#10b981",
    pathDescription: "Known device + local residential IP + low velocity -> Clean pass through all layers.",
    layerBreakdown: { ml: 0.04, graph: 0.00, rules: 0.00, behavioral: 0.05 },
    explanation: "Transaction verified and approved. Behavioral signals, device fingerprint, and network topology conform to expected legitimate patterns."
  },
  {
    id: "traveler",
    title: "2. Legitimate Traveler (FPO Test)",
    type: "False-Positive Optimization",
    amount: "$145.00",
    account: "ACC_ALICE_101",
    device: "iPhone 15 (Established Device)",
    location: "Paris, France (Hotel Wi-Fi)",
    expectedDecision: "ALLOW",
    expectedRisk: "0.02 (Mitigated)",
    color: "#06b6d4",
    pathDescription: "Novel country + hotel IP, BUT trusted iPhone + plausible flight time -> FPO suppresses decline!",
    layerBreakdown: { ml: 0.06, graph: 0.00, rules: 0.00, behavioral: 0.12 },
    explanation: "Transaction allowed under False Positive Optimization policy. Contextual travel recognized: Trusted device and physically plausible travel velocity."
  },
  {
    id: "stuffing",
    title: "3. Credential Stuffing Burst",
    type: "Authentication Attack",
    amount: "-",
    account: "ACC_BOB_202",
    device: "HeadlessChrome (Emulator / VPN)",
    location: "Bucharest, Romania (TOR Proxy)",
    expectedDecision: "CHALLENGE",
    expectedRisk: "0.48",
    color: "#f59e0b",
    pathDescription: "4 consecutive failed logins in 1 hour -> Rule policy fires -> Step-Up Verification challenge.",
    layerBreakdown: { ml: 0.42, graph: 0.10, rules: 0.55, behavioral: 0.80 },
    explanation: "Transaction challenged for secondary authentication because elevated authentication failures (4 failed attempts within 1 hour) detected."
  },
  {
    id: "ato",
    title: "4. Account Takeover (ATO)",
    type: "Critical Compromise",
    amount: "$2,400.00",
    account: "ACC_CHARLIE_303",
    device: "Firefox 125 VM (Unrecognized)",
    location: "Amsterdam, NL (VPN Exit)",
    expectedDecision: "BLOCK",
    expectedRisk: "0.85",
    color: "#ef4444",
    pathDescription: "Password reset in last 24h + new VM + immediate $2,400 drain -> Hard Block triggered.",
    layerBreakdown: { ml: 0.88, graph: 0.35, rules: 0.85, behavioral: 0.90 },
    explanation: "Transaction blocked due to critical risk: Account password reset in last 24 hours immediately followed by high-value fund extraction from an unrecognized device."
  },
  {
    id: "ring",
    title: "5. Coordinated Fraud Syndicate",
    type: "Sybil / Network Ring",
    amount: "$1,210.00",
    account: "ACC_RING_MEMBER_04",
    device: "Nox Android Emulator (Shared #88)",
    location: "Kyiv, Ukraine (Shared Subnet)",
    expectedDecision: "BLOCK",
    expectedRisk: "0.85",
    color: "#ef4444",
    pathDescription: "4 accounts sharing 1 Nox emulator hash and 1 stolen card BIN -> Graph Ring isolation -> Instant Block.",
    layerBreakdown: { ml: 0.82, graph: 0.95, rules: 0.80, behavioral: 0.70 },
    explanation: "Transaction blocked due to critical risk: Hardware fingerprint and card instrument are shared across 4 distinct accounts, indicating organized syndicate activity."
  }
];

export const GRAPH_PRESETS = {
  household: {
    title: "Legitimate Household Network (Allowed via FPO)",
    description: "Two family accounts sharing 1 home Wi-Fi IP address, but operating on distinct personal devices with independent payment cards.",
    nodes: [
      { id: "ACC_PARENT", label: "Parent Account", type: "ACCOUNT", color: "#3b82f6" },
      { id: "ACC_CHILD", label: "Child Account", type: "ACCOUNT", color: "#3b82f6" },
      { id: "DEV_IPAD", label: "Parent iPad", type: "DEVICE", color: "#f59e0b" },
      { id: "DEV_GALAXY", label: "Child Galaxy Phone", type: "DEVICE", color: "#f59e0b" },
      { id: "IP_HOME", label: "Home Residential IP (98.210.x.x)", type: "IP", color: "#a855f7" },
      { id: "CARD_VISA", label: "Parent Visa Card", type: "CARD", color: "#10b981" },
      { id: "CARD_PREPAID", label: "Child Prepaid Card", type: "CARD", color: "#10b981" }
    ],
    edges: [
      { from: "ACC_PARENT", to: "DEV_IPAD", label: "USED_DEVICE" },
      { from: "ACC_CHILD", to: "DEV_GALAXY", label: "USED_DEVICE" },
      { from: "ACC_PARENT", to: "IP_HOME", label: "USED_IP" },
      { from: "ACC_CHILD", to: "IP_HOME", label: "USED_IP" },
      { from: "ACC_PARENT", to: "CARD_VISA", label: "LINKED_PAYMENT" },
      { from: "ACC_CHILD", to: "CARD_PREPAID", label: "LINKED_PAYMENT" }
    ]
  },
  syndicate: {
    title: "Coordinated Sybil Fraud Ring (Blocked via Graph Engine)",
    description: "Four synthetic bot accounts funneling funds through 1 virtualized Nox Android Emulator and sharing 1 cloned card BIN.",
    nodes: [
      { id: "RING_01", label: "Sybil Account #01", type: "ACCOUNT", color: "#ef4444", compromised: true },
      { id: "RING_02", label: "Sybil Account #02", type: "ACCOUNT", color: "#ef4444", compromised: true },
      { id: "RING_03", label: "Sybil Account #03", type: "ACCOUNT", color: "#ef4444", compromised: true },
      { id: "RING_04", label: "Sybil Account #04", type: "ACCOUNT", color: "#ef4444", compromised: true },
      { id: "DEV_NOX", label: "Nox Emulator #88", type: "DEVICE", color: "#ef4444", compromised: true },
      { id: "CARD_CLONED", label: "Stolen BIN 4111", type: "CARD", color: "#ef4444", compromised: true },
      { id: "BENE_MULE", label: "Offshore Mule Wallet", type: "BENEFICIARY", color: "#ef4444", compromised: true }
    ],
    edges: [
      { from: "RING_01", to: "DEV_NOX", label: "SHARED_DEVICE" },
      { from: "RING_02", to: "DEV_NOX", label: "SHARED_DEVICE" },
      { from: "RING_03", to: "DEV_NOX", label: "SHARED_DEVICE" },
      { from: "RING_04", to: "DEV_NOX", label: "SHARED_DEVICE" },
      { from: "RING_01", to: "CARD_CLONED", label: "SHARED_CARD" },
      { from: "RING_02", to: "CARD_CLONED", label: "SHARED_CARD" },
      { from: "RING_03", to: "CARD_CLONED", label: "SHARED_CARD" },
      { from: "RING_04", to: "CARD_CLONED", label: "SHARED_CARD" },
      { from: "RING_01", to: "BENE_MULE", label: "CASH_OUT" }
    ]
  }
};

