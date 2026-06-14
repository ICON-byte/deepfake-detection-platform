import os
import sys
import json
import subprocess
import tempfile
import time
import mimetypes
from typing import Dict, Any, Optional

import google.generativeai as genai
from dotenv import load_dotenv

# Import existing detector models
from detectors import (
    DeepfakeAudioDetector,
    DeepfakeVisionDetector,
    SyntheticMediaDetector,
    HFInferenceDetector
)

# Load environment variables
load_dotenv()

# Constants
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_MODEL_PATH = os.path.join(SCRIPT_DIR, "audio-model")
VISION_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/deepfake_face_detector.pth")
VISION_FACE_DETECTOR_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/yolov8n-face.pt")
SYNTHETIC_MODEL_PATH = os.path.join(
    SCRIPT_DIR, "vision-model/synthetic_media_detector.pth")

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("[!] WARNING: GEMINI_API_KEY missing in .env. Stage 1/2 LLM analysis will fail.")


def get_file_type(file_path: str) -> str:
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        if mime_type.startswith("video/"):
            return "video"
        if mime_type.startswith("image/"):
            return "image"
        if mime_type.startswith("audio/"):
            return "audio"

    # Fallback to extension
    ext = file_path.lower().split(".")[-1]
    if ext in ["mp4", "mov", "avi", "mkv"]:
        return "video"
    if ext in ["jpg", "jpeg", "png", "webp"]:
        return "image"
    if ext in ["mp3", "wav", "m4a", "flac"]:
        return "audio"

    return "unknown"


def run_telemetry(file_path: str, file_type: str) -> Dict[str, Any]:
    """Stage 0: Extract raw telemetry based on file type."""
    print(f"[*] Stage 0: Extracting telemetry for {file_type}...")
    telemetry = {}

    # 1. Video/Image Processing
    if file_type in ["video", "image"]:
        # Vision Model (Facial Tracking)
        print("    -> Running Vision Model (Facial Tracking)...")
        vision = DeepfakeVisionDetector(
            VISION_MODEL_PATH, VISION_FACE_DETECTOR_PATH)
        v_label, v_conf = vision.predict_video(
            file_path) if file_type == "video" else vision.predict_image(file_path)
        telemetry["vision_model"] = {"verdict": v_label, "confidence": v_conf}

        # Synthetic Model (Pattern Recognition)
        print("    -> Running Synthetic Model (Pattern Recognition)...")
        synth = SyntheticMediaDetector(SYNTHETIC_MODEL_PATH)
        s_label, s_conf = synth.predict_video(
            file_path) if file_type == "video" else synth.predict_image(file_path)
        telemetry["synthetic_model"] = {
            "verdict": s_label, "confidence": s_conf}

        # Cloud Vision Model (HF Inference)
        print("    -> Querying Cloud Vision Model (HF Inference)...")
        hf_token = os.getenv("HF_API_TOKEN")
        if hf_token:
            hf = HFInferenceDetector(
                "prithivMLmods/Deep-Fake-Detector-v2-Model", hf_token)
            h_label, h_conf = hf.predict_video(
                file_path) if file_type == "video" else hf.predict_image(file_path)
            telemetry["cloud_vision_model"] = {
                "verdict": h_label, "confidence": h_conf}
        else:
            telemetry["cloud_vision_model"] = {"error": "HF_API_TOKEN missing"}

    # 2. Audio Processing (Video extract or direct Audio)
    if file_type in ["audio", "video"]:
        print("    -> Running Audio Model (Vocal Analysis)...")
        try:
            audio_bytes = None
            if file_type == "video":
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
                    tmp_name = tmp_audio.name

                subprocess.run([
                    "ffmpeg", "-y", "-i", file_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", tmp_name
                ], capture_output=True, check=True)

                with open(tmp_name, "rb") as f:
                    audio_bytes = f.read()
                os.remove(tmp_name)
            else:
                with open(file_path, "rb") as f:
                    audio_bytes = f.read()

            if audio_bytes:
                audio = DeepfakeAudioDetector(AUDIO_MODEL_PATH)
                a_label, a_conf = audio.predict(audio_bytes)
                telemetry["audio_model"] = {
                    "verdict": a_label, "confidence": a_conf}
        except Exception as e:
            telemetry["audio_model"] = {
                "error": f"Audio processing failed: {str(e)}"}

    return telemetry


def upload_to_gemini(path: str, mime_type: Optional[str] = None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    print(f"[*] Uploaded file to Gemini: {file.display_name}")
    return file


def wait_for_files_active(files):
    """Waits for the given files to be active in Gemini."""
    print("[*] Waiting for Gemini to process media...")
    for name in (f.name for f in files):
        file = genai.get_file(name)
        while file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(2)
            file = genai.get_file(name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {file.name} failed to process")
    print("\n[*] Media processed and active.")


def run_stage_1(file_path: str, file_type: str, telemetry: Dict[str, Any]) -> Dict[str, Any]:
    """Stage 1: Multimodal LLM Synthesis via Gemini 1.5 Flash."""
    print(f"[*] Stage 1: Synthesizing multimodal evidence via Gemini 1.5 Flash...")

    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY missing"}

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    # Upload file for multimodal analysis
    uploaded_file = upload_to_gemini(file_path)
    wait_for_files_active([uploaded_file])

    prompt = f"""
    You are a Forensic AI Synthesizer. Analyze the provided {file_type} file and the following RAW FORENSIC TELEMETRY to provide a unified verdict.
    
    [RAW TELEMETRY]
    {json.dumps(telemetry, indent=2)}
    
    [INSTRUCTIONS]
    1. Cross-reference the media content with the model data.
    2. Categorize anomalies into: 'Spatial/Facial', 'Temporal/Motion', 'Audio/Vocal', and 'Pattern/Artifacts'.
    3. Identify any specific anomalies (e.g., lip-sync mismatch, GAN artifacts, frequency shifts, unnatural textures).
    4. Determine if the content is authentic or synthetically generated/altered.
    5. Output your findings STRICTLY in the following JSON format:
    {{
      "is_synthetic": boolean,
      "synthesis_rationale": "detailed text explaining the logic",
      "anomalies_by_category": {{
        "Spatial/Facial": ["list", "of", "anomalies"],
        "Temporal/Motion": ["list"],
        "Audio/Vocal": ["list"],
        "Pattern/Artifacts": ["list"]
      }}
    }}
    """

    try:
        response = model.generate_content([uploaded_file, prompt])

        # Parse the JSON from text
        raw_output = response.text.strip()
        if "```json" in raw_output:
            raw_output = raw_output.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_output:
            raw_output = raw_output.split("```")[1].split("```")[0].strip()

        return json.loads(raw_output)
    except Exception as e:
        print(f"    [!] Stage 1 Failure: {str(e)}")
        return {"error": str(e)}
    finally:
        # Cleanup file from Gemini servers
        try:
            uploaded_file.delete()
        except:
            pass


def run_stage_2(telemetry: Dict[str, Any], stage1_output: Dict[str, Any]) -> Dict[str, Any]:
    """Stage 2: The Verification Engine Audit."""
    print(f"[*] Stage 2: Executing weighted audit (The Verification Engine)...")

    if not GEMINI_API_KEY:
        return local_audit_fallback(telemetry, stage1_output)

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    audit_prompt = f"""
    You are the Stage 2 Verification Engine. Your mandate is to audit Stage 1 and Raw Telemetry to produce a FINAL verified forensic report.
    
    [CRITICAL TASK]
    You must verify the hardware model outputs BEFORE assigning a final confidence score. 
    Averaging is NOT sufficient. Weigh the specialized sensors (Vision, Synthetic, Audio) against the LLM's visual description.
    
    [INPUT TELEMETRY]
    - Raw Sensors: {json.dumps(telemetry, indent=2)}
    - Stage 1 Synthesis: {json.dumps(stage1_output, indent=2)}
    
    [VERIFICATION STEPS]
    1. Check for Pipeline Contradictions: If hardware models (Stage 0) show >80% AI probability but Stage 1 says REAL, flag an override.
    2. Category Validation: Review the 'anomalies_by_category' from Stage 1. Are they backed by sensor data?
    3. Weighted Confidence: Calculate a final confidence score (0-100) based on the STRENGTH of evidence.
    
    [OUTPUT SCHEMA]
    {{
      "authenticated": boolean,
      "final_verdict": "REAL" | "AI_GENERATED" | "SUSPICIOUS_UNVERIFIED",
      "confidence": integer,
      "audit_status": "PASSED" | "OVERRIDDEN_BY_STAGE_2",
      "categories_summary": {{
         "Facial": "status",
         "Audio": "status",
         "General_Synthetic": "status"
      }},
      "forensic_breakdown": "detailed bulleted rationale explaining why it is AI or Real"
    }}
    """

    try:
        response = model.generate_content(audit_prompt)
        raw_output = response.text.strip()
        if "```json" in raw_output:
            raw_output = raw_output.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_output:
            raw_output = raw_output.split("```")[1].split("```")[0].strip()

        return json.loads(raw_output)
    except Exception as e:
        print(
            f"    [!] Stage 2 API Failure: {str(e)}. Falling back to local logic.")
        return local_audit_fallback(telemetry, stage1_output)


def local_audit_fallback(telemetry: Dict[str, Any], stage1_output: Dict[str, Any]) -> Dict[str, Any]:
    """Simple consensus-based audit if LLM Stage 2 fails."""
    overridden = False
    audit_notes = []

    verdicts = []
    confidences = []
    for m, data in telemetry.items():
        if isinstance(data, dict) and "verdict" in data:
            verdicts.append(data["verdict"].lower())
            confidences.append(data.get("confidence", 0))

    is_fake_consensus = verdicts.count(
        "fake") + verdicts.count("synthetic") + verdicts.count("manipulated") >= 2
    avg_conf = int(sum(confidences) / len(confidences)) if confidences else 0

    if stage1_output.get("is_synthetic") != is_fake_consensus:
        overridden = True
        audit_notes.append("Stage 1 verdict contradicted hardware consensus.")

    final_verdict = "AI_GENERATED" if is_fake_consensus else "REAL"
    if overridden and is_fake_consensus:
        status = "OVERRIDDEN_BY_STAGE_2"
    elif overridden:
        status = "OVERRIDDEN_BY_STAGE_2"
    else:
        status = "PASSED"
        final_verdict = "AI_GENERATED" if stage1_output.get(
            "is_synthetic") else "REAL"

    breakdown = f"### Forensic Evidence Audit\n"
    breakdown += f"- **Hardware Consensus:** {'SYNTHETIC' if is_fake_consensus else 'AUTHENTIC'}\n"
    for m, data in telemetry.items():
        if isinstance(data, dict) and "verdict" in data:
            breakdown += f"  - {m.replace('_', ' ').title()}: {data['verdict']} ({data['confidence']}%)\n"

    if overridden:
        breakdown += f"\n**[AUDIT OVERRIDE]:** {'; '.join(audit_notes)}"

    return {
        "authenticated": not is_fake_consensus and not stage1_output.get("is_synthetic"),
        "final_verdict": final_verdict,
        "confidence": avg_conf,
        "audit_status": status,
        "forensic_breakdown": breakdown
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python forensics_pipeline.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        sys.exit(1)

    file_type = get_file_type(file_path)
    if file_type == "unknown":
        print(f"Error: Unsupported file format for {file_path}")
        sys.exit(1)

    try:
        # Step 0: Local Sensors
        telemetry = run_telemetry(file_path, file_type)

        # Step 1: Gemini Flash Synthesis
        stage1 = run_stage_1(file_path, file_type, telemetry)

        # Step 2: Gemini Flash Audit
        final_report = run_stage_2(telemetry, stage1)

        # Final Output
        print("\n" + "="*50)
        print(f"FINAL FORENSIC REPORT ({file_type.upper()})")
        print("="*50)
        print(json.dumps(final_report, indent=2))

    except KeyboardInterrupt:
        print("\n[!] Pipeline terminated by user.")
    except Exception as e:
        print(f"\n[FATAL ERROR]: {str(e)}")
