import time
from typing import List
from payshield.models.events import FinancialEvent, EventType

class ScenarioGenerator:
    """
    Generates reproducible synthetic financial attack and legitimate test cases
    for hackathon demonstrations and performance validation.
    """
    @staticmethod
    def normal_transaction() -> FinancialEvent:
        return FinancialEvent(
            account_id="ACC_ALICE_101",
            amount=42.50,
            currency="USD",
            device_id="DEV_ALICE_PHONE",
            ip_address="198.51.100.24",
            geo_lat=37.7749,
            geo_lon=-122.4194,
            country_code="US",
            payment_method_id="CARD_ALICE_VISA",
            recipient_id="MERCHANT_COFFEE_SHOP",
            is_emulator=False
        )

    @staticmethod
    def legitimate_traveler() -> List[FinancialEvent]:
        """
        Alice uses her known trusted iPhone, but flies from SF to Paris over 11 hours.
        FPO should recognize valid velocity + trusted hardware -> ALLOW.
        """
        t_base = time.time()
        ev1 = FinancialEvent(
            account_id="ACC_ALICE_101",
            amount=35.00,
            timestamp=t_base - (11 * 3600),
            device_id="DEV_ALICE_PHONE",
            ip_address="198.51.100.24",
            geo_lat=37.7749,
            geo_lon=-122.4194,
            country_code="US",
            payment_method_id="CARD_ALICE_VISA"
        )
        ev2 = FinancialEvent(
            account_id="ACC_ALICE_101",
            amount=145.00,
            timestamp=t_base,
            device_id="DEV_ALICE_PHONE",  # Same established device
            ip_address="82.120.45.10",    # Paris Hotel Wi-Fi
            geo_lat=48.8566,
            geo_lon=2.3522,
            country_code="FR",
            payment_method_id="CARD_ALICE_VISA",
            recipient_id="HOTEL_PARIS"
        )
        return [ev1, ev2]

    @staticmethod
    def account_takeover() -> List[FinancialEvent]:
        """
        Attacker changes password on Bob's account from unknown emulator,
        followed by immediate high-value transfer.
        """
        t_base = time.time()
        ev1 = FinancialEvent(
            event_type=EventType.PASSWORD_CHANGE,
            account_id="ACC_BOB_202",
            timestamp=t_base - 300,
            device_id="DEV_HACKER_GENYMOTION",
            ip_address="185.220.101.5",
            is_emulator=True
        )
        ev2 = FinancialEvent(
            event_type=EventType.PAYMENT,
            account_id="ACC_BOB_202",
            amount=1850.00,
            timestamp=t_base,
            device_id="DEV_HACKER_GENYMOTION",
            ip_address="185.220.101.5",
            is_emulator=True,
            recipient_id="CRYPTO_EXCHANGE_OUT"
        )
        return [ev1, ev2]

    @staticmethod
    def sybil_fraud_ring() -> List[FinancialEvent]:
        """
        4 distinct accounts sharing the exact same device emulator and funding card.
        """
        t_base = time.time()
        events = []
        for i, acc in enumerate(["ACC_SYBIL_01", "ACC_SYBIL_02", "ACC_SYBIL_03", "ACC_SYBIL_04"]):
            events.append(FinancialEvent(
                account_id=acc,
                amount=350.00 + (i * 20),
                timestamp=t_base + (i * 2),
                device_id="EMULATOR_RING_X9",
                ip_address="45.154.255.10",
                payment_method_id="CARD_STOLEN_MASTER",
                is_emulator=True
            ))
        return events

