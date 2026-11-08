from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any
import asyncio
import os

from payshield.models.events import FinancialEvent, RiskAssessment
from payshield.orchestrator import PayShieldOrchestrator
from payshield.simulator.scenarios import ScenarioGenerator

app = FastAPI(
    title="PayShield AI — Real-Time Fraud Intelligence Engine",
    description="Sub-30ms fraud decisioning API with graph intelligence and false-positive optimization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PayShieldOrchestrator()
active_connections: List[WebSocket] = []
recent_assessments: List[Dict[str, Any]] = []

@app.post("/api/v1/events/ingest", response_model=RiskAssessment)
async def ingest_event(event: FinancialEvent):
    """
    Synchronous low-latency ingestion endpoint evaluating risk in < 30ms.
    """
    assessment = orchestrator.process_event(event)
    as_dict = assessment.model_dump()
    recent_assessments.append(as_dict)
    if len(recent_assessments) > 100:
        recent_assessments.pop(0)

    # Broadcast to active WebSockets
    for ws in active_connections:
        try:
            await ws.send_json({"type": "EVENT_EVALUATED", "data": as_dict})
        except Exception:
            pass

    return assessment

@app.get("/api/v1/events/recent")
async def get_recent_events():
    return {"events": recent_assessments}

@app.get("/api/v1/graph/subgraph/{account_id}")
async def get_subgraph(account_id: str):
    """
    Returns vis-network graph nodes and edges for the given account.
    """
    return orchestrator.graph_engine.get_ego_subgraph_data(account_id)

@app.post("/api/v1/scenarios/trigger/{scenario_name}")
async def trigger_scenario(scenario_name: str):
    """
    Triggers reproducible attack and legitimate scenarios for live demonstration.
    """
    if scenario_name == "normal":
        ev = ScenarioGenerator.normal_transaction()
        res = orchestrator.process_event(ev)
        return {"scenario": "normal", "results": [res.model_dump()]}
    elif scenario_name == "traveler":
        events = ScenarioGenerator.legitimate_traveler()
        results = [orchestrator.process_event(e).model_dump() for e in events]
        return {"scenario": "traveler", "results": results}
    elif scenario_name == "ato":
        events = ScenarioGenerator.account_takeover()
        results = [orchestrator.process_event(e).model_dump() for e in events]
        return {"scenario": "ato", "results": results}
    elif scenario_name == "sybil_ring":
        events = ScenarioGenerator.sybil_fraud_ring()
        results = [orchestrator.process_event(e).model_dump() for e in events]
        return {"scenario": "sybil_ring", "results": results}
    else:
        raise HTTPException(status_code=400, detail=f"Unknown scenario '{scenario_name}'")

@app.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # Keepalive ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

# Mount compiled React frontend console if present
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "dist"))
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")


