import math
from typing import Optional, Tuple

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in kilometers.
    Handles antipode wrapping and boundary limits natively.
    """
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(dlambda / 2.0) ** 2)
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_travel_velocity(
    prev_loc: Optional[Tuple[float, float, float]],
    curr_lat: Optional[float],
    curr_lon: Optional[float],
    curr_time: float,
    max_commercial_speed: float = 850.0
) -> Tuple[float, float, bool]:
    """
    Returns: (distance_km, speed_kmh, is_impossible_travel)
    """
    if not prev_loc or curr_lat is None or curr_lon is None:
        return 0.0, 0.0, False

    p_lat, p_lon, p_time = prev_loc
    time_diff_hours = (curr_time - p_time) / 3600.0

    if time_diff_hours <= 0.001:  # Sub-3-second interval
        dist = haversine_distance_km(p_lat, p_lon, curr_lat, curr_lon)
        if dist > 50.0:  # Physically impossible jump in seconds
            return dist, 9999.0, True
        return dist, 0.0, False

    dist = haversine_distance_km(p_lat, p_lon, curr_lat, curr_lon)
    speed = dist / time_diff_hours
    is_impossible = speed > max_commercial_speed
    return dist, speed, is_impossible

