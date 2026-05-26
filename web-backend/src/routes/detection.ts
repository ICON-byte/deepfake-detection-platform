import { Router, Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { s3Client } from '../config/S3';
import { checkRateLimit } from '../middleware/ratelimiter';
import { ScanHistory } from '../models/ScanHistory';
import jwt from 'jsonwebtoken';
import { TJwtPayload } from '../types';

const router = Router();

// HELPER MIDDLEWARE: Checks if a user is logged in, but doesn't block them if they are a guest
const optionalAuth = (req: Request, res: Response, next: any) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TJwtPayload;
      req.user = decoded;
    } catch (error) {
      // Token failed, but we let them proceed as a guest instead of crashing
      console.warn('⚠️ Optional Auth: Token provided but invalid.');
    }
  }
  next();
};

// Explicit type parameters for Request Bodies
interface RequestUploadBody {
  fileName: string;
  fileType: string;
  mode?: 'face' | 'media' | 'audio';
}

interface AnalyzeRequestBody {
  fileUrl: string;
  s3Key: string;
  fileName: string;
  detectionMode: 'face' | 'media' | 'audio';
}

// ==========================================
// ROUTE 1: POST /api/detection/request-upload
// DESC:    Generate a secure presigned URL for direct frontend-to-S3 uploads
// ==========================================
router.post('/request-upload', optionalAuth, checkRateLimit, async (
  req: Request<{}, {}, RequestUploadBody>, 
  res: Response
): Promise<any> => {
  try {
    const { fileName, fileType, mode } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing file details (fileName, fileType)' });
    }

    // Generate a unique key for the cloud bucket to avoid naming collisions
    // Appending mode profile helps organize asset distributions within S3 buckets neatly
    const folderPrefix = mode ? `${mode}s` : 'uploads';
    const s3Key = `${folderPrefix}/${Date.now()}-${fileName}`;
    const bucketName = process.env.AWS_BUCKET_NAME || 'truthlens-bucket';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: fileType,
    });

    // Create an upload link that expires in 15 minutes (900 seconds)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicFileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;

    return res.json({
      success: true,
      presignedUrl,
      s3Key,
      fileUrl: publicFileUrl
    });

  } catch (error) {
    console.error('🔴 Presigned URL Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Server error generating cloud storage access.' });
  }
});

// ==========================================
// ROUTE 2: POST /api/detection/analyze
// DESC:    Handoff the uploaded file pointer to Python AI and save results
// ==========================================
router.post('/analyze', optionalAuth, checkRateLimit, async (
  req: Request<{}, {}, AnalyzeRequestBody>, 
  res: Response
): Promise<any> => {
  try {
    const { fileUrl, s3Key, fileName, detectionMode } = req.body;

    if (!fileUrl || !s3Key || !fileName || !detectionMode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing data payload (fileUrl, s3Key, fileName, detectionMode)' 
      });
    }

    // Define account identities for MongoDB record keeping
    const userId = req.user ? req.user.id : (req.ip || 'unknown-guest');
    const isGuest = !req.user;

    // 1. Send the file URL and contextual detection mode parameter to the Python FastAPI server
    const pythonServerUrl = `${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/predict`;
    
    console.log(`🤖 Node server forwarding to Python AI [Mode: ${detectionMode}]: ${fileUrl}`);
    
    const aiResponse = await axios.post(pythonServerUrl, { 
      fileUrl,
      detectionMode // Forward mode structure so Python maps to specialized neural networks
    });
    const aiData = aiResponse.data;

    /* We expect the Python team to return this structure:
      {
        "confidenceScore": 88,
        "status": "Manipulated",
        "breakdown": { "pixelAnalysis": 90, "compression": 85, "frequency": 92, "metadata": 85 }
      }
    */

    // 2. Persist the deepfake intelligence metrics into MongoDB, including new mode parameters
    const finalizedReport = await ScanHistory.create({
      userId,
      isGuest,
      fileName,
      s3Url: fileUrl,
      s3Key,
      confidenceScore: aiData.confidenceScore,
      status: aiData.status,
      detectionMode, // Saved directly to match updated Schema
      analysisBreakdown: {
        pixelAnalysis: aiData.breakdown?.pixelAnalysis ?? 0,
        compression: aiData.breakdown?.compression ?? 0,
        frequency: aiData.breakdown?.frequency ?? 0,
        metadata: aiData.breakdown?.metadata ?? 0,
      }
    });

    // 3. Return the saved record to TanStack query to render immediate graphics
    return res.json({
      success: true,
      data: finalizedReport
    });

  } catch (error: any) {
    console.error('🔴 AI Microservice Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'The AI deepfake engine failed to parse this asset. Please try again later.' 
    });
  }
});

export default router;