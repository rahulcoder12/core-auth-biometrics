# backend/main.py
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import TelemetryPayload

app = FastAPI(title="Behavioral Biometrics Ingestion Engine API")

# Allow your telemetry scripts from various origins to hit this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/telemetry", status_code=status.HTTP_202_ACCEPTED)
async def ingest_telemetry(payload: TelemetryPayload):
    # Day 1 Goal: Successfully catch, validate, and log the stream
    # (Future days will offload this to Redis/Kafka and process via ML pipeline)
    print(f"Captured {len(payload.keystrokes)} keystrokes from session {payload.session_id}")
    return {"status": "queued", "received_events": len(payload.keystrokes) + len(payload.mouse_movements)}