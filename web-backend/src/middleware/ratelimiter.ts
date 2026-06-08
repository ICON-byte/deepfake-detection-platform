import { Request, Response, NextFunction } from 'express';
import { ScanHistory } from '../models/ScanHistory';

export const checkRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // 1. If the user is authenticated, bypass the guest restriction entirely
    if (req.user) {
      return next();
    }

    // 2. Track guest identity via IP fallback
    const guestId = req.ip || req.socket.remoteAddress || 'unknown-guest';
    const maxAllowedScans = 3;

    // 3. Define the rolling 24-hour window boundaries
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 4. Query how many scans this guest IP has performed
    const guestScanCount = await ScanHistory.countDocuments({
      userId: guestId,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    // 5. If they hit or cross the free limit, stop them cold
    if (guestScanCount >= maxAllowedScans) {
      return res.status(429).json({
        success: false,
        message: 'You have reached your limit of 3 free scans per 24 hours. Please create an account or log in to continue using TruthLens.',
        scansUsed: guestScanCount,
        limit: maxAllowedScans,
      });
    }

    // 6. Under the limit, proceed to backend analysis execution
    return next();
  } catch (error) {
    console.error('🔴 Rate Limiter Error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error evaluating platform rate thresholds.',
    });
  }
};