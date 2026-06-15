import { Router, Request, Response } from 'express';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
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
      // Decodes token using the updated interface without tier properties
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as TJwtPayload;
      
      req.user = {
        id: decoded.id
      };
    } catch (error) {
      console.warn('⚠️ Optional Auth: Token provided but invalid.');
    }
  }
  next();
};

// ==========================================
// ROUTE 0: GET /api/detection/usage
// DESC:    Fetch the current scan usage and total limit for the user/guest
// ==========================================
router.get('/usage', optionalAuth, async (req: Request, res: Response) => {
  try {
    const isLoggedIn = !!req.user;
    const identifier = isLoggedIn ? req.user!.id : (req.ip || req.socket.remoteAddress || 'unknown-guest');
    
    const maxAllowedScans = isLoggedIn ? 8 : 3;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const completedScansCount = await ScanHistory.countDocuments({
      userId: identifier,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    return res.json({
      success: true,
      usage: completedScansCount,
      limit: maxAllowedScans,
      isLoggedIn
    });
  } catch (error) {
    console.error('🔴 Usage Fetch Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error fetching usage stats.' });
  }
});

// Explicit type definitions for incoming request objects
interface RequestUploadBody {
  fileName: string;
  fileType: string;
  mode?: 'audio' | 'image' | 'video' | 'text';
}

interface AnalyzeRequestBody {
  fileUrl?: string;
  url?: string;
  s3Key?: string;
  fileName: string;
  detectionMode: 'audio' | 'image' | 'video' | 'text' | 'phishing';
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

    // Isolate assets cleanly based on their target detection engine context
    const folderPrefix = mode ? `${mode}s` : 'uploads';
    const s3Key = `${folderPrefix}/${Date.now()}-${fileName}`;
    const bucketName = process.env.AWS_BUCKET_NAME || 'truthlens-bucket';

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: fileType,
    });

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
// DESC:    Handoff the uploaded file pointer to the specific Python AI engine path and save results
// ==========================================
router.post('/analyze', optionalAuth, checkRateLimit, async (
  req: Request<{}, {}, AnalyzeRequestBody>, 
  res: Response
): Promise<any> => {
  try {
    const { fileUrl, s3Key, fileName, detectionMode, url } = req.body;

    if (!fileName || !detectionMode || (!fileUrl && !url)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing data payload (fileUrl/url, fileName, detectionMode)' 
      });
    }

    const userId = req.user ? req.user.id : (req.ip || 'unknown-guest');
    const isGuest = !req.user;

    // 1. Map incoming mode parameter directly to the correct Python FastAPI target endpoint URL
    let targetEndpoint = 'predict-council'; 
    
    const pythonServerUrl = `${process.env.PYTHON_AI_URL || 'http://localhost:8000'}`;
    
    // 1.5 Generate a GET presigned URL for the Python backend if we have an s3Key to bypass public access issues
    let accessUrl = fileUrl || url;
    if (s3Key) {
      try {
        const bucketName = process.env.AWS_BUCKET_NAME || 'truthlens-bucket';
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
        });
        accessUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        console.log(`🔑 Generated temporary read access for Python Core: ${s3Key}`);
      } catch (s3Error) {
        console.warn('⚠️ Failed to generate presigned GET URL, falling back to public URL:', (s3Error as Error).message);
      }
    }

    console.log(`🤖 [GATEWAY] Routing token to AI Framework -> [${pythonServerUrl}/${targetEndpoint}]`);
    const displayUrl = accessUrl ? String(accessUrl) : (url || '');
    console.log(`   [ASSET] ${displayUrl.substring(0, 100)}${displayUrl.length > 100 ? '...' : ''}`);
    
    const gatewayStart = Date.now();
    // 2. Transmit standard payload to target AI engine channel
    const aiResponse = await axios.post(`${pythonServerUrl}/${targetEndpoint}`, { 
      fileUrl: accessUrl,
      url: url, // Pass raw URL for phishing
      detectionMode: detectionMode 
    });
    const aiData = aiResponse.data;
    const gatewayDuration = ((Date.now() - gatewayStart) / 1000).toFixed(2);

    console.log(`✅ [GATEWAY] AI Response received in ${gatewayDuration}s`);
    console.log(`   [RESULT] Status: ${aiData.status} | Confidence: ${aiData.confidenceScore || aiData.confidence_score}%`);

    // 3. Normalize state properties
    const rawStatus = (aiData.status || '').toLowerCase();
    const confidenceScore = aiData.confidenceScore ?? aiData.confidence_score ?? 0;
    
    let mappedStatus: 'Authentic' | 'Manipulated' = 'Authentic';
    if (rawStatus === 'fake' || rawStatus === 'synthetic' || rawStatus === 'manipulated' || aiData.is_synthetic === true) {
      mappedStatus = 'Manipulated';
    } else if (rawStatus === 'conflicted' || rawStatus === 'malicious') {
      mappedStatus = confidenceScore > 50 ? 'Manipulated' : 'Authentic';
    }

    // 4. Record metadata metrics inside database cluster
    const finalizedReport = await ScanHistory.create({
      userId,
      isGuest,
      fileName,
      s3Url: fileUrl || url || 'phishing-url-scan',
      s3Key: s3Key || 'phishing-no-s3',
      confidenceScore: confidenceScore,
      status: mappedStatus,
      detectionMode: detectionMode as any,
      analysisBreakdown: {
        pixelAnalysis: aiData.breakdown?.anatomicalAccuracy || aiData.breakdown?.pixelAnalysis || aiData.breakdown?.textureArtifacts || aiData.breakdown?.semanticAnalysis || aiData.breakdown?.urlAnalysis || 0,
        compression: aiData.breakdown?.lightingConsistency || aiData.breakdown?.vocalConsistency || aiData.breakdown?.compression || aiData.breakdown?.globalCoherence || aiData.breakdown?.stylisticAnalysis || aiData.breakdown?.domainReputation || 0,
        frequency: aiData.breakdown?.backgroundCoherence || aiData.breakdown?.breathPatterns || aiData.breakdown?.frequency || aiData.breakdown?.frameConsistency || aiData.breakdown?.structuralHeuristics || 0,
        metadata: aiData.breakdown?.boundaryArtifacts || aiData.breakdown?.backgroundNoise || aiData.breakdown?.metadata || 0,
      }
    });

    return res.json({
      success: true,
      data: finalizedReport,
      analysis_duration: aiData.analysis_duration,
      message: aiData.rationale || undefined
    });

  } catch (error: any) {
    if (error.response) {
      console.error(`🔴 Python AI Endpoint Error [Status ${error.response.status}]:`, error.response.data);
      
      if (error.response.status === 422) {
        return res.status(422).json({
          success: false,
          message: 'Analysis failed: The media format is unreadable or no facial subjects were detected.'
        });
      }
    }

    console.error('🔴 General AI Gateway Connection Failure:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'The AI deepfake engine failed to parse this asset. Please try again later.' 
    });
  }
});

export default router;