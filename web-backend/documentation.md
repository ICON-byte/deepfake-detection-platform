```markdown
# TruthLens Web-Backend Interface Guide

This service functions as a TypeScript-based middleware gateway that handles user rate-limiting, manages AWS S3 file upload configurations, and proxies payloads to our Python AI deepfake detection models.

---

## 🏗️ The 2-Phase Upload & Ingestion Architecture

To optimize performance and avoid bottlenecking server network bandwidth with heavy media streams, this backend separates file uploads into a decoupled, two-phase pipeline:

1. **Phase 1 (The Handshake)**: The client provides the target file metadata (`fileName`, `fileType`, and the chosen processing `mode`) to `/api/detection/request-upload`. The backend interacts with the AWS SDK to generate and return an ephemeral, secure 15-minute S3 upload URL.
2. **Phase 2 (Direct Stream & Proxy)**: The client uploads the binary file directly to the AWS S3 cloud storage bucket using that presigned link. Once completed, the client hits `/api/detection/analyze` with the stable asset url. The gateway determines the correct Python model path, dispatches the payload, maps the classification types, and persists the telemetry history to MongoDB.

---

## 🛡️ Globally Extended Types & Identity Management

### 1. Request Object Augmentation (`src/types.ts`)
The server leverages TypeScript’s **Global Declaration Merging** to extend the standard Express `Request` interface. This lets internal middleware read JWT payloads safely across files without type-casting syntax:

```typescript
export type TJwtPayload = {
  id: string;
  tier: 'guest' | 'free' | 'pro' | 'premium' | 'enterprise';
  iat?: number;
  exp?: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: TJwtPayload; // Optional to accommodate anonymous guest requests smoothly
    }
  }
}

```

### 2. Multi-Tier Rate-Limiting Rules (`src/middleware/ratelimiter.ts`)

The rate limiter evaluates incoming operations conditionally across subscription metrics:

* **Registered Accounts**: Evaluated inside MongoDB based on index-optimized history logs over a rolling 24-hour cycle.
* **Anonymous Guests**: Evaluated via client network IP identifiers.
* **Daily Caps Matrix**: `guest: 3` | `free: 5` | `pro: 30` | `premium: 100` | `enterprise: 1000`.

---

## 🔌 API Interaction Contracts

### 1. File Upload Request

`POST /api/detection/request-upload`

* **Headers**: `Authorization: Bearer <JWT>` *(Optional)*
* **Body Structure**:
```json
{
  "fileName": "audio_log.mp3",
  "fileType": "audio/mp3",
  "mode": "audio"
}

```


*Note: `mode` parameters strictly accept `'audio' | 'image' | 'video' | 'text'*`
* **Response (200 OK)**:
```json
{
  "success": true,
  "presignedUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/](https://truthlens-bucket.s3.amazonaws.com/audios/)...",
  "s3Key": "audios/1718224915000-audio_log.mp3",
  "fileUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/1718224915000-audio_log.mp3](https://truthlens-bucket.s3.amazonaws.com/audios/1718224915000-audio_log.mp3)"
}

```



### 2. Forensic Deepfake Analysis Pipeline Dispatch

`POST /api/detection/analyze`

* **Headers**: `Authorization: Bearer <JWT>` *(Optional)*
* **Body Structure**:
```json
{
  "fileUrl": "[https://truthlens-bucket.s3.amazonaws.com/audios/1718224915000-audio_log.mp3](https://truthlens-bucket.s3.amazonaws.com/audios/1718224915000-audio_log.mp3)",
  "s3Key": "audios/1718224915000-audio_log.mp3",
  "fileName": "audio_log.mp3",
  "detectionMode": "audio"
}

```


* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "666a2e4b30bf228172901a8c",
    "userId": "665b1699f8e404285c13b192",
    "isGuest": false,
    "fileName": "audio_log.mp3",
    "s3Url": "[https://truthlens-bucket.s3.amazonaws.com/](https://truthlens-bucket.s3.amazonaws.com/)...",
    "s3Key": "audios/1718224915000-audio_log.mp3",
    "confidenceScore": 92,
    "status": "Manipulated",
    "detectionMode": "audio",
    "analysisBreakdown": { "pixelAnalysis": 0, "compression": 94, "frequency": 100, "metadata": 88 },
    "createdAt": "2026-06-03T20:15:21.000Z"
  }
}

```



---

## 🎯 Internal Normalization & Error Mappings

1. **Status Conversion**: The Python AI microservices process models using a binary string result of `"Fake"` or `"Real"`. Our internal Mongoose model enforces a strict status string enum format of `'Authentic' | 'Manipulated'`. The route automatically translates `"Fake"` to `Manipulated`, and everything else to `Authentic` prior to database writes.
2. **Fallback Analysis Metrics**: Because the Python `breakdown` metric values object can be empty in specific model outputs, the controller defaults safely to zero (`0`) indicators using nullish coalescing to avoid strict schema validation errors.
3. **Response Status Codes Reference**:
* `400 Bad Request`: Missing configuration metadata or execution payload keys.
* `422 Unprocessable Entity`: The backend successfully contacted the AI microservice array, but the Python framework rejected the source asset structure (e.g., no face detected in a picture/video, or empty text files).
* `429 Too Many Requests`: Client has crossed their multi-tier scan quota threshold bounds.
* `500 Internal Server Error`: Infrastructure issues, missing environment keys, or internal microservice time-outs.



```

```