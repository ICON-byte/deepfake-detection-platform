from detectors import DeepfakeAudioDetector, DeepfakeVisionDetector, DeepfakeTextDetector, PhishingDetector, PhishingDetectorVT, SightengineDetector
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
from google import genai
from google.genai import types

# Global Warning Filters
warnings.filterwarnings("ignore")
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass


# Load environment variables
load_dotenv()

# Force check and clean the API keys
raw_gemini_key = os.getenv("Gemini_Api_Key") or os.getenv("GEMINI_API_KEY")
GEMINI_API_KEY = raw_gemini_key.strip() if raw_gemini_key else None

raw_vt_key = os.getenv("VT_API_KEY")
VT_API_KEY = raw_vt_key.strip() if raw_vt_key else None

# Debugging prints to catch anomalies
if GEMINI_API_KEY:
    # Prints first 4 and last 4 characters to help you verify it's the right key 
    # without exposing it in logs completely.
    masked_key = f"{GEMINI_API_KEY[:4]}...{GEMINI_API_KEY[-4:]}"
    print(f" [+] Found Gemini Key in env: {masked_key}")
    
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print(" [+] Gemini dynamic inference engine activated.")
    except Exception as e:
        gemini_client = None
        print(f" [!] Error initializing GenAI Client object: {e}")
else:
    gemini_client = None
    print("[!] WARNING: Gemini_Api_Key missing in .env. Dynamic LLM rationale will fail.")

if not VT_API_KEY:
    print("[!] WARNING: VT_API_KEY missing in .env. Phishing cross-checks will fail.")

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
    phishing_model = PhishingDetector(
        PHISHING_MODEL_PATH, PHISHING_SCALER_PATH, PHISHING_WHITELIST_PATH)
    print(" [+] Phishing engine activated.")
except Exception as e:
    print(f" [!] Phishing engine failed: {str(e)}")
    phishing_model = None

try:
    if VT_API_KEY:
        vt_phishing_model = PhishingDetectorVT(VT_API_KEY)
        print(" [+] VirusTotal cross-check engine activated.")
    else:
        vt_phishing_model = None
except Exception as e:
    print(f" [!] VT Phishing engine failed: {str(e)}")
    vt_phishing_model = None

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
            raise HTTPException(
                status_code=400, detail="url is required for phishing analysis.")

        # Priority 1: VirusTotal (Primary Engine as requested)
        if vt_phishing_model:
            print(
                f" [*] [PHISHING] Routing to VirusTotal Primary Engine: {target_url[:50]}...")
            vt_report = await run_in_executor(vt_phishing_model.predict, target_url)

            if vt_report.get("status") != "Error":
                report = {
                    "is_synthetic": vt_report["is_synthetic"],
                    "status": vt_report["status"],
                    "confidence_score": vt_report["confidence_score"],
                    "rationale": vt_report["rationale"],
                    "breakdown": {
                        # Weight for chart
                        "urlAnalysis": vt_report.get("malicious", 0) * 10,
                        "domainReputation": vt_report.get("harmless", 0),
                        "structuralHeuristics": vt_report.get("suspicious", 0) * 20
                    }
                }
                # Add VT specific metadata
                report["vt_permalink"] = vt_report.get("permalink")
            else:
                print(
                    " [!] VirusTotal Engine failed, falling back to local heuristics.")
                vt_report = None
        else:
            vt_report = None

        # Priority 2: Fallback to Local Heuristics if VT is missing or failed
        if not vt_report and phishing_model:
            status, confidence = await run_in_executor(phishing_model.predict, target_url)
            report = {
                "is_synthetic": status == "Manipulated",
                "status": status,
                "confidence_score": confidence,
                "rationale": f"Local heuristic check: {status} patterns detected in URL."
            }
        elif not vt_report:
            raise HTTPException(
                status_code=500, detail="No phishing detection engines available.")

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
            # If heuristics detect strong AI signatures (62+), we heavily boost the "Fakeness" probability
            # A score of 62+ means at least one definitive generative structural artifact was found.
            final_is_synthetic = syn_count > 0  # If neural model or heuristics flag it
            final_confidence = avg_neural_conf

            if not final_is_synthetic and h_score >= 62:
                # If neural model thinks it's real (e.g. 5% fake), but structural heuristics see AI fingerprints:
                # We boost the fakeness probability
                penalty = min(h_score, 40) # up to +40% fakeness
                final_confidence = min(95, final_confidence + penalty)
                if final_confidence >= 45:
                    final_is_synthetic = True

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

        # Optional: Use Gemini to generate a human-readable forensic summary and dynamic factors
        if gemini_client:
            try:
                print(" [*] [GEMINI] Generating dynamic forensic summary and factors...")

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
You are an expert Media Forensics Analyst and Security Communications Specialist. Your role is to take raw mathematical data from an AI multimedia threat detection scan and generate a clear, human-readable "Forensic Executive Summary" along with 3 specific forensic metrics tailored to the media type.

[SCAN DATA]
- Media Type: {mode}
- Consensus Score: {report['confidence_score']}%
- Final Verdict: {verdict}
- Threat Level: {threat_level}
- Sensor Rationale: {report['rationale']}

[INSTRUCTIONS]
Return ONLY a valid JSON object with the following schema:
{{
  "rationale": "A single natural language paragraph assessing the file's digital provenance based on the final verdict. Tailor the terminology strictly to the media type (e.g., acoustic artifacts/spectrograms for audio, spatial coherence/compression blocks for video, pixel patterns/noise for images, semantic burstiness for text). DO NOT include the C2PA disclaimer.",
  "factors": [
    {{
      "label": "Short Metric Name (e.g., 'Lighting Analysis' or 'Vocal Pitch')",
      "value": 85, // An integer score between 0 and 100
      "description": "A short, 1-sentence technical description of what this metric evaluated."
    }}
  ]
}}
"""
                response = await gemini_client.aio.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    )
                )
                
                if response and response.text:
                    gemini_data = json.loads(response.text)
                    if "rationale" in gemini_data:
                        report["rationale"] = gemini_data["rationale"]
                    if "factors" in gemini_data:
                        report["dynamic_factors"] = gemini_data["factors"]
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
