```markdown
# AWS S3 Cloud Storage Integration Guide

This document outlines the required bucket configurations for the DevOps/Backend setup and specifies the precise folder structures the frontend developers must use when labeling asset modes during uploads.

---

## ⚙️ Required Environment Variables

The backend requires the following configuration keys in the `.env` file to initialize the AWS S3 Client:

```env
AWS_ACCESS_KEY_ID=your_iam_user_access_key
AWS_SECRET_ACCESS_KEY=your_iam_user_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=truthlens-bucket

```

### Bucket Lifecycle Policy (Crucial)

To prevent unlimited storage accumulation and minimize costs, the S3 bucket **MUST** be configured with a Lifecycle Rule in the AWS Console:

* **Rule Action**: Delete objects permanently.
* **Timeline**: 3 days (72 hours) after object creation.

---

## 📂 Frontend Labeling & Folder Structure

When the frontend requests a presigned URL from `POST /api/detection/request-upload`, it must pass a `mode` parameter. This parameter directly controls how files are labeled and categorized inside the S3 storage cluster.

| Processing Mode | Expected Payload Key (`mode`) | Target S3 Folder Destination |
| --- | --- | --- |
| **Audio Detection** | `"audio"` | `audios/` |
| **Image Detection** | `"image"` | `images/` |
| **Video Detection** | `"video"` | `videos/` |
| **Text Detection** | `"text"` | `texts/` |

---

## 🔄 Interaction Flow

### Step 1: Request an Ingestion Handshake

The frontend requests permission to upload by sending the file metadata and the correct pipeline label:

**POST** `/api/detection/request-upload`

```json
{
  "fileName": "sample_voice.wav",
  "fileType": "audio/wav",
  "mode": "audio"
}

```

### Step 2: Stream Raw Binary to Cloud

The backend returns a clean workspace. The frontend must immediately extract `presignedUrl` and upload the file binary directly to it using a standard `PUT` request:

**Response Example**:

```json
{
  "success": true,
  "presignedUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav?AWSAccessKeyId=](https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav?AWSAccessKeyId=)...",
  "s3Key": "audios/1718224915-sample_voice.wav",
  "fileUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav](https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav)"
}

```

### Step 3: Dispatch Link to AI Processing Engine

Once the frontend receive a `200 OK` from the `presignedUrl` stream, it takes the **`fileUrl`** and **`s3Key`** and passes them to the analytics trigger:

**POST** `/api/detection/analyze`

```json
{
  "fileUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav](https://truthlens-bucket.s3.amazonaws.com/audios/1718224915-sample_voice.wav)",
  "s3Key": "audios/1718224915-sample_voice.wav",
  "fileName": "sample_voice.wav",
  "detectionMode": "audio"
}

```

---

## ⚠️ Common Integration Errors

| Status Code | Description / Catalyst | Fix |
| --- | --- | --- |
| `400` | S3 credentials or environment variables are missing on the backend. | Verify access keys and verify the `.env` configuration file exists. |
| `403 Forbidden` | S3 bucket permissions block incoming frontend requests. | Verify bucket CORS policies allow `PUT` requests from the frontend domain. |

```

```