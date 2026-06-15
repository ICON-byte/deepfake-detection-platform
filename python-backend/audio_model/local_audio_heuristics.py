import wave
import math
import collections
import os
import numpy as np

def calculate_shannon_entropy(data):
    """
    Calculates the Shannon Entropy of raw binary data.
    Entropy measures the 'unpredictability' of the byte distribution.
    """
    if not data:
        return 0
    
    # Count occurrences of each byte value (0-255)
    counts = collections.Counter(data)
    total_len = len(data)
    
    # Calculate probabilities and apply Shannon Entropy formula: -sum(p * log2(p))
    entropy = 0
    for count in counts.values():
        p = count / total_len
        if p > 0:
            entropy -= p * math.log2(p)
    
    return entropy

def analyze_silence_ratio(file_path):
    """
    Calculates the ratio of silent frames to active frames in a WAV file.
    Uses numpy for efficient array processing of raw PCM data.
    """
    try:
        with wave.open(file_path, 'rb') as wav:
            # Get basic params
            n_frames = wav.getnframes()
            sample_rate = wav.getframerate()
            
            # Read all frames as bytes and convert to numpy array
            raw_data = wav.readframes(n_frames)
            
            # Assuming 16-bit PCM (standard for most TTS)
            # 'int16' matches the 2-byte width
            dtype = np.int16
            samples = np.frombuffer(raw_data, dtype=dtype)
            
            if len(samples) == 0:
                return 0
            
            # Normalize samples to range [-1, 1]
            samples = samples.astype(np.float32) / 32768.0
            
            # Process in 100ms chunks
            chunk_size = int(sample_rate * 0.1)
            if chunk_size == 0:
                return 0
                
            n_chunks = len(samples) // chunk_size
            if n_chunks == 0:
                return 0
                
            # Reshape into chunks and calculate RMS energy per chunk
            chunks = samples[:n_chunks * chunk_size].reshape(n_chunks, chunk_size)
            rms_energies = np.sqrt(np.mean(np.square(chunks), axis=1))
            
            # Threshold for silence: -40dB relative to full scale
            # RMS 0.01 is roughly -40dB
            silence_threshold = 0.01
            silent_chunks = np.sum(rms_energies < silence_threshold)
            
            return (silent_chunks / n_chunks)
    except Exception as e:
        print(f"⚠️ Silence Analysis Error: {e}")
        return 0

def check_id3_tag(file_path):
    """
    Checks for the presence of ID3v1 or ID3v2 tags in an MP3 file.
    AI generators typically output raw frames without metadata.
    """
    try:
        with open(file_path, 'rb') as f:
            header = f.read(3)
            # ID3v2 tag starts with 'ID3'
            if header == b'ID3':
                return True
            
            # Check for ID3v1 at the end of the file (last 128 bytes)
            f.seek(-128, os.SEEK_END)
            footer = f.read(3)
            if footer == b'TAG':
                return True
                
        return False
    except:
        return False

def analyze_audio_heuristics(file_path: str):
    """
    Core Heuristic Engine: Analyzes audio files for synthetic structural signatures.
    Returns a detailed breakdown of results and a total unweighted score.
    """
    report = {
        "file": os.path.basename(file_path),
        "extension": os.path.splitext(file_path)[1].lower(),
        "signals": {},
        "scores": {},
        "total_heuristic_score": 0
    }
    
    try:
        # Read raw bytes once for entropy and metadata checks
        with open(file_path, 'rb') as f:
            raw_bytes = f.read()
            
        # 1. WAV Header Analysis
        if report["extension"] == ".wav":
            try:
                with wave.open(file_path, 'rb') as wav:
                    sample_rate = wav.getframerate()
                    channels = wav.getnchannels()
                    sampwidth = wav.getsampwidth() # bytes per sample
                    
                    # Check Rule 1.1: Common TTS sample rates (22.05k, 24k) and Mono
                    is_tts_rate = sample_rate in [22050, 24000]
                    is_mono = channels == 1
                    
                    if is_tts_rate and is_mono:
                        report["signals"]["tts_sample_rate_mono"] = True
                        report["scores"]["header_rate_mono"] = 72
                        
                        # Check Rule 1.2: Bit depth check (16-bit = 2 bytes)
                        if sampwidth == 2:
                            report["signals"]["tts_16bit_precision"] = True
                            report["scores"]["header_bit_depth"] = 60
            except Exception as e:
                report["signals"]["header_parse_error"] = str(e)

        # 2. Shannon Byte Entropy
        entropy = calculate_shannon_entropy(raw_bytes)
        report["signals"]["byte_entropy"] = round(entropy, 4)
        
        # Rule 2.1: Precise range (7.80 - 7.96) indicates highly uniform AI distribution
        if 7.80 <= entropy <= 7.96:
            report["signals"]["uniform_entropy_detected"] = True
            report["scores"]["byte_entropy"] = 62

        # 3. Silence Ratio Analysis (Targeted at WAV/PCM structure)
        if report["extension"] == ".wav":
            silence_ratio = analyze_silence_ratio(file_path)
            report["signals"]["silence_ratio"] = round(silence_ratio, 4)
            
            # Rule 3.1: Structured silence (2% - 15%) typical of generative pacing
            if 0.02 <= silence_ratio <= 0.15:
                report["signals"]["structured_silence_detected"] = True
                report["scores"]["silence_pacing"] = 58

        # 4. ID3 Metadata Check (for MP3)
        if report["extension"] == ".mp3":
            has_id3 = check_id3_tag(file_path)
            report["signals"]["has_metadata_tags"] = has_id3
            
            # Rule 4.1: Missing metadata is a sign of raw synthetic output
            if not has_id3:
                report["signals"]["missing_metadata_heuristic"] = True
                report["scores"]["metadata_check"] = 55

        # Aggregate final score
        report["total_heuristic_score"] = sum(report["scores"].values())
        
    except Exception as e:
        report["status"] = "Error"
        report["error_message"] = str(e)
        
    return report

if __name__ == "__main__":
    # Test stub for standalone verification
    import sys
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        if os.path.exists(test_file):
            results = analyze_audio_heuristics(test_file)
            import json
            print(json.dumps(results, indent=2))
        else:
            print("File not found.")
