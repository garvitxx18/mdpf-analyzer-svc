# Portfolio Analyzer API Documentation

Complete API reference for the Portfolio Analyzer service, including index scoring, approval workflow, and custom index creation.

## Base URL

```
http://localhost:3000
```

---

## Table of Contents

1. [Index Scoring](#index-scoring)
2. [Approval Workflow](#approval-workflow)
3. [Signature Management](#signature-management)
4. [Custom Index Creation](#custom-index-creation)
5. [Existing Endpoints](#existing-endpoints)

---

## Index Scoring

### POST /index/score

Initiates scoring for all constituents of an index for a specific effective date.

**Request Body:**
```json
{
  "indexId": "NIFTY50",
  "effectiveDate": "2025-11-08"
}
```

**Request Schema:**
- `indexId` (string, required): Index identifier (e.g., "NIFTY50", "BANKNIFTY")
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format

**Response (201 Created):**
```json
{
  "indexRunId": "550e8400-e29b-41d4-a716-446655440000",
  "indexId": "NIFTY50",
  "effectiveDate": "2025-11-08",
  "status": "running"
}
```

**Response Schema:**
- `indexRunId` (string): Unique identifier for the index score run
- `indexId` (string): The index that was scored
- `effectiveDate` (string): Effective date in YYYY-MM-DD format
- `status` (string): Status of the run ("pending" | "running" | "complete" | "failed")

**Example:**
```bash
curl -X POST http://localhost:3000/index/score \
  -H "Content-Type: application/json" \
  -d '{
    "indexId": "NIFTY50",
    "effectiveDate": "2025-11-08"
  }'
```

**Notes:**
- This endpoint creates an `index_score_run` record and scores all constituents
- Constituent scores are created with `state: "pending"` and await PM approval
- The scoring process runs asynchronously

---

## Approval Workflow

All approval endpoints are grouped by effective date, allowing PMs to review all scores across multiple indexes for a single date.

### GET /approval/:effectiveDate

Retrieves **all** constituent scores (all states) for a specific effective date (cross-index).

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format (e.g., "2025-11-08")

**Response (200 OK):**
```json
{
  "effectiveDate": "2025-11-08",
  "scores": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "indexRunId": "550e8400-e29b-41d4-a716-446655440000",
      "indexId": "NIFTY50",
      "ticker": "RELIANCE",
      "sector": "Energy",
      "effectiveDate": "2025-11-08",
      "score": "0.75",
      "confidence": "0.85",
      "direction": "up",
      "newsSentiment": {
        "summary": "Strong earnings report",
        "sentiment": "positive",
        "postUrl": "https://example.com/post",
        "blogUrl": "https://example.com/blog"
      },
      "state": "pending",
      "approvedBy": null,
      "approvedAt": null,
      "comments": null,
      "createdAt": "2025-11-08T10:00:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "indexRunId": "550e8400-e29b-41d4-a716-446655440000",
      "indexId": "NIFTY50",
      "ticker": "HDFCBANK",
      "sector": "Financial Services",
      "effectiveDate": "2025-11-08",
      "score": "0.82",
      "confidence": "0.90",
      "direction": "up",
      "newsSentiment": null,
      "state": "approved",
      "approvedBy": "pm_user",
      "approvedAt": "2025-11-08T11:00:00Z",
      "comments": "Looks good",
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ],
  "count": 2,
  "byState": {
    "pending": 1,
    "approved": 1,
    "rejected": 0,
    "onHold": 0
  }
}
```

**Response Schema:**
- `effectiveDate` (string): The effective date queried
- `scores` (array): Array of all constituent score objects (all states: pending, approved, rejected, on_hold)
- `count` (number): Total number of scores
- `byState` (object): Count breakdown by approval state
  - `pending` (number): Count of scores with `state: "pending"`
  - `approved` (number): Count of scores with `state: "approved"`
  - `rejected` (number): Count of scores with `state: "rejected"`
  - `onHold` (number): Count of scores with `state: "on_hold"`

**Constituent Score Object:**
- `id` (string): Unique identifier for the constituent score
- `indexRunId` (string): Reference to the index score run
- `indexId` (string): Index identifier
- `ticker` (string): Security ticker symbol
- `sector` (string | null): Sector classification
- `effectiveDate` (string): Effective date in YYYY-MM-DD format
- `score` (string): AI-generated score (0.0 to 1.0, stored as string)
- `confidence` (string): Confidence level (0.0 to 1.0, stored as string)
- `direction` (string): Price direction prediction ("up" | "flat" | "down")
- `newsSentiment` (object | null): News sentiment information
  - `summary` (string): Summary of news sentiment
  - `sentiment` (string): Overall sentiment ("positive" | "neutral" | "negative")
  - `postUrl` (string | null): URL to relevant post/article
  - `blogUrl` (string | null): URL to relevant blog post
- `state` (string): Approval state ("pending" | "approved" | "rejected" | "on_hold")
- `approvedBy` (string | null): Username of PM who approved/rejected
- `approvedAt` (Date | null): Timestamp of approval action
- `comments` (string | null): Optional comments from PM
- `createdAt` (Date): Creation timestamp

**Example:**
```bash
curl http://localhost:3000/approval/2025-11-08
```

---

### GET /approval/:effectiveDate/pending

Retrieves only **pending** constituent scores for a specific effective date (cross-index).

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format (e.g., "2025-11-08")

**Response (200 OK):**
```json
{
  "effectiveDate": "2025-11-08",
  "pendingScores": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "indexRunId": "550e8400-e29b-41d4-a716-446655440000",
      "indexId": "NIFTY50",
      "ticker": "RELIANCE",
      "sector": "Energy",
      "effectiveDate": "2025-11-08",
      "score": "0.75",
      "confidence": "0.85",
      "direction": "up",
      "newsSentiment": {
        "summary": "Strong earnings report",
        "sentiment": "positive",
        "postUrl": "https://example.com/post",
        "blogUrl": "https://example.com/blog"
      },
      "state": "pending",
      "approvedBy": null,
      "approvedAt": null,
      "comments": null,
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ],
  "count": 1
}
```

**Response Schema:**
- `effectiveDate` (string): The effective date queried
- `pendingScores` (array): Array of constituent score objects with `state: "pending"`
- `count` (number): Total number of pending scores

**Constituent Score Object:** (Same structure as above)

**Example:**
```bash
curl http://localhost:3000/approval/2025-11-08/pending
```

---

### GET /approval/:effectiveDate/summary

Retrieves approval summary statistics for a specific effective date.

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format

**Response (200 OK):**
```json
{
  "effectiveDate": "2025-11-08",
  "totalPending": 5,
  "approved": 10,
  "rejected": 2,
  "onHold": 3
}
```

**Response Schema:**
- `effectiveDate` (string): The effective date queried
- `totalPending` (number): Count of scores with `state: "pending"`
- `approved` (number): Count of scores with `state: "approved"`
- `rejected` (number): Count of scores with `state: "rejected"`
- `onHold` (number): Count of scores with `state: "on_hold"`

**Example:**
```bash
curl http://localhost:3000/approval/2025-11-08/summary
```

---

### POST /approval/:effectiveDate/approve

Approves a constituent score for a specific effective date.

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format

**Request Body:**
```json
{
  "scoreId": "660e8400-e29b-41d4-a716-446655440000",
  "approvedBy": "pm_user",
  "comments": "Looks good"
}
```

**Request Schema:**
- `scoreId` (string, required): Constituent score ID to approve
- `approvedBy` (string, required): Username of the PM approving the score
- `comments` (string, optional): Optional comments

**Response (200 OK):**
```json
{
  "message": "Score approved",
  "summary": {
    "totalPending": 4,
    "approved": 11,
    "rejected": 2,
    "onHold": 3
  }
}
```

**Response Schema:**
- `message` (string): Confirmation message
- `summary` (object): Updated approval summary (same structure as GET /approval/:effectiveDate/summary)

**Example:**
```bash
curl -X POST http://localhost:3000/approval/2025-11-08/approve \
  -H "Content-Type: application/json" \
  -d '{
    "scoreId": "660e8400-e29b-41d4-a716-446655440000",
    "approvedBy": "pm_user",
    "comments": "Looks good"
  }'
```

---

### POST /approval/:effectiveDate/reject

Rejects a constituent score for a specific effective date.

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format

**Request Body:**
```json
{
  "scoreId": "660e8400-e29b-41d4-a716-446655440000",
  "approvedBy": "pm_user",
  "comments": "Score too high"
}
```

**Request Schema:**
- `scoreId` (string, required): Constituent score ID to reject
- `approvedBy` (string, required): Username of the PM rejecting the score
- `comments` (string, optional): Optional comments explaining rejection

**Response (200 OK):**
```json
{
  "message": "Score rejected",
  "summary": {
    "totalPending": 4,
    "approved": 10,
    "rejected": 3,
    "onHold": 3
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/approval/2025-11-08/reject \
  -H "Content-Type: application/json" \
  -d '{
    "scoreId": "660e8400-e29b-41d4-a716-446655440000",
    "approvedBy": "pm_user",
    "comments": "Score too high"
  }'
```

---

### POST /approval/:effectiveDate/hold

Puts a constituent score on hold for a specific effective date.

**Path Parameters:**
- `effectiveDate` (string, required): Effective date in YYYY-MM-DD format

**Request Body:**
```json
{
  "scoreId": "660e8400-e29b-41d4-a716-446655440000",
  "approvedBy": "pm_user",
  "comments": "Need more data"
}
```

**Request Schema:**
- `scoreId` (string, required): Constituent score ID to put on hold
- `approvedBy` (string, required): Username of the PM putting score on hold
- `comments` (string, optional): Optional comments

**Response (200 OK):**
```json
{
  "message": "Score put on hold",
  "summary": {
    "totalPending": 4,
    "approved": 10,
    "rejected": 2,
    "onHold": 4
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/approval/2025-11-08/hold \
  -H "Content-Type: application/json" \
  -d '{
    "scoreId": "660e8400-e29b-41d4-a716-446655440000",
    "approvedBy": "pm_user",
    "comments": "Need more data"
  }'
```

---

## Signature Management

Signatures define the sector composition rules for custom index creation. They specify which sectors to include and their percentage allocations.

### POST /index/signature

Creates a new signature configuration.

**Request Body:**
```json
{
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123"
}
```

**Request Schema:**
- `name` (string, required): Name of the signature
- `description` (string, optional): Description of the signature
- `composition` (array, required): Array of sector allocation objects
  - `sector` (string, required): Sector name (e.g., "Technology", "Energy", "Finance")
  - `percentage` (number, required): Percentage allocation (0-100)
- `createdBy` (string, required): Username of the creator

**Validation Rules:**
- Composition percentages must sum to exactly 100
- Each sector percentage must be between 0 and 100

**Response (201 Created):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Response Schema:**
- `id` (string): Unique identifier for the signature
- `name` (string): Signature name
- `description` (string | null): Signature description
- `composition` (array): Array of sector allocation objects
- `createdBy` (string): Creator username
- `createdAt` (Date): Creation timestamp

**Example:**
```bash
curl -X POST http://localhost:3000/index/signature \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GreenGrowthIndex",
    "description": "Tech and Energy focused index",
    "composition": [
      { "sector": "Technology", "percentage": 40 },
      { "sector": "Energy", "percentage": 30 },
      { "sector": "Finance", "percentage": 30 }
    ],
    "createdBy": "user123"
  }'
```

**Error Responses:**

**400 Bad Request** - Invalid composition percentages:
```json
{
  "message": "Composition percentages must sum to 100. Current sum: 95"
}
```

---

### GET /index/signature

Retrieves all signatures.

**Response (200 OK):**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "GreenGrowthIndex",
    "description": "Tech and Energy focused index",
    "composition": [
      { "sector": "Technology", "percentage": 40 },
      { "sector": "Energy", "percentage": 30 },
      { "sector": "Finance", "percentage": 30 }
    ],
    "createdBy": "user123",
    "createdAt": "2025-11-08T10:00:00Z"
  },
  {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "name": "BalancedPortfolio",
    "description": "Equal weight across sectors",
    "composition": [
      { "sector": "Technology", "percentage": 25 },
      { "sector": "Finance", "percentage": 25 },
      { "sector": "Energy", "percentage": 25 },
      { "sector": "Healthcare", "percentage": 25 }
    ],
    "createdBy": "user456",
    "createdAt": "2025-11-08T11:00:00Z"
  }
]
```

**Response Schema:**
- Array of signature objects (same structure as POST response)

**Example:**
```bash
curl http://localhost:3000/index/signature
```

---

### GET /index/signature/:id

Retrieves a specific signature by ID.

**Path Parameters:**
- `id` (string, required): Signature ID (UUID)

**Response (200 OK):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Signature not found"
}
```

**Example:**
```bash
curl http://localhost:3000/index/signature/770e8400-e29b-41d4-a716-446655440000
```

---

## Custom Index Creation

### POST /index/custom

Creates a custom index based on a signature configuration using approved scores from the latest effective date.

**Request Body:**
```json
{
  "signatureId": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex_2025-11-08"
}
```

**Request Schema:**
- `signatureId` (string, required): Signature ID to use for index creation
- `name` (string, required): Name for the custom index

**Response (201 Created):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "signatureId": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex_2025-11-08",
  "sectorsUsed": ["Tech", "Energy", "Finance"],
  "constituentsSelected": ["AAPL", "GOOGL", "MSFT", "RELIANCE", "HDFCBANK"],
  "createdAt": "2025-11-08T10:00:00Z"
}
```

**Response Schema:**
- `id` (string): Unique identifier for the custom index
- `signatureId` (string): Signature ID used
- `name` (string): Index name
- `sectorsUsed` (array of strings): Sectors included in the index
- `constituentsSelected` (array of strings): Ticker symbols selected for the index
- `createdAt` (Date): Creation timestamp

**Example:**
```bash
curl -X POST http://localhost:3000/index/custom \
  -H "Content-Type: application/json" \
  -d '{
    "signatureId": "770e8400-e29b-41d4-a716-446655440000",
    "name": "GreenGrowthIndex_2025-11-08"
  }'
```

**Notes:**
- Only uses constituent scores with `state: "approved"` from the latest effective date
- Selects top-scoring constituents per sector based on signature composition percentages
- Signature must exist in the `signatures` table

**Error Responses:**

**404 Not Found** - Signature not found:
```json
{
  "message": "Signature not found: 770e8400-e29b-41d4-a716-446655440000"
}
```

**400 Bad Request** - No effective date found:
```json
{
  "message": "No effective date found. Please score an index first."
}
```

---

## Existing Endpoints

### POST /score/batch

Creates a batch scoring job for multiple tickers.

**Request Body:**
```json
{
  "tickers": ["AAPL", "GOOGL", "MSFT"]
}
```

**Response (201 Created):**
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 3,
  "status": "pending"
}
```

---

### GET /score/:runId

Retrieves the status and results of a batch scoring job.

**Path Parameters:**
- `runId` (string, required): Unique identifier for the batch run

**Response (200 OK):**
```json
{
  "run": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "startedAt": "2025-11-08T10:00:00Z",
    "completedAt": "2025-11-08T10:05:00Z",
    "total": 3,
    "completed": 3,
    "status": "complete"
  },
  "completed": 3,
  "scores": [...]
}
```

---

### GET /score/ticker/:ticker

Retrieves the latest score for a specific ticker.

**Path Parameters:**
- `ticker` (string, required): Ticker symbol

**Response (200 OK):**
```json
{
  "id": 1,
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "ticker": "AAPL",
  "ts": "2025-11-08T10:00:00Z",
  "score": "0.75",
  "confidence": "0.85",
  "direction": "up",
  "horizonDays": 30,
  "rationaleJson": {...},
  "risksJson": {...},
  "model": "gemini-2.0-flash-exp",
  "inputHash": "abc123"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Data Types Reference

### Date Format
All dates are in ISO 8601 format: `YYYY-MM-DD` for date-only fields, `YYYY-MM-DDTHH:mm:ssZ` for timestamps.

### Score Values
- `score`: Numeric string representing a value between 0.0 and 1.0
- `confidence`: Numeric string representing a value between 0.0 and 1.0

### Enums

**Direction:**
- `"up"` - Price expected to increase
- `"flat"` - Price expected to remain stable
- `"down"` - Price expected to decrease

**State:**
- `"pending"` - Awaiting PM approval
- `"approved"` - Approved by PM
- `"rejected"` - Rejected by PM
- `"on_hold"` - Put on hold by PM

**Status:**
- `"pending"` - Job not started
- `"running"` - Job in progress
- `"complete"` - Job completed successfully
- `"failed"` - Job failed

**Sentiment:**
- `"positive"` - Positive sentiment
- `"neutral"` - Neutral sentiment
- `"negative"` - Negative sentiment

---

## Workflow Example

### Complete Flow: Create Signature → Index Scoring → Approval → Custom Index

1. **Create a signature (one-time setup):**
```bash
POST /index/signature
{
  "name": "GreenGrowthIndex",
  "description": "Tech and Energy focused index",
  "composition": [
    { "sector": "Technology", "percentage": 40 },
    { "sector": "Energy", "percentage": 30 },
    { "sector": "Finance", "percentage": 30 }
  ],
  "createdBy": "user123"
}
```

2. **Score an index:**
```bash
POST /index/score
{
  "indexId": "NIFTY50",
  "effectiveDate": "2025-11-08"
}
```

3. **Get pending scores for review:**
```bash
GET /approval/2025-11-08
```

4. **Approve scores:**
```bash
POST /approval/2025-11-08/approve
{
  "scoreId": "660e8400-e29b-41d4-a716-446655440000",
  "approvedBy": "pm_user",
  "comments": "Looks good"
}
```

5. **Check approval summary:**
```bash
GET /approval/2025-11-08/summary
```

6. **Create custom index from approved scores:**
```bash
POST /index/custom
{
  "signatureId": "770e8400-e29b-41d4-a716-446655440000",
  "name": "GreenGrowthIndex_2025-11-08"
}
```

---

## Notes for Frontend Integration

1. **Effective Date Grouping**: All approval endpoints group scores by effective date, not by index. This allows PMs to review all scored securities for a single date across multiple indexes.

2. **Async Operations**: Index scoring (`POST /index/score`) is asynchronous. The response returns immediately with `status: "running"`. Check the status separately if needed.

3. **Score Format**: Scores and confidence values are returned as strings (not numbers) due to database precision. Parse them as needed: `parseFloat(score)`.

4. **News Sentiment**: The `newsSentiment` field may be `null` if no news articles were found for the ticker.

5. **State Transitions**: Constituent scores start as `"pending"` and can transition to `"approved"`, `"rejected"`, or `"on_hold"` via the approval endpoints.

6. **Custom Index Creation**: Only uses approved scores from the **latest** effective date. Ensure scores are approved before creating custom indexes.

7. **Signatures**: Create signatures before creating custom indexes. Signature composition percentages must sum to exactly 100.

8. **CORS**: The API has CORS enabled for common localhost ports and the configured frontend URL.

