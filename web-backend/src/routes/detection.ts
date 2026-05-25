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

// ==========================================
// ROUTE 1: POST /api/detection/request-upload
// DESC:    Generate a secure presigned URL for direct frontend-to-S3 uploads
// ==========================================
router.post('/request-upload', optionalAuth, checkRateLimit, async (req: Request, res: Response): Promise<any> => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing file details (fileName, fileType)' });
    }

    // Generate a unique key for the cloud bucket to avoid naming collisions
    const s3Key = `uploads/${Date.now()}-${fileName}`;
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
router.post('/analyze', optionalAuth, checkRateLimit, async (req: Request, res: Response): Promise<any> => {
  try {
    const { fileUrl, s3Key, fileName } = req.body;

    if (!fileUrl || !s3Key || !fileName) {
      return res.status(400).json({ success: false, message: 'Missing data payload (fileUrl, s3Key, fileName)' });
    }

    // Define account identities for MongoDB record keeping
    const userId = req.user ? req.user.id : (req.ip || 'unknown-guest');
    const isGuest = !req.user;

    // 1. Send the file URL to the Python FastAPI server for heavy processing
    const pythonServerUrl = `${process.env.PYTHON_AI_URL || 'http://localhost:8000'}/predict`;
    
    console.log(`🤖 Node server forwarding to Python AI: ${fileUrl}`);
    
    const aiResponse = await axios.post(pythonServerUrl, { fileUrl });
    const aiData = aiResponse.data;

    /* We expect the Python team to return this structure:
      {
        "confidenceScore": 88,
        "status": "Manipulated",
        "breakdown": { "pixelAnalysis": 90, "compression": 85, "frequency": 92, "metadata": 85 }
      }
    */

    // 2. Persist the deepfake intelligence metrics into MongoDB
    const finalizedReport = await ScanHistory.create({
      userId,
      isGuest,
      fileName,
      s3Url: fileUrl,
      s3Key,
      confidenceScore: aiData.confidenceScore,
      status: aiData.status,
      analysisBreakdown: {
        pixelAnalysis: aiData.breakdown.pixelAnalysis,
        compression: aiData.breakdown.compression,
        frequency: aiData.breakdown.frequency,
        metadata: aiData.breakdown.metadata,
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