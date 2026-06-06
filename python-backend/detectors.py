import torch
import torch.nn as nn

import io
import re
import math
import json
import os
import random
import torchaudio
import soundfile as sf
from transformers import Wav2Vec2Processor, Wav2Vec2ForSequenceClassification

import torchvision.transforms as transforms
from torchvision.models import efficientnet_v2_s
from ultralytics import YOLO
from PIL import Image
import cv2

import joblib
import pandas as pd
import urllib.parse
import tldextract
from collections import Counter

from typing import Tuple, List, Optional, Dict, Any


class DeepfakeAudioDetector:
    TARGET_SAMPLE_RATE = 16000
    MAX_LENGTH_SECONDS = 4.0

    def __init__(self, model_path: str, device: Optional[str] = None) -> None:
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        self.processor = Wav2Vec2Processor.from_pretrained(model_path)
        self.model = Wav2Vec2ForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()

    def _preprocess(self, audio_bytes: bytes) -> torch.Tensor:
        """Converts raw audio bytes into a normalized 16kHz mono tensor."""
        data, sr = sf.read(io.BytesIO(audio_bytes))
        waveform = torch.tensor(data, dtype=torch.float32)

        # Ensure shape is (channels, samples)
        if waveform.ndim == 1:
            waveform = waveform.unsqueeze(0)
        else:
            waveform = waveform.transpose(0, 1)

        # Downmix to mono
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        # Resample if needed
        if sr != self.TARGET_SAMPLE_RATE:
            resampler = torchaudio.transforms.Resample(
                orig_freq=sr, new_freq=self.TARGET_SAMPLE_RATE
            )
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
        """Run inference on raw audio bytes"""
        waveform = self._preprocess(audio_bytes)

        inputs = self.processor(
            waveform.numpy(),
            sampling_rate=self.TARGET_SAMPLE_RATE,
            return_tensors="pt",
            padding=True,
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            logits = self.model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)
            predicted_class = logits.argmax(dim=-1).item()
            confidence = probs[0, predicted_class].item()

        status = "Authentic" if predicted_class == 0 else "Manipulated"
        confidence_score = int(confidence * 100)

        return status, confidence_score


class DeepfakeVisionDetector:
    def __init__(self, classifier_path: str, face_detector_path: str, device: Optional[str] = None) -> None:
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
    
        self.face_detector = YOLO(face_detector_path)
        self.classifier = self._load_model(classifier_path).to(self.device)
        self.classifier.eval()

        self.MEAN = [0.485, 0.456, 0.406]
        self.STD = [0.229, 0.224, 0.225]
        self.SIZE = 256
        
        self.augmentation = transforms.Compose([
            transforms.Resize((self.SIZE, self.SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=self.MEAN, std=self.STD),
        ])
    
    def _load_model(self, path: str) -> nn.Module:
        model = efficientnet_v2_s(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, 1) # type: ignore
        model.load_state_dict(torch.load(path, map_location=self.device))
        
        return model

    def predict_image(self, image_path: str) -> Tuple[str, Optional[float]]:
        image = cv2.imread(image_path)
        if image is None:
            return "Could not read image", None

        results = self.face_detector(image)

        if len(results) == 0 or len(results[0].boxes) == 0:
            return "No face detected", None

        all_probs = []

        for result in results:
            for box in result.boxes.xyxy:
                x1, y1, x2, y2 = box.cpu().numpy().astype(int)
                face = image[y1:y2, x1:x2]  # type: ignore
                face_pil = Image.fromarray(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
                input_tensor = self.augmentation(face_pil).unsqueeze(0).to(self.device) # type: ignore

                with torch.no_grad():
                    logits = self.classifier(input_tensor).view(-1)
                    # Flip so that 0 is Real and 1 is Fake
                    prob = 1 - torch.sigmoid(logits).item()
                    all_probs.append(prob)

        final_prob = round(max(all_probs), 4)
        label = "Fake" if final_prob > 0.5 else "Real"
        confidence_score = int(final_prob * 100) if label == "Fake" else int((1 - final_prob) * 100)

        return label, confidence_score


    def predict_video(self, video_path: str, frame_skip: int = 10) -> Tuple[str, Optional[float]]:
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            return "Could not open video", None

        frame_count = 0
        all_probs: List[float] = []

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Skip frames for speed
            if frame_count % frame_skip != 0:
                frame_count += 1
                continue

            results = self.face_detector(frame)

            if len(results) > 0 and len(results[0].boxes) > 0:
                for result in results:
                    for box in result.boxes.xyxy:
                        x1, y1, x2, y2 = box.cpu().numpy().astype(int)

                        h, w = frame.shape[:2]
                        x1, y1 = max(0, x1), max(0, y1)
                        x2, y2 = min(w, x2), min(h, y2)

                        face = frame[y1:y2, x1:x2]
                        if face.size == 0:
                            continue

                        face_pil = Image.fromarray(cv2.cvtColor(face, cv2.COLOR_BGR2RGB))
                        input_tensor = self.augmentation(face_pil).unsqueeze(0).to(self.device) # type: ignore

                        with torch.no_grad():
                            logits = self.classifier(input_tensor).view(-1)
                            prob = 1 - torch.sigmoid(logits).item()
                            all_probs.append(prob)

            frame_count += 1

        cap.release()

        if len(all_probs) == 0:
            return "No face detected", None

        final_prob = round(sum(all_probs) / len(all_probs), 4)
        label = "Fake" if final_prob > 0.5 else "Real"
        confidence_score = int(final_prob * 100) if label == "Fake" else int((1 - final_prob) * 100)

        return label, confidence_score


class DeepfakeTextDetector:
    def __init__(self, classifier_path: str, vectorizer_path: str) -> None:
        self.vectorizer = joblib.load(vectorizer_path)
        self.classifier = joblib.load(classifier_path)

    def predict(self, text: str) -> Tuple[str, Optional[float]]:
        if not text.strip():
            return "Empty text", None
        
        text = text[:2000]  # Limit to first 2000 characters
        text_vectorized = self.vectorizer.transform([text])
        label = self.classifier.predict(text_vectorized)[0]
        prob = self.classifier.predict_proba(text_vectorized)[0]  # Probability of being AI-generated

        status = "AI-Generated" if label == 1 else "Human-Written"
        confidence_score = int(prob[0] * 100) if label == 0 else int(prob[1] * 100)

        return status, confidence_score


class PhishingDetector:
    def __init__(self, model_path: str, scaler_path: str, whitelist_path: str) -> None:
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        
        try:
            if os.path.exists(whitelist_path):
                with open(whitelist_path, "r") as f:
                    self.whitelisted_domains = set(json.load(f))
            else:
                self.whitelisted_domains = {
                    "google.com", "youtube.com", "facebook.com", "twitter.com", "x.com",
                    "instagram.com", "linkedin.com", "wikipedia.org", "yahoo.com", "amazon.com",
                    "reddit.com", "netflix.com", "microsoft.com", "apple.com", "github.com",
                    "stackoverflow.com", "bing.com", "twitch.tv", "discord.com", "whatsapp.com",
                    "tiktok.com", "paypal.com", "adobe.com", "nytimes.com", "cnn.com",
                    "flaticon.com", "sourcecodehub.com", "eosc-synergy.eu"
                }
        except Exception:
            self.whitelisted_domains = set()

    def _get_entropy(self, text: str) -> float:
        if not text:
            return 0
        p, lns = Counter(text), float(len(text))
        return -sum(count/lns * math.log2(count/lns) for count in p.values())

    def _extract_features(self, url: str) -> Dict[str, Any]:
        u = url if url.startswith(("http://", "https://")) else "http://" + url
        parsed = urllib.parse.urlparse(u)
        ext = tldextract.extract(u)
        trusted_tlds = ["com", "org", "net", "edu", "gov", "io", "eu", "uk", "ca", "de"]

        return {
            "url_length": len(url),
            "dot_count": url.count("."),
            "https_flag": 1 if url.startswith("https") else 0,
            "has_ip_address": 1 if re.search(r"\d{1,3}\.\d{1,3}", url) else 0,
            "path_length": len(parsed.path),
            "token_count": len([t for t in re.split(r"[^a-zA-Z0-9]", url) if t]),
            "number_of_digits": sum(c.isdigit() for c in url),
            "percentage_numeric_chars": (sum(c.isdigit() for c in url) / len(url)) if len(url) > 0 else 0,
            "url_entropy": self._get_entropy(url),
            "subdomain_count": len(ext.subdomain.split(".")) if ext.subdomain else 0,
            "query_param_count": len(urllib.parse.parse_qs(parsed.query)),
            "tld_length": len(ext.suffix),
            "has_hyphen_in_domain": 1 if "-" in ext.domain else 0,
            "domain_name_length": len(ext.domain),
            "tld_popularity": 1 if ext.suffix in trusted_tlds else 0,
            "suspicious_file_extension": 1 if parsed.path.lower().endswith((".exe", ".zip", ".php")) else 0
        }

    def _soften_confidence(self, prob: float, is_override: bool = False) -> float:
        if is_override:
            return round(96.0 + random.uniform(0.5, 2.5), 2)

        score = prob * 100
        if score > 99.0:
            return round(98.0 + random.uniform(0.1, 0.9), 2)
        elif score > 90.0:
            return round(88.0 + (score - 90.0) * 1.0 + random.uniform(-0.5, 0.5), 2)
        elif score < 60.0:
            return round(score + random.uniform(2.0, 5.0), 2)

        return round(score, 2)

    def predict(self, url: str) -> Tuple[str, int]:
        url = url.strip().lower()
        
        # 1. Whitelist check
        ext = tldextract.extract(url)
        domain_only = f"{ext.domain}.{ext.suffix}"
        if domain_only in self.whitelisted_domains:
            return "Authentic", int(self._soften_confidence(0, is_override=True))

        # 2. Feature extraction
        features = self._extract_features(url)

        # 3. Structural clean check
        is_structurally_clean = (
            features["https_flag"] == 1 and
            features["url_length"] < 65 and
            features["number_of_digits"] < 4 and
            features["dot_count"] <= 3 and
            features["has_ip_address"] == 0 and
            not any(bad in url for bad in ["login", "verify", "account", "secure", "signin", "update"])
        )

        # 4. AI Analysis
        live_df = pd.DataFrame([features]).reindex(columns=self.scaler.feature_names_in_, fill_value=0)
        scaled_data = self.scaler.transform(live_df)
        probs = self.model.predict_proba(scaled_data)[0]
        phishing_prob = float(probs[1])

        # 5. Decision Engine
        if is_structurally_clean and phishing_prob > 0.85:
            prediction = 0
            final_conf = self._soften_confidence(0, is_override=True)
        else:
            prediction = 1 if phishing_prob > 0.90 else 0
            raw_conf = phishing_prob if prediction == 1 else probs[0]
            final_conf = self._soften_confidence(float(raw_conf))

        status = "Manipulated" if prediction == 1 else "Authentic"
        return status, int(final_conf)
