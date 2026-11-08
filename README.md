---
title: PayShield AI
emoji: 🛡️
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# PayShield AI — Real-Time Fraud Intelligence & Prevention Platform

PayShield AI is an intelligent real-time payment risk decision engine inspired by PayPal's risk engineering architecture.
It evaluates payment transactions, account takeovers (ATO), device spoofing, and coordinated Sybil mule rings in under **30 milliseconds** while using Contextual False-Positive Optimization (FPO) to protect legitimate cross-border travelers and shared residential subnets.

### Live Architecture & Capabilities:
- **FastAPI Core**: Microsecond event deduplication and asynchronous stream ingestion.
- **In-Memory NetworkX Graph**: Real-time bipartite Sybil mule ring and emulator clustering.
- **Dual ML Engine**: XGBoost supervised classifier combined with PyOD COPOD tail-copula anomaly scoring.
- **Contextual FPO Policy**: Overrides unnecessary declines when verified hardware and valid travel velocities exist.
- **Sub-3ms Explainable AI (XAI)**: Exact Shapley feature attributions and deterministic causal dossiers.
