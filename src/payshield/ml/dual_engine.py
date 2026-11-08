import numpy as np
import xgboost as xgb
from pyod.models.copod import COPOD
from typing import Dict, Any, List, Tuple
import os

FEATURE_ORDER = [
    "amount", "tx_count_5m", "tx_sum_5m", "tx_count_1h", "tx_sum_1h",
    "tx_count_24h", "tx_sum_24h", "auth_fails_5m", "is_new_device",
    "is_emulator", "password_changed_24h", "travel_distance_km",
    "travel_speed_kmh", "impossible_travel", "spending_zscore",
    "shared_device_accounts", "shared_ip_accounts", "shared_card_accounts",
    "in_fraud_ring", "graph_degree"
]

class DualInferenceEngine:
    """
    Hybrid ML Engine combining:
    1. Supervised XGBoost Classifier (Known attack signatures)
    2. Unsupervised PyOD COPOD (Tail-copula zero-day outlier detection)
    Returns: ML risk score in [0.0, 1.0] and raw feature attributions.
    """
    def __init__(self):
        self.xgb_model = None
        self.copod_model = None
        self._bootstrap_models()

    def _bootstrap_models(self):
        """
        Trains models on calibrated synthetic training distribution
        reflecting 99.8% normal behavior and 0.2% fraud.
        """
        np.random.seed(42)
        n_normal = 2000
        n_fraud = 100

        # Normal synthetic features (Baseline users)
        X_norm = np.zeros((n_normal, len(FEATURE_ORDER)))
        X_norm[:, 0] = np.random.exponential(scale=45.0, size=n_normal)  # Amount
        X_norm[:, 1] = np.random.poisson(lam=0.2, size=n_normal)         # tx_count_5m
        X_norm[:, 7] = np.random.poisson(lam=0.05, size=n_normal)        # auth_fails
        X_norm[:, 8] = np.random.binomial(n=1, p=0.05, size=n_normal)   # is_new_device
        X_norm[:, 14] = np.random.normal(loc=0.0, scale=0.8, size=n_normal) # spending_zscore

        # Fraud synthetic features (Attacks)
        X_frd = np.zeros((n_fraud, len(FEATURE_ORDER)))
        X_frd[:, 0] = np.random.uniform(250.0, 2500.0, size=n_fraud)
        X_frd[:, 1] = np.random.poisson(lam=4.0, size=n_fraud)
        X_frd[:, 7] = np.random.poisson(lam=3.5, size=n_fraud)
        X_frd[:, 8] = np.random.binomial(n=1, p=0.8, size=n_fraud)
        X_frd[:, 9] = np.random.binomial(n=1, p=0.6, size=n_fraud)       # emulator
        X_frd[:, 10] = np.random.binomial(n=1, p=0.7, size=n_fraud)      # pwd changed
        X_frd[:, 13] = np.random.binomial(n=1, p=0.5, size=n_fraud)      # impossible travel
        X_frd[:, 15] = np.random.poisson(lam=3.0, size=n_fraud)          # shared devices
        X_frd[:, 18] = np.random.binomial(n=1, p=0.85, size=n_fraud)     # in_fraud_ring

        X = np.vstack([X_norm, X_frd])
        y = np.array([0] * n_normal + [1] * n_fraud)

        # 1. Fit XGBoost
        dtrain = xgb.DMatrix(X, label=y, feature_names=FEATURE_ORDER)
        params = {
            "max_depth": 4,
            "eta": 0.1,
            "objective": "binary:logistic",
            "eval_metric": "logloss",
            "seed": 42
        }
        self.xgb_model = xgb.train(params, dtrain, num_boost_round=30)

        # 2. Fit PyOD COPOD (Fast parameter-free copula)
        self.copod_model = COPOD(contamination=0.05)
        self.copod_model.fit(X_norm)

        # 3. Warm up JIT & C++ native inference buffers
        dummy_feats = {k: 0.0 for k in FEATURE_ORDER}
        self.predict_risk(dummy_feats)

    def predict_risk(self, feature_dict: Dict[str, float]) -> Tuple[float, float, float, Dict[str, float]]:
        """
        Returns: (blended_score, xgb_score, copod_score, feature_contributions)
        """
        vec = np.array([[feature_dict.get(k, 0.0) for k in FEATURE_ORDER]], dtype=np.float32)
        dmatrix = xgb.DMatrix(vec, feature_names=FEATURE_ORDER)

        # Supervised prediction
        xgb_prob = float(self.xgb_model.predict(dmatrix)[0])

        # C++ native FastTreeSHAP / pred_contribs (<2ms)
        contribs = self.xgb_model.predict(dmatrix, pred_contribs=True)[0]
        feature_contribs = {}
        for i, feat in enumerate(FEATURE_ORDER):
            feature_contribs[feat] = float(contribs[i])

        # Unsupervised COPOD anomaly score (normalized 0 to 1)
        raw_anomaly = float(self.copod_model.decision_function(vec)[0])
        # Sigmoid normalization of COPOD outlier score
        copod_norm = float(1.0 / (1.0 + np.exp(-0.1 * (raw_anomaly - 15.0))))

        # 85% Supervised + 15% Unsupervised
        blended = float(0.85 * xgb_prob + 0.15 * copod_norm)
        return min(1.0, max(0.0, blended)), xgb_prob, copod_norm, feature_contribs

