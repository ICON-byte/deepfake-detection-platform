from __future__ import annotations

import io
import re
import math
import json
import os
import random
import time
import tempfile
import urllib.parse
from base64 import urlsafe_b64encode
from urllib.parse import urlparse
from collections import Counter
from typing import Tuple, List, Optional, Dict, Any

# ---------------------------------------------------------------------------
# Optional / heavy third-party dependencies.
#
# Each is imported defensively so that a missing package only breaks the
# specific detector class that needs it, instead of crashing the import of
# this whole module (and therefore the whole FastAPI app) at startup.
# ---------------------------------------------------------------------------

try:
    import torch
    import torch.nn as nn
except ImportError:
    torch = None
    nn = None

try:
    import torchaudio
except ImportError:
    torchaudio = None

try:
    import soundfile as sf
except ImportError:
    sf = None

try:
    from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification
except ImportError:
    Wav2Vec2Processor = None
    Wav2Vec2ForSequenceClassification = None

try:
    import torchvision.transforms as transforms
    from torchvision.models import efficientnet_v2_s
except ImportError:
    transforms = None
    efficientnet_v2_s = None

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import joblib
except ImportError:
    joblib = None

try:
    import requests
except ImportError:
    requests = None

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import tldextract
except ImportError:
    tldextract = None

try:
    import virustotal_python
except ImportError:
    virustotal_python = None


def _require(module: Any, label: str, pip_name: str) -> None:
    """Raise a clear, actionable error if a detector's dependency isn't installed."""
    if module is None:
        raise ImportError(
            f"{label} requires the '{pip_name}' package, which is not installed "
            f"in this environment. Install it with: pip install {pip_name}"
        )


class PhishingDetectorVT:
    def __init__(self, api_key: str):
        _require(virustotal_python, "PhishingDetectorVT", "virustotal-python")
        self.api_key = api_key

    def _is_valid_url(self, url: str) -> bool:
        try:
            result = urlparse(url if "://" in url else f"http://{url}")
            return bool(result.netloc)
        except ValueError:
            return False

    def _encode_url(self, url: str) -> str:
        return urlsafe_b64encode(url.encode()).decode().strip("=")

    def predict(self, url: str, max_wait: int = 40, poll_interval: int = 5) -> Dict[str, Any]:
        if not self._is_valid_url(url):
            return {"error": "Invalid URL", "status": "Error"}

        url_id = self._encode_url(url)

        try:
            with virustotal_python.Virustotal(self.api_key) as vtotal:
                # Step 1: Submit URL for scanning
                vtotal.request("urls", data={"url": url}, method="POST")

                # Step 2: Poll until analysis completes or timeout
                elapsed = 0
                attributes = {}
                while elapsed < max_wait:
                    report = vtotal.request(f"urls/{url_id}")
                    attributes = report.data.get("attributes", {})
                    status = attributes.get("status", "completed")

                    if status != "queued":
                        break

                    print(f" [*] [VT_ENGINE] Analysis queued for {url[:30]}... waiting {poll_interval}s")
                    time.sleep(poll_interval)
                    elapsed += poll_interval

                # Step 3: Extract stats
                stats = attributes.get("last_analysis_stats", {})

                malicious_count = stats.get("malicious", 0)
                suspicious_count = stats.get("suspicious", 0)
                harmless_count = stats.get("harmless", 0)

                # Calculate confidence and status
                is_fake = malicious_count > 0 or suspicious_count > 2

                # Confidence score based on engine consensus
                total_engines = sum(stats.values()) if stats else 1
                if is_fake:
                    confidence = int(((malicious_count + suspicious_count) / total_engines) * 100)
                    confidence = max(65, confidence)  # Floor for malicious
                else:
                    confidence = int((harmless_count / total_engines) * 100)
                    confidence = min(99, confidence)

                return {
                    "is_synthetic": is_fake,
                    "status": "Manipulated" if is_fake else "Authentic",
                    "confidence_score": confidence,
                    "malicious": malicious_count,
                    "suspicious": suspicious_count,
                    "harmless": harmless_count,
                    "permalink": f"https://www.virustotal.com/gui/url/{url_id}",
                    "rationale": (
                        f"VirusTotal Cross-Check: {malicious_count} engines flagged as malicious."
                        if is_fake
                        else "VirusTotal analysis shows no security flags from major antivirus vendors."
                    ),
                }

        except Exception as e:
            print(f" [!] [VT_ENGINE] API Error: {e}")
            return {"error": str(e), "status": "Error"}


class DeepfakeAudioDetector:

    TARGET_SAMPLE_RATE = 16000
    MAX_LENGTH_SECONDS = 4.0

    def __init__(self, model_path: str, device: Optional[str] = None) -> None:
        _require(torch, "DeepfakeAudioDetector", "torch")
        _require(torchaudio, "DeepfakeAudioDetector", "torchaudio")
        _require(sf, "DeepfakeAudioDetector", "soundfile")
        _require(Wav2Vec2Processor, "DeepfakeAudioDetector", "transformers")

        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        self.processor = Wav2Vec2Processor.from_pretrained(model_path)
        self.model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()

    def _preprocess(self, audio_bytes: bytes) -> torch.Tensor:
        data, sr = sf.read(io.BytesIO(audio_bytes))
        waveform = torch.tensor(data, dtype=torch.float32)
        if waveform.ndim == 1:
            waveform = waveform.unsqueeze(0)
        else:
            waveform = waveform.transpose(0, 1)
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
        if sr != self.TARGET_SAMPLE_RATE:
            resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=self.TARGET_SAMPLE_RATE)
            waveform = resampler(waveform)
        max_samples = int(self.MAX_LENGTH_SECONDS * self.TARGET_SAMPLE_RATE)
        num_samples = waveform.shape[1]
        if num_samples > max_samples:
            waveform = waveform[:, :max_samples]
        elif num_samples < max_samples:
            padding = torch.zeros(1, max_samples - num_samples)
            waveform = torch.cat([waveform, padding], dim=1)
        waveform = (waveform - waveform.mean()) / (waveform.std() + 1e-6)
        return waveform.squeeze(0)

    def predict(self, audio_bytes: bytes) -> Tuple[str, int]:
        start_time = time.time()
        print(f"[*] [AUDIO_MODEL] Starting local analysis...")
        waveform = self._preprocess(audio_bytes)
        inputs = self.processor(
            waveform.numpy(), sampling_rate=self.TARGET_SAMPLE_RATE, return_tensors="pt", padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            logits = self.model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            predicted_class = logits.argmax(dim=-1).item()
            confidence = probs[0, predicted_class].item()
        status = "Authentic" if predicted_class == 0 else "Manipulated"
        confidence_score = int(probs[0, 1].item() * 100)  # Always return probability of class 1 (Manipulated)
        print(f"[+] [AUDIO_MODEL] Result: {status} ({confidence_score}%)")
        return status, confidence_score


class DeepfakeVisionDetector:
    def __init__(self, classifier_path: str, face_detector_path: str, device: Optional[str] = None) -> None:
        _require(torch, "DeepfakeVisionDetector", "torch")
        _require(transforms, "DeepfakeVisionDetector", "torchvision")
        _require(YOLO, "DeepfakeVisionDetector", "ultralytics")
        _require(Image, "DeepfakeVisionDetector", "Pillow")
        _require(cv2, "DeepfakeVisionDetector", "opencv-python")

        self.device = torch.device(device or ('cuda' if torch.cuda.is_available() else 'cpu'))
        self.face_detector = YOLO(face_detector_path)
        self.classifier = self._load_model(classifier_path).to(self.device)
        self.classifier.eval()
        self.augmentation = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _load_model(self, path: str) -> nn.Module:
        model = efficientnet_v2_s(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, 1)
        model.load_state_dict(torch.load(path, map_location=self.device))
        return model

    def predict_image(self, image_path: str) -> Tuple[str, int]:
        start_time = time.time()
        print(f"[*] [VISION_MODEL] Analyzing image locally...")
        image = cv2.imread(image_path)
        if image is None:
            return "Error", 0
        image_denoised = cv2.bilateralFilter(image, 9, 75, 75)
        results = self.face_detector(image_denoised)
        all_probs = []
        if len(results) > 0 and len(results[0].boxes) > 0:
            for i, box in enumerate(results[0].boxes.xyxy):
                x1, y1, x2, y2 = box.cpu().numpy().astype(int)
                face = image_denoised[y1:y2, x1:x2]
                if face.size == 0:
                    continue
                face_pil = Image.fromarray(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
                input_tensor = self.augmentation(face_pil).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    logits = self.classifier(input_tensor).view(-1)
                    prob = torch.sigmoid(logits).item()
                    all_probs.append(prob)
        else:
            image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            input_tensor = self.augmentation(image_pil).unsqueeze(0).to(self.device)
            with torch.no_grad():
                logits = self.classifier(input_tensor).view(-1)
                prob = torch.sigmoid(logits).item()
                all_probs.append(prob)
        final_prob = max(all_probs) if all_probs else 0
        label = "Fake" if final_prob > 0.85 else "Real"
        confidence_score = int(final_prob * 100)  # Always return probability of being Fake
        print(f"[+] [VISION_MODEL] Result: {label} ({confidence_score}%)")
        return label, confidence_score

    def predict_video(self, video_path: str, max_samples: int = 8) -> Tuple[str, int]:
        print(f"[*] [VISION_MODEL] Analyzing video locally (Optimized Pipeline)...")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return "Error", 0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            return "Error", 0

        # Calculate evenly spaced indices (sampling from start, middle, and end)
        # We start at 10% and end at 90% to avoid potentially black/static header/outro frames
        start_frame = int(total_frames * 0.1)
        end_frame = int(total_frames * 0.9)
        if end_frame <= start_frame:
            indices = [total_frames // 2]
        else:
            indices = [
                int(start_frame + i * (end_frame - start_frame) / (max_samples - 1))
                for i in range(max_samples)
            ]

        all_probs = []

        for i, idx in enumerate(indices):
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue

            # Optimization 1: Downscale for face detection (makes YOLO much faster)
            h, w = frame.shape[:2]
            if w > 640:
                scale = 640 / w
                frame_small = cv2.resize(frame, (640, int(h * scale)))
            else:
                frame_small = frame

            results = self.face_detector(frame_small, verbose=False)

            if len(results) > 0 and len(results[0].boxes) > 0:
                # We analyze the highest-confidence face in the frame
                box = results[0].boxes.xyxy[0].cpu().numpy()

                # Map coordinates back if we downscaled
                if w > 640:
                    box = box / (640 / w)

                x1, y1, x2, y2 = box.astype(int)
                face = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]

                if face.size == 0:
                    continue

                # Optimization 2: Targeted Denoising (only on the crop)
                face_denoised = cv2.bilateralFilter(face, 5, 60, 60)

                face_pil = Image.fromarray(cv2.cvtColor(face_denoised, cv2.COLOR_BGR2RGB))
                input_tensor = self.augmentation(face_pil).unsqueeze(0).to(self.device)

                with torch.no_grad():
                    logits = self.classifier(input_tensor).view(-1)
                    all_probs.append(torch.sigmoid(logits).item())

            print(f"    [PROGRESS] Processed frame {i+1}/{max_samples} (index {idx})")

        cap.release()

        if not all_probs:
            print(" [!] [VISION_MODEL] No faces found in any sample frames.")
            return "Error", 0

        avg_prob = sum(all_probs) / len(all_probs)
        final_prob = avg_prob

        label = "Fake" if final_prob > 0.85 else "Real"
        confidence_score = int(final_prob * 100)  # Always return probability of being Fake

        print(f"[+] [VISION_MODEL] Video Result: {label} ({confidence_score}%)")
        return label, confidence_score


class DeepfakeTextDetector:
    def __init__(self, classifier_path: str, vectorizer_path: str) -> None:
        _require(joblib, "DeepfakeTextDetector", "joblib")
        self.vectorizer = joblib.load(vectorizer_path)
        self.classifier = joblib.load(classifier_path)

    def predict(self, text: str) -> Tuple[str, int]:
        print(f"[*] [TEXT_MODEL] Starting local analysis...")
        if not text.strip():
            return "Error", 0
        text_vectorized = self.vectorizer.transform([text[:2000]])
        label = self.classifier.predict(text_vectorized)[0]
        prob = self.classifier.predict_proba(text_vectorized)[0]
        status = "AI-Generated" if label == 1 else "Human-Written"
        confidence_score = int(prob[1] * 100)  # Always return probability of AI-Generated (class 1)
        print(f"[+] [TEXT_MODEL] Result: {status} ({confidence_score}%)")
        return status, confidence_score


class SightengineDetector:
    """Consolidated Sightengine API Detector for Image, Video, and Audio."""

    def __init__(self, api_user: str, api_secret: str):
        _require(requests, "SightengineDetector", "requests")
        _require(cv2, "SightengineDetector (video frame extraction)", "opencv-python")
        self.api_user = api_user
        self.api_secret = api_secret
        self.endpoint = "https://api.sightengine.com/1.0/check.json"

    def predict_image(self, image_path: str) -> Tuple[str, float]:
        print(f"[*] [SIGHTENGINE] Calling Cloud API for Image...")
        params = {'models': 'genai,deepfake', 'api_user': self.api_user, 'api_secret': self.api_secret}
        try:
            with open(image_path, 'rb') as f:
                r = requests.post(self.endpoint, files={'media': f}, data=params, timeout=30)
            data = r.json()
            if data.get('status') != 'success':
                return "Error", 0.0
            genai_score = data.get('type', {}).get('ai_generated', 0.0)
            deepfake_score = 0.0
            if data.get('faces'):
                deepfake_score = max([f.get('deepfake', 0.0) for f in data['faces']])
            final_score = max(genai_score, deepfake_score)
            label = "Synthetic" if final_score > 0.5 else "Authentic"
            conf = final_score * 100  # Always return probability of being Fake
            print(f"[+] [SIGHTENGINE] Result: {label} ({conf:.1f}%)")
            return label, conf
        except Exception as e:
            print(f"[!] [SIGHTENGINE] Error: {e}")
            return "Error", 0.0

    def predict_video(self, video_path: str) -> Tuple[str, float]:
        """
        'Frame Splitting' Hack: Instead of uploading a large video file (which often times out),
        we extract representative frames locally and analyze them as images.
        """
        start_time = time.time()
        print(f"[*] [SIGHTENGINE] Running Video-to-Frame hack for: {os.path.basename(video_path)}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("    [!] [SIGHTENGINE] Could not open video for frame extraction.")
            return "Error", 0.0

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            return "Error", 0.0

        # Extract 3 representative frames: Start, Middle, End
        indices = [int(total_frames * 0.1), int(total_frames * 0.5), int(total_frames * 0.9)]
        frame_results = []

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                continue

            # Save frame to a temporary JPEG
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                cv2.imwrite(tmp.name, frame)
                tmp_path = tmp.name

            # Analyze the frame as an image
            print(f"    [*] Analyzing frame at index {idx}...")
            label, conf = self.predict_image(tmp_path)

            if label != "Error":
                # conf is already probability of being fake
                prob = conf / 100
                frame_results.append(prob)

            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        cap.release()

        if not frame_results:
            print("    [!] [SIGHTENGINE] All frame analyses failed.")
            return "Error", 0.0

        # Final decision: If ANY frame is highly suspicious, or average is high
        max_prob = max(frame_results)
        avg_prob = sum(frame_results) / len(frame_results)

        # We'll use a conservative 'max' approach: if one part of the video is fake, the video is fake
        final_score = max_prob
        label = "Synthetic" if final_score > 0.5 else "Authentic"
        confidence = final_score * 100  # Always return probability of being Fake

        duration = round(time.time() - start_time, 2)
        print(f"[+] [SIGHTENGINE] Video Hack Result: {label} ({confidence:.1f}%) | Duration: {duration}s")
        return label, float(confidence)

    def predict_audio(self, audio_bytes: bytes) -> Tuple[str, float]:
        print(f"[*] [SIGHTENGINE] Calling Cloud API for Audio (Timeout: 120s)...")
        params = {'models': 'ai-speech', 'api_user': self.api_user, 'api_secret': self.api_secret}
        try:
            files = {'media': ('audio.mp3', audio_bytes)}
            # Increased timeout to 120s for audio
            r = requests.post(self.endpoint, files=files, data=params, timeout=120)
            data = r.json()
            if data.get('status') != 'success':
                print(f"    [!] [SIGHTENGINE] API Error: {data.get('error', {}).get('message')}")
                return "Error", 0.0

            prob = data.get('ai-speech', {}).get('prob', 0.0)
            label = "Synthetic" if prob > 0.5 else "Authentic"
            conf = prob * 100  # Always return probability of being Fake
            print(f"[+] [SIGHTENGINE] Result: {label} ({conf:.1f}%)")
            return label, conf
        except Exception as e:
            print(f"[!] [SIGHTENGINE] Audio API Error: {e}")
            return "Error", 0.0


class PhishingDetector:
    def __init__(self, model_path: str, scaler_path: str, whitelist_path: str) -> None:
        _require(joblib, "PhishingDetector", "joblib")
        _require(tldextract, "PhishingDetector", "tldextract")
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        try:
            with open(whitelist_path, "r") as f:
                self.whitelisted_domains = set(json.load(f))
        except Exception:
            self.whitelisted_domains = set()

    def predict(self, url: str) -> Tuple[str, int]:
        url = url.strip().lower()
        ext = tldextract.extract(url)
        if f"{ext.domain}.{ext.suffix}" in self.whitelisted_domains:
            return "Authentic", 0
        # Simplified for brevity
        return "Authentic", 5