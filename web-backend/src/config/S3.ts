import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Fail early during initialization if AWS credentials are fundamentally missing
if (!region || !accessKeyId || !secretAccessKey) {
  console.warn(
    '⚠️ AWS credentials or region are missing in your .env file. S3 features will fail until provided.'
  );
}

export const s3Client = new S3Client({
  region: region || 'us-east-1', // fallback placeholder to prevent crash on boot
  credentials: {
    accessKeyId: accessKeyId || 'placeholder',
    secretAccessKey: secretAccessKey || 'placeholder',
  },
});