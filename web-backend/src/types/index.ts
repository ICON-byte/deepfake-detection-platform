import { Request } from 'express';

// Define the custom shape of the User payload stored inside the JWT
export type TJwtPayload = {
  id: string;                                                 // The MongoDB ObjectId of the user
  tier: 'guest' | 'free' | 'pro' | 'premium' | 'enterprise'; // The account subscription level
  iat?: number;                                               // "Issued At" timestamp (automatically added by JWT)
  exp?: number;                                               // "Expiration" timestamp (automatically added by JWT)
};

// Extend Express's global declaration space to add the 'user' object to requests
declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload; // Marked as optional because guest sessions won't have it
    }
  }
}