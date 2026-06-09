import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TJwtPayload } from '../types';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  let token: string | undefined;

  // 1. Check if the Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token string
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your secret key
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret'
      ) as TJwtPayload;

      // 3. Attach only the decoded user id to the request object
      req.user = {
        id: decoded.id,
      };

      // Pass control to the next middleware or route handler
      return next();
    } catch (error) {
      console.error('🔴 JWT Verification Error:', (error as Error).message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  // 4. If no token is provided at all, return an authorization error
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};