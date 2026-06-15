from detectors import DeepfakeAudioDetector, DeepfakeVisionDetector, DeepfakeTextDetector, PhishingDetector, SightengineDetector
from audio_model.local_audio_heuristics import analyze_audio_heuristics
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
import google.generativeai as genai

# Global Warning Filters
warnings.filterwarnings("ignore")
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass


# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("[!] WARNING: Gemini_Api_Key missing in .env. Dynamic LLM rationale will fail.")

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

AUDIO_MODEL_PATH = os.path.join(SCRIPT_DIR, "audio_model")
VISION_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/deepfake_face_detector.pth")
VISION_FACE_DETECTOR_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/yolov8n-face.pt")
TEXT_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "text-model/logistic_regression_model.pkl")
TEXT_VECTORIZER_PATH = os.path.join(
    SCRIPT_DIR, "text-model/tfidf_vectorizer.pkl")
PHISHING_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "phishing-model/phishing_hybrid_model.pkl")
PHISHING_SCALER_PATH = os.path.join(
    SCRIPT_DIR, "phishing-model/feature_scaler.pkl")
PHISHING_WHITELIST_PATH = os.path.join(
    SCRIPT_DIR, "phishing-model/whitelist.json")

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
    phishing_model = PhishingDetector(PHISHING_MODEL_PATH, PHISHING_SCALER_PATH, PHISHING_WHITELIST_PATH)
    print(" [+] Phishing engine activated.")
except Exception as e:
    print(f" [!] Phishing engine failed: {str(e)}")
    phishing_model = None

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
    target_url = payload.url

    # Special case: Phishing analysis usually targets a string URL, not a file upload
    if mode == "phishing":
        if not target_url:
            raise HTTPException(status_code=400, detail="url is required for phishing analysis.")
        
        if phishing_model:
            status, confidence = await run_in_executor(phishing_model.predict, target_url)
            report = {
                "is_synthetic": status == "Manipulated",
                "status": status,
                "confidence_score": confidence,
                "rationale": f"Suspicious phishing markers detected in URL: {target_url}" if status == "Manipulated" else "URL appears to be a legitimate domain based on heuristic reputation."
            }
        else:
            raise HTTPException(status_code=500, detail="Phishing model not loaded.")

        duration = round(time.time() - start_time, 2)
        report["analysis_duration"] = duration
        return report

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
            audio_verdicts = []
            audio_confidences = []

            # 1. Local Neural Model
            if audio_model:
                label, confidence = await run_in_executor(audio_model.predict, asset_response.content)
                is_fake = label.lower() in [
                    "manipulated", "synthetic", "ai-generated"]
                audio_verdicts.append("synthetic" if is_fake else "authentic")
                audio_confidences.append(confidence)

            # 2. Local Heuristic Engine (Structural Analysis)
            # This detects binary/header signatures that neural networks often miss
            print(" [*] [HEURISTICS] Starting local structural analysis...")
            heuristics = await run_in_executor(analyze_audio_heuristics, tmp_name)
            h_score = heuristics.get("total_heuristic_score", 0)
            print(
                f" [+] [HEURISTICS] Score: {h_score} | Signals: {heuristics.get('signals')}")

            # Determine consensus
            syn_count = audio_verdicts.count("synthetic")
            auth_count = audio_verdicts.count("authentic")

            # Calculate base confidence (average of neural models)
            avg_neural_conf = sum(audio_confidences) / \
                len(audio_confidences) if audio_confidences else 0

            # HEURISTIC PENALTY LOGIC:
            # If heuristics detect strong AI signatures (62+), we penalize the "Authentic" verdict
            # A score of 62+ means at least one definitive generative structural artifact was found.
            final_is_synthetic = syn_count > 0  # If neural model or heuristics flag it
            final_confidence = avg_neural_conf

            if not final_is_synthetic and h_score >= 62:
                # If neural model thinks it's real, but structural heuristics see AI fingerprints:
                # We reduce the confidnce of it being "Authentic"
                # Cap penalty to avoid total flip on weak signals
                penalty = min(h_score, 40)
                final_confidence = max(5, final_confidence - penalty)
                if final_confidence < 45:
                    final_is_synthetic = True
                    final_confidence = 100 - final_confidence

            # Special case: If neural model flagged it, keep it flagged
            if syn_count > 0:
                final_is_synthetic = True

            report = {
                "is_synthetic": final_is_synthetic,
                "status": "Manipulated" if final_is_synthetic else "Authentic",
                "confidence_score": int(final_confidence),
                "rationale": "Multi-Sensor Audio Consensus",
                "breakdown": {
                    "vocalConsistency": avg_neural_conf,
                    "structuralHeuristics": h_score
                }
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
                        "rationale": "Video Analysis"
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
                        "rationale": "Image Analysis"
                    }

        # Optional: Use Gemini to generate a human-readable forensic summary
        if GEMINI_API_KEY:
            try:
                print(" [*] [GEMINI] Generating dynamic forensic summary...")
                model = genai.GenerativeModel("gemini-2.5-flash")

                # We need to map our simple status to the 5-tier system for the prompt
                threat_level = "CLEAN"
                verdict = "REAL"
                conf = report["confidence_score"]
                is_syn = report["is_synthetic"]

                if is_syn:
                    if conf >= 85:
                        threat_level = "CRITICAL"
                        verdict = "AI_GENERATED"
                    elif conf >= 65:
                        threat_level = "HIGH"
                        verdict = "LIKELY_AI"
                    else:
                        threat_level = "MEDIUM"
                        verdict = "UNCERTAIN"
                else:
                    if conf <= 24:
                        threat_level = "CLEAN"
                        verdict = "REAL"
                    elif conf <= 44:
                        threat_level = "LOW"
                        verdict = "LIKELY_REAL"
                    else:
                        threat_level = "MEDIUM"
                        verdict = "UNCERTAIN"

                prompt = f"""
You are an expert Media Forensics Analyst and Security Communications Specialist. Your role is to take raw mathematical data from an AI multimedia threat detection scan and generate a clear, human-readable "Forensic Executive Summary".

[SCAN DATA]
- Media Type: {mode}
- Consensus Score: {report['confidence_score']}%
- Final Verdict: {verdict}
- Threat Level: {threat_level}
- Sensor Rationale: {report['rationale']}

[INSTRUCTIONS]
1. Write a single natural language paragraph assessing the file's digital provenance based on the final verdict.
2. Tailor the language to the media type (e.g., talk about acoustic artifacts for audio, frames/containers for video, or pixel patterns for images).
3. If the file is AI_GENERATED or LIKELY_AI, point out that structural anomalies or sensor flags strongly indicate synthesis.
4. DO NOT include the C2PA disclaimer in this text (the frontend handles that).
5. DO NOT use markdown, just return the raw text paragraph.
"""
                response = model.generate_content(prompt)
                if response and response.text:
                    report["rationale"] = response.text.strip()
            except Exception as e:
                print(f" [!] [GEMINI] Failed to generate dynamic summary: {e}")

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
