import pytest
import time
from payshield.orchestrator import PayShieldOrchestrator
from payshield.models.events import FinancialEvent, EventType, DecisionType
from payshield.simulator.scenarios import ScenarioGenerator

@pytest.fixture
def orchestrator():
    return PayShieldOrchestrator()

def test_normal_transaction_allowed(orchestrator):
    ev = ScenarioGenerator.normal_transaction()
    assessment = orchestrator.process_event(ev)
    assert assessment.decision == DecisionType.ALLOW
    assert assessment.risk_score < 0.35
    assert assessment.latency_ms < 50.0  # Strict SLA

def test_legitimate_traveler_fpo_override(orchestrator):
    events = ScenarioGenerator.legitimate_traveler()
    # Process home event
    orchestrator.process_event(events[0])
    # Process travel event
    travel_assessment = orchestrator.process_event(events[1])
    assert travel_assessment.decision == DecisionType.ALLOW
    assert travel_assessment.fpo_override is True
    assert "FPO-1" in travel_assessment.fpo_policy_applied

def test_sybil_fraud_ring_detected(orchestrator):
    events = ScenarioGenerator.sybil_fraud_ring()
    assessments = [orchestrator.process_event(ev) for ev in events]
    # By the 3rd/4th account sharing emulator & card, ring must be detected and BLOCKED
    last_assessment = assessments[-1]
    assert last_assessment.decision == DecisionType.BLOCK
    assert last_assessment.risk_score >= 0.75
    assert any("Sybil" in f.name for f in last_assessment.contributing_factors)

def test_replay_attack_rejected(orchestrator):
    ev = ScenarioGenerator.normal_transaction()
    first = orchestrator.process_event(ev)
    assert first.decision == DecisionType.ALLOW
    # Replay same event ID
    duplicate = orchestrator.process_event(ev)
    assert duplicate.decision == DecisionType.BLOCK
    assert "Duplicate" in duplicate.explanation

def test_latency_performance_sla(orchestrator):
    # Warmup first inference (JIT & model buffer allocation)
    ev_warm = ScenarioGenerator.normal_transaction()
    orchestrator.process_event(ev_warm)

    latencies = []
    for _ in range(25):
        ev = ScenarioGenerator.normal_transaction()
        assessment = orchestrator.process_event(ev)
        latencies.append(assessment.latency_ms)
    
    p95 = sorted(latencies)[int(len(latencies) * 0.95)]
    assert p95 < 30.0, f"P95 latency {p95}ms exceeded 30ms SLA"

