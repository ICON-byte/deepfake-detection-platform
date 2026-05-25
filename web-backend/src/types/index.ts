import { Request } from 'express';

// Define the custom shape of the User payload stored inside the JWT
export interface TJwtPayload {
  id: string;
  tier: 'free' | 'pro' | 'premium' | 'enterprise';
}

// Extend Express's global declaration space to add the 'user' object to requests
declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload; // Marked as optional because guest sessions won't have it
    }
  }
}