import collections
import time
from typing import Dict, List, Tuple, Optional
import numpy as np
from payshield.models.events import FinancialEvent, EventType
from payshield.features.geo import calculate_travel_velocity

class TemporalFeatureStore:
    """
    Sub-millisecond sliding velocity store tracking:
    - 5m, 1h, 24h spending counts and sums
    - Login velocity and failed auth bursts
    - Known device & IP profiling
    - Geodesic travel speed and impossible travel
    """
    def __init__(self):
        # account_id -> deque of (timestamp, amount, event_type, device_id, ip)
        self.account_history = collections.defaultdict(collections.deque)
        # account_id -> last known (lat, lon, timestamp)
        self.last_geo = {}
        # account_id -> set of known trusted devices
        self.known_devices = collections.defaultdict(set)
        # account_id -> timestamp of last password change
        self.last_password_change = {}

    def extract_and_update(self, event: FinancialEvent) -> Dict[str, float]:
        now = event.timestamp
        hist = self.account_history[event.account_id]

        # 1. Password change tracking
        if event.event_type == EventType.PASSWORD_CHANGE:
            self.last_password_change[event.account_id] = now

        last_pwd_time = self.last_password_change.get(event.account_id, 0.0)
        password_changed_24h = 1.0 if (now - last_pwd_time) <= 86400.0 else 0.0

        # 2. Known device check
        is_new_device = 0.0
        if event.device_id:
            if event.account_id in self.known_devices and event.device_id not in self.known_devices[event.account_id]:
                is_new_device = 1.0
            self.known_devices[event.account_id].add(event.device_id)

        # 3. Geo-velocity
        prev_loc = self.last_geo.get(event.account_id)
        dist_km, speed_kmh, impossible_travel = calculate_travel_velocity(
            prev_loc, event.geo_lat, event.geo_lon, now
        )
        if event.geo_lat is not None and event.geo_lon is not None:
            self.last_geo[event.account_id] = (event.geo_lat, event.geo_lon, now)

        # 4. Temporal sliding window metrics
        tx_count_5m = 0
        tx_sum_5m = 0.0
        tx_count_1h = 0
        tx_sum_1h = 0.0
        tx_count_24h = 0
        tx_sum_24h = 0.0
        auth_fails_5m = 0

        # Prune older than 24h
        cutoff_24h = now - 86400.0
        while hist and hist[0][0] < cutoff_24h:
            hist.popleft()

        for t_stamp, amt, ev_type, dev, ip in hist:
            diff = now - t_stamp
            if diff <= 300.0:
                if ev_type == EventType.PAYMENT:
                    tx_count_5m += 1
                    tx_sum_5m += amt
                elif ev_type == EventType.AUTH_FAILURE:
                    auth_fails_5m += 1
            if diff <= 3600.0:
                if ev_type == EventType.PAYMENT:
                    tx_count_1h += 1
                    tx_sum_1h += amt
            if diff <= 86400.0:
                if ev_type == EventType.PAYMENT:
                    tx_count_24h += 1
                    tx_sum_24h += amt

        # Spending Z-score
        avg_spending = (tx_sum_24h / max(1, tx_count_24h)) if tx_count_24h > 0 else 50.0
        std_spending = max(20.0, avg_spending * 0.5)
        spending_zscore = max(-2.0, min(10.0, (event.amount - avg_spending) / std_spending))

        # Append current event
        hist.append((now, event.amount, event.event_type, event.device_id, event.ip_address))

        return {
            "amount": float(event.amount),
            "tx_count_5m": float(tx_count_5m),
            "tx_sum_5m": float(tx_sum_5m),
            "tx_count_1h": float(tx_count_1h),
            "tx_sum_1h": float(tx_sum_1h),
            "tx_count_24h": float(tx_count_24h),
            "tx_sum_24h": float(tx_sum_24h),
            "auth_fails_5m": float(auth_fails_5m),
            "is_new_device": float(is_new_device),
            "is_emulator": 1.0 if event.is_emulator else 0.0,
            "password_changed_24h": float(password_changed_24h),
            "travel_distance_km": float(dist_km),
            "travel_speed_kmh": float(speed_kmh),
            "impossible_travel": 1.0 if impossible_travel else 0.0,
            "spending_zscore": float(spending_zscore)
        }

