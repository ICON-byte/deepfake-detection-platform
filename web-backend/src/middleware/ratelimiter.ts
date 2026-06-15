import { Request, Response, NextFunction } from 'express';
import { ScanHistory } from '../models/ScanHistory';

export const checkRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // 1. Identify context status and assign thresholds
    const isLoggedIn = !!req.user;
    const identifier = isLoggedIn ? req.user!.id : (req.ip || req.socket.remoteAddress || 'unknown-guest');
    
    // Dynamic cap allocation: Logged in users get 8, Guests get 3
    const maxAllowedScans = isLoggedIn ? 8 : 3;

    // 2. Define the rolling 24-hour window boundaries
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 3. Query how many scans this identifier (ID or IP) has performed
    const completedScansCount = await ScanHistory.countDocuments({
      userId: identifier,
      createdAt: { $gte: twentyFourHoursAgo },
    });

    // 4. If they hit or cross their threshold, reject the request
    if (completedScansCount >= maxAllowedScans) {
      const errorMessage = isLoggedIn
        ? `You have reached your daily limit of ${maxAllowedScans} scans.`
        : `You have reached your guest limit of ${maxAllowedScans} free scans. Please create an account or log in to get more scans!`;

      return res.status(429).json({
        success: false,
        message: errorMessage,
        scansUsed: completedScansCount,
        limit: maxAllowedScans,
      });
    }

    // 5. Under the limit, proceed to backend analysis execution
    return next();
  } catch (error) {
    console.error('🔴 Rate Limiter Error:', (error as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error evaluating platform rate thresholds.',
    });
  }
};