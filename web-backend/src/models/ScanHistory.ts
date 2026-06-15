import mongoose, { Schema, Document } from 'mongoose';

// 1. Define the TypeScript Interface for the Analysis Breakdown nested object
export interface IAnalysisBreakdown {
  pixelAnalysis: number;
  compression: number;
  frequency: number;
  metadata: number;
}

// 2. Define the TypeScript Interface for the main Scan Document
export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId | string; // Supports ObjectId for logged-in accounts, or IP address for guests
  isGuest: boolean;
  fileName: string;
  s3Url: string;
  s3Key: string; // Crucial reference for the AWS 3-day data lifecycle deletion rule
  confidenceScore: number;
  status: 'Authentic' | 'Manipulated';
  detectionMode: 'audio' | 'image' | 'video' | 'text' | 'phishing'; // 🟢 Updated to match the 5 Python core pipelines
  analysisBreakdown: IAnalysisBreakdown;
  createdAt: Date;
}

// 3. Build the Mongoose Schema
const ScanHistorySchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.Mixed, // Mixed type allows both ObjectIds and plain Strings (IPs)
      required: true 
    },
    isGuest: { 
      type: Boolean, 
      default: false 
    },
    fileName: { 
      type: String, 
      required: true 
    },
    s3Url: { 
      type: String, 
      required: true 
    },
    s3Key: { 
      type: String, 
      required: true 
    },
    confidenceScore: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    status: { 
      type: String, 
      enum: ['Authentic', 'Manipulated'], 
      required: true 
    },
    detectionMode: {
      type: String,
      enum: ['audio', 'image', 'video', 'text', 'phishing'],
      default: 'image',
      required: true
    },
    analysisBreakdown: {
      pixelAnalysis: { type: Number, default: 0 },
      compression: { type: Number, default: 0 },
      frequency: { type: Number, default: 0 },
      metadata: { type: Number, default: 0 }
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // We only care about creation timestamps for history
  }
);

// 4. Create database indexes to optimize rolling 24-hour lookups and history queries
ScanHistorySchema.index({ userId: 1, createdAt: -1 });

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);