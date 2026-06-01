# backend/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

class KeystrokeMetric(BaseModel):
    key: str
    event_type: str  # "keydown" or "keyup"
    timestamp: int   # Epoch time in milliseconds

class MouseMetric(BaseModel):
    x: int
    y: int
    event_type: str  # "mousemove" or "click"
    timestamp: int

class TelemetryPayload(BaseModel):
    client_id: str = Field(..., description="Unique ID of the SaaS consumer")
    session_id: str = Field(..., description="Unique session token for the current user instance")
    user_id: Optional[str] = None
    keystrokes: List[KeystrokeMetric] = []
    mouse_movements: List[MouseMetric] = []