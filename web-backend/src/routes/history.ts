import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { ScanHistory } from '../models/ScanHistory';

const router = Router();

// ==========================================
// ROUTE: GET /api/telemetry/history
// DESC:  Fetch all past scans formatted for the TanStack Router loader
// ==========================================
router.get('/', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. req.user is guaranteed to exist here because of the 'protect' middleware
    const userId = req.user!.id;

    // 2. Find all scan reports matching the user ID, sorted by newest first (-1)
    const history = await ScanHistory.find({ userId }).sort({ createdAt: -1 }).lean();

    // 3. Normalize database models into the exact interface shape TanStack expects
    const formattedHistory = history.map((item: any) => {
      
      // Map DB 'Authentic'/'Manipulated' strings cleanly to frontend lowercase badges
      let status: 'real' | 'manipulated' | 'suspicious' | 'phishing' = 'real';
      if (item.status === 'Manipulated') {
        status = 'manipulated';
      }

      // Map backend core detection pipelines into frontend filter buckets
      let type: 'deepfake' | 'aigen' | 'phishing' = 'deepfake';
      if (item.detectionMode === 'text') {
        type = 'phishing'; // Groups text analyses under Phishing or AI Content depending on intent
      }

      // Generate a detailed analytical sentence using the breakdown values for the frontend card
      const detailsText = item.analysisBreakdown 
        ? `Analysis breakdown metrics — Pixels: ${item.analysisBreakdown.pixelAnalysis}%, Compression: ${item.analysisBreakdown.compression}%, Frequencies: ${item.analysisBreakdown.frequency}%.`
        : 'Deep technical core analysis finished successfully.';

      return {
        id: item._id.toString(),
        type,
        mediaName: item.fileName, // Maps 'fileName' from your Mongoose schema
        date: item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date(item.createdAt).toISOString(),
        status,
        confidence: item.confidenceScore, // Maps 'confidenceScore' from your schema
        details: detailsText,
        thumbnail: undefined // Can point to a dynamic AWS S3 link if thumbnails are generated down the line
      };
    });

    // 4. Return the raw array directly to match: return await response.json()
    return res.json(formattedHistory);
    
  } catch (error) {
    console.error('🔴 History Route Error:', (error as Error).message);
    return res.status(500).json([]); // Return empty fallback array on error to prevent layout crashes
  }
});

// ==========================================
// ROUTE: DELETE /api/telemetry/history/clear
// DESC:  Permanently wipe all scan logs belonging to the active user
// ==========================================
router.delete('/clear', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;

    // Remove all history documents connected to this user
    await ScanHistory.deleteMany({ userId });

    return res.json({
      success: true,
      message: 'All historical telemetry analysis records wiped clean.'
    });

  } catch (error) {
    console.error('🔴 Bulk History Clear Failure:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Server error while dropping bulk database entries.'
    });
  }
});

// ==========================================
// ROUTE: DELETE /api/telemetry/history/:id
// DESC:  Delete a specific scan record from the user's dashboard history
// ==========================================
router.delete('/:id', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user!.id;
    const scanId = req.params.id;

    // 1. Locate the record and confirm ownership before executing a deletion
    const scan = await ScanHistory.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan record not found or unauthorized access.'
      });
    }

    // 2. Remove the document from MongoDB
    await scan.deleteOne();

    return res.json({
      success: true,
      message: 'Scan history entry deleted successfully.'
    });

  } catch (error) {
    console.error('🔴 History Deletion Error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Server error during structural records deletion.'
    });
  }
});

export default router;