import { Request, Response, NextFunction } from 'express';
import { ScanHistory } from '../models/ScanHistory';

export const checkRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    let userId: string;
    let tier: 'guest' | 'free' | 'pro' | 'premium' | 'enterprise' = 'guest';

    // 1. Determine identity: Logged in (JWT payload exists) vs. Anonymous Guest (fallback to IP)
    if (req.user) {
      userId = req.user.id;
      tier = req.user.tier;
    } else {
      // Fallback to the client IP address for guests
      userId = req.ip || req.socket.remoteAddress || 'unknown-guest';
    }

    // 2. Map limits explicitly to all our updated tiers
    const limits = {
      guest: 3,
      free: 5,
      pro: 30,
      premium: 100,
      enterprise: 1000,
    };

    const maxAllowedScans = limits[tier];

    // 3. Define the boundary for a rolling 24-hour window (Current Time minus 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 4. Query MongoDB to count matching scan histories within the rolling timeframe
    const scanCount = await ScanHistory.countDocuments({
      userId: userId,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    // 5. If they've hit or crossed their limit, block execution
    if (scanCount >= maxAllowedScans) {
      return res.status(429).json({
        success: false,
        message: `You have reached your limit of ${maxAllowedScans} scans per 24 hours for the ${tier} tier.`,
        tier: tier,
        scansUsed: scanCount,
        limit: maxAllowedScans,
      });
    }

    // 6. Under the limit! Proceed cleanly to the controller execution
    return next();
  } catch (error) {
    console.error('🔴 Rate Limiter Error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error evaluating platform rate thresholds.',
    });
  }
};