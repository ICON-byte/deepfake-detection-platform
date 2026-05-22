from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from datetime import datetime
from typing import Optional
from auth.optional_dependencies import get_optional_current_user
from config import settings
import uuid

router = APIRouter(prefix="/detect", tags=["Detection"])

free_scan_tracker = {}
FREE_SCAN_LIMIT = 3

@router.post("/")
async def detect(
    file: UploadFile = File(...),
    client_id: Optional[str] = None,
    current_user = Depends(get_optional_current_user)  # returns None if not logged in
):
    authenticated = current_user is not None

    if authenticated:
        username = current_user["username"]
        from auth.database import users_collection
        user = users_collection.find_one({"username": username})
        used = user.get("quota_used", 0)
        if used >= settings.DEFAULT_MONTHLY_QUOTA:
            raise HTTPException(403, "Monthly scan limit reached. Upgrade your plan.")
    else:
        if not client_id:
            client_id = str(uuid.uuid4())
        used = free_scan_tracker.get(client_id, 0)
        if used >= FREE_SCAN_LIMIT:
            raise HTTPException(403, f"Free scan limit ({FREE_SCAN_LIMIT}) reached. Please log in to continue.")
    
    # Mock detection – replace with real model
    result = {
        "verdict": "Fake" if used % 2 == 0 else "Real",
        "confidence": 85.0 + (used * 2) % 15,
        "details": "Analysis complete.",
        "processed_at": datetime.utcnow().isoformat()
    }
    
    if authenticated:
        users_collection.update_one({"username": username}, {"$inc": {"quota_used": 1}})
        remaining = settings.DEFAULT_MONTHLY_QUOTA - (used + 1)
    else:
        free_scan_tracker[client_id] = used + 1
        remaining = FREE_SCAN_LIMIT - (used + 1)
    
    return {
        "client_id": client_id if not authenticated else None,
        "report": result,
        "scans_remaining": remaining
    }