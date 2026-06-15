import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import historyRoutes from './routes/history';
import detectionRoutes from './routes/detection';

// 1. Load system environment variables
dotenv.config();

// 2. Initialize the Express Application
const app: Application = express();

// 3. Connect to MongoDB
connectDB();

// 4. Mount Global Cross-Cutting Middlewares
app.use(cors()); // Permits your frontend domain to make secure API requests
app.use(compression()); // Compress all responses for faster data delivery
app.use(express.json()); // Automatically parses incoming raw JSON payloads on req.body

// 5. Mount API Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/detection', detectionRoutes);

// 6. Base Health Check Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the TruthLens Core Web Backend API Engine.',
    status: 'Operational'
  });
});

// 7. Establish active runtime port listener
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in development mode on port http://localhost:${PORT}`);
});

export default app;