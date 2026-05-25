import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { ScanHistory } from '../models/ScanHistory';

const router = Router();

// ==========================================
// ROUTE: GET /api/history
// DESC:  Fetch all past scans for the logged-in user
// ==========================================
router.get('/', protect, async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. req.user is guaranteed to exist here because of the 'protect' middleware
    const userId = req.user!.id;

    // 2. Find all scan reports matching the user ID, sorted by newest first (-1)
    const history = await ScanHistory.find({ userId }).sort({ createdAt: -1 });

    // 3. Return the array cleanly to the TanStack Query handler on the frontend
    return res.json({
      success: true,
      count: history.length,
      data: history
    });
    
  } catch (error) {
    console.error('🔴 History Route Error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving your scan records.'
    });
  }
});

// ==========================================
// ROUTE: DELETE /api/history/:id
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