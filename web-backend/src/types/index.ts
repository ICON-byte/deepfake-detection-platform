import { Request } from 'express';

// Define the custom shape of the User payload stored inside the JWT
export type TJwtPayload = {
  id: string; // The MongoDB ObjectId of the user
  role: 'user'; // No extra tiers, just a registered standard user
  iat?: number; 
  exp?: number; 
};

// Extend Express's global declaration space to add the 'user' object to requests
declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload; // Optional because guest sessions won't have it
    }
  }
}