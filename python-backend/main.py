from detectors import DeepfakeAudioDetector, DeepfakeVisionDetector, DeepfakeTextDetector, PhishingDetector, SightengineDetector
import os
import requests
import time
import mimetypes
import json
import asyncio
import functools
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import warnings
from dotenv import load_dotenv

# Global Warning Filters
warnings.filterwarnings("ignore")
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass


# Load environment variables
load_dotenv()

# Configure FastAPI
app = FastAPI(title="TruthLens AI Core Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DetectionRequest(BaseModel):
    fileUrl: Optional[str] = None
    url: Optional[str] = None
    detectionMode: Optional[str] = None


# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_TMP_DIR = os.path.join(SCRIPT_DIR, "tmp")
os.makedirs(LOCAL_TMP_DIR, exist_ok=True)

AUDIO_MODEL_PATH = os.path.join(SCRIPT_DIR, "audio-model")
VISION_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/deepfake_face_detector.pth")
VISION_FACE_DETECTOR_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/yolov8n-face.pt")
TEXT_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "text-model/logistic_regression_model.pkl")
TEXT_VECTORIZER_PATH = os.path.join(
    SCRIPT_DIR, "text-model/tfidf_vectorizer.pkl")

# Initialize Models
print("Initializing AI Sensors...")

try:
    audio_model = DeepfakeAudioDetector(AUDIO_MODEL_PATH)
    print(" [+] Audio engine activated.")
except Exception as e:
    print(f" [!] Audio engine failed: {str(e)}")
    audio_model = None

try:
    vision_model = DeepfakeVisionDetector(
        VISION_MODEL_PATH, VISION_FACE_DETECTOR_PATH)
    print(" [+] Vision engine activated.")
except Exception as e:
    print(f" [!] Vision engine failed: {str(e)}")
    vision_model = None

try:
    text_model = DeepfakeTextDetector(TEXT_MODEL_PATH, TEXT_VECTORIZER_PATH)
    print(" [+] Text engine activated.")
except Exception as e:
    print(f" [!] Text engine failed: {str(e)}")
    text_model = None

try:
    api_user = os.getenv("SIGHTENGINE_API_USER")
    api_secret = os.getenv("SIGHTENGINE_API_SECRET")
    if api_user and api_secret:
        sightengine = SightengineDetector(api_user, api_secret)
        print(" [+] Sightengine Cloud engine activated.")
    else:
        print(" [!] Sightengine Cloud engine: Missing API credentials.")
        sightengine = None
except Exception as e:
    print(f" [!] Sightengine initialization failed: {str(e)}")
    sightengine = None


async def run_in_executor(func, *args):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, functools.partial(func, *args))


def download_asset(url: str):
    print(f"[*] [DOWNLOAD] Fetching asset: {url[:60]}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=30)
    if response.status_code != 200:
        raise HTTPException(
            status_code=400, detail="Failed to download asset.")
    return response


@app.post("/predict-council")
async def predict_council(payload: DetectionRequest):
    """Primary routing engine for cross-modal detection."""
    start_time = time.time()
    mode = payload.detectionMode
    file_url = payload.fileUrl

    if not file_url:
        raise HTTPException(status_code=400, detail="fileUrl is required.")

    # Download asset
    asset_response = await run_in_executor(download_asset, file_url)
    mime_type = asset_response.headers.get("Content-Type", "")

    ext = mimetypes.guess_extension(mime_type) or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=ext, dir=LOCAL_TMP_DIR, delete=False) as tmp:
        tmp_name = tmp.name
        tmp.write(asset_response.content)

    try:
        report = {"is_synthetic": False, "status": "Authentic",
                  "confidence_score": 0, "rationale": "Unknown"}

        # Routing Logic
        if mode == "text":
            text_content = asset_response.text
            if text_model:
                label, confidence = await run_in_executor(text_model.predict, text_content)
                is_fake = label == "AI-Generated"
                report = {
                    "is_synthetic": is_fake,
                    "status": "Manipulated" if is_fake else "Authentic",
                    "confidence_score": confidence,
                    "rationale": "Local Text Analysis"
                }
            else:
                raise HTTPException(
                    status_code=500, detail="Text model not loaded.")

        elif mode == "audio" or (mime_type and mime_type.startswith("audio/")):
            # Local Audio check
            if audio_model:
                label, confidence = await run_in_executor(audio_model.predict, asset_response.content)
                is_fake = label.lower() in [
                    "manipulated", "synthetic", "ai-generated"]
                report = {
                    "is_synthetic": is_fake,
                    "status": "Manipulated" if is_fake else "Authentic",
                    "confidence_score": confidence,
                    "rationale": "Local Audio Analysis"
                }

            # Sightengine Audio supervisor
            if sightengine:
                s_label, s_conf = await run_in_executor(sightengine.predict_audio, asset_response.content)
                if s_label != "Error":
                    report = {
                        "is_synthetic": s_label == "Synthetic",
                        "status": "Manipulated" if s_label == "Synthetic" else "Authentic",
                        "confidence_score": s_conf,
                        "rationale": "Sightengine AI Speech Analysis"
                    }

        elif mode == "video" or (mime_type and mime_type.startswith("video/")):
            # Local Video check
            if vision_model:
                label, confidence = await run_in_executor(vision_model.predict_video, tmp_name)
                is_fake = label.lower() in ["fake", "manipulated"]
                report = {
                    "is_synthetic": is_fake,
                    "status": "Manipulated" if is_fake else "Authentic",
                    "confidence_score": confidence,
                    "rationale": "Local Vision Analysis"
                }

            # Sightengine Video supervisor
            if sightengine:
                s_label, s_conf = await run_in_executor(sightengine.predict_video, tmp_name)
                if s_label != "Error":
                    report = {
                        "is_synthetic": s_label == "Synthetic",
                        "status": "Manipulated" if s_label == "Synthetic" else "Authentic",
                        "confidence_score": s_conf,
                        "rationale": "Sightengine AI Video Analysis"
                    }

        else:  # Default to Image
            # Local Vision check
            if vision_model:
                label, confidence = await run_in_executor(vision_model.predict_image, tmp_name)
                is_fake = label.lower() in ["fake", "manipulated", "synthetic"]
                report = {
                    "is_synthetic": is_fake,
                    "status": "Manipulated" if is_fake else "Authentic",
                    "confidence_score": confidence,
                    "rationale": "Local Vision Analysis"
                }

            # Sightengine Image supervisor
            if sightengine:
                s_label, s_conf = await run_in_executor(sightengine.predict_image, tmp_name)
                if s_label != "Error":
                    report = {
                        "is_synthetic": s_label == "Synthetic",
                        "status": "Manipulated" if s_label == "Synthetic" else "Authentic",
                        "confidence_score": s_conf,
                        "rationale": "Sightengine AI Image Analysis"
                    }

        duration = round(time.time() - start_time, 2)
        report["analysis_duration"] = duration
        print(f"[COMPLETE] Result: {report['status']} in {duration}s")
        return report

    finally:
        if os.path.exists(tmp_name):
            os.remove(tmp_name)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
