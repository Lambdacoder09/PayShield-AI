from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
import uuid
import time

class EventType(str, Enum):
    LOGIN = "LOGIN"
    PAYMENT = "PAYMENT"
    DEVICE_REGISTER = "DEVICE_REGISTER"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    AUTH_FAILURE = "AUTH_FAILURE"
    PROFILE_UPDATE = "PROFILE_UPDATE"
    REVERSAL = "REVERSAL"

class DecisionType(str, Enum):
    ALLOW = "ALLOW"
    CHALLENGE = "CHALLENGE"
    BLOCK = "BLOCK"

class ChallengeMethod(str, Enum):
    NONE = "NONE"
    PASSKEY_WEBAUTHN = "PASSKEY_WEBAUTHN"
    BIOMETRIC_STEP_UP = "BIOMETRIC_STEP_UP"
    SMS_OTP = "SMS_OTP"
    DOCUMENT_VERIFICATION = "DOCUMENT_VERIFICATION"

class FinancialEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: EventType = EventType.PAYMENT
    timestamp: float = Field(default_factory=time.time)
    account_id: str
    customer_id: Optional[str] = None
    amount: float = 0.0
    currency: str = "USD"
    device_id: str = "unknown_device"
    device_fingerprint: Optional[str] = None
    ip_address: str = "127.0.0.1"
    geo_lat: Optional[float] = None
    geo_lon: Optional[float] = None
    country_code: str = "US"
    payment_method_id: Optional[str] = None
    recipient_id: Optional[str] = None
    is_emulator: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RiskFactor(BaseModel):
    name: str
    impact: float
    description: str

class RiskAssessment(BaseModel):
    event_id: str
    timestamp: float = Field(default_factory=time.time)
    account_id: str
    decision: DecisionType
    risk_score: float
    challenge_method: ChallengeMethod = ChallengeMethod.NONE
    fpo_override: bool = False
    fpo_policy_applied: Optional[str] = None
    layer_scores: Dict[str, float] = Field(default_factory=dict)
    contributing_factors: List[RiskFactor] = Field(default_factory=list)
    explanation: str = ""
    remediation_guidance: str = ""
    latency_ms: float = 0.0

