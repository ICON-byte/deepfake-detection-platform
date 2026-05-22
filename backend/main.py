from fastapi import FastAPI
from config import settings
from auth.routes import router as auth_router
from fastapi import Depends
from auth.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware
from routers.detection import router as detection_router

app = FastAPI(title="Deepfake Detection Platform", version="1.0.0")

app.include_router(auth_router)

app.include_router(detection_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],  # adjust to your frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Deepfake Detection API is running"}

@app.get("/health")
def health():
    return {"status": "ok", "mongodb_url": settings.MONGODB_URL}

@app.get("/me")
def get_current_user_info(current_user = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "quota_used": current_user.get("quota_used", 0)
    }