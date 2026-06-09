import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

// Helper function to generate signed JWTs (Stripped down to only use user ID)
const generateToken = (id: string): string => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'fallback_secret', 
    { expiresIn: '30d' } // Token lasts for 30 days
  );
};

// ==========================================
// ROUTE: POST /api/auth/register
// DESC:  Create a new user account
// ==========================================
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Validate that all required fields are present
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // 2. Check if the user email already exists in MongoDB
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 3. Hash the plain text password for secure database storage
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save the user document to MongoDB (Removed tier field)
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // 5. Send back account confirmation and the access token
    return res.status(201).json({
      success: true,
      token: generateToken(newUser._id.toString()),
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      }
    });

  } catch (error) {
    console.error('🔴 Registration Route Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ==========================================
// ROUTE: POST /api/auth/login
// DESC:  Authenticate user credentials and return a session token
// ==========================================
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    // 2. Check if the user exists in our records
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Compare submitted password with the hashed password stored in MongoDB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 4. Return user profile metrics and their active session token
    return res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('🔴 Login Route Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

export default router;