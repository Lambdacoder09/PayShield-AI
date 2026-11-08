import collections
import time
from typing import Optional
from payshield.models.events import FinancialEvent

class IdempotencyGateway:
    """
    Sub-millisecond sliding deduplication gateway protecting against replay attacks.
    Caches cryptographic hashes & event UUIDs.
    """
    def __init__(self, ttl_seconds: float = 300.0, max_size: int = 100_000):
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size
        self._seen_ids = collections.OrderedDict()

    def check_and_record(self, event: FinancialEvent) -> bool:
        """
        Returns True if event is NEW (accepted).
        Returns False if event is a DUPLICATE (replay attack / retry).
        """
        now = time.time()
        self._evict_expired(now)

        if event.event_id in self._seen_ids:
            return False

        if len(self._seen_ids) >= self.max_size:
            self._seen_ids.popitem(last=False)

        self._seen_ids[event.event_id] = now
        return True

    def _evict_expired(self, now: float):
        cutoff = now - self.ttl_seconds
        while self._seen_ids:
            oldest_key, oldest_time = next(iter(self._seen_ids.items()))
            if oldest_time < cutoff:
                self._seen_ids.popitem(last=False)
            else:
                break

