import { api } from './axiosClient';
import axios from 'axios';

export const handleFullScanFlow = async (file: File, onProgress: (progress: number) => void) => {
  // 1. Fetch AWS clearance credentials from Node.js
  const clearanceResponse = await api.post('/detection/request-upload', {
    fileName: file.name,
    fileType: file.type
  });
  
  const { presignedUrl, fileUrl, s3Key } = clearanceResponse.data;

  // 2. Direct binary push stream bypassing node server constraints
  await axios.put(presignedUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
      onProgress(percentCompleted); // Bubbles update values back to React view state
    }
  });

  // 3. Initiate analysis loops across your Python workers
  const analysisResponse = await api.post('/detection/analyze', {
    fileUrl,
    s3Key,
    fileName: file.name,
    detectionMode: file.type.startsWith('audio') ? 'audio' : (file.type.startsWith('video') ? 'media' : 'face')
  });

  return analysisResponse.data.data;
  };

  export const handleUrlScanFlow = async (url: string) => {
  const analysisResponse = await api.post('/detection/analyze', {
    url,
    detectionMode: 'phishing'
  });

  return analysisResponse.data.data;
  };