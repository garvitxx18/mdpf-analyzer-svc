# Portfolio Analyzer API - Frontend Documentation

## Base URL

```
https://mdpf-analyzer-99gfisuxc-kanekis-projects-237d2960.vercel.app
```

## Overview

The Portfolio Analyzer API provides AI-powered scoring for securities using Gemini AI. It analyzes market data, news sentiment, and various financial metrics to generate investment scores with confidence levels and risk assessments.

## Endpoints

### 1. Create Batch Scoring Job

Create a batch scoring job for multiple ticker symbols.

**Endpoint:** `POST /score/batch`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```typescript
{
  tickers: string[]
}
```

**Example Request:**
```json
{
  "tickers": ["AAPL", "GOOGL", "MSFT"]
}
```

**Response:**
- **Status Code:** `201 Created`

**Response Body:**
```typescript
{
  runId: string;      // UUID of the batch job
  total: number;      // Total number of tickers in the batch
  status: "pending"   // Initial status
}
```

**Example Response:**
```json
{
  "runId": "2043e8cc-20f5-4164-8cb8-d43d8ef959d6",
  "total": 3,
  "status": "pending"
}
```

**TypeScript Type:**
```typescript
type BatchCreateResponse = {
  runId: string;
  total: number;
  status: "pending";
};
```

---

### 2. Get Batch Status and Results

Retrieve the status and all scores for a batch job.

**Endpoint:** `GET /score/:runId`

**URL Parameters:**
- `runId` (string, required): The UUID of the batch job

**Example Request:**
```
GET /score/2043e8cc-20f5-4164-8cb8-d43d8ef959d6
```

**Response:**
- **Status Code:** `200 OK`

**Response Body:**
```typescript
{
  run: {
    id: string;                    // UUID
    startedAt: string;             // ISO 8601 date string
    completedAt: string | null;   // ISO 8601 date string or null
    total: number;                 // Total tickers in batch
    completed: number;             // Number of completed scores
    status: "pending" | "running" | "complete" | "failed";
    paramsJson: {
      tickers: string[];
    };
  };
  completed: number;  // Number of scores completed (same as run.completed)
  scores: Score[];    // Array of completed scores
}
```

**Score Type:**
```typescript
type Score = {
  id: number;
  runId: string;
  ticker: string;
  ts: string;                    // ISO 8601 date string
  score: number;                 // 0-1 range
  confidence: number;            // 0-1 range
  direction: "up" | "flat" | "down";
  horizonDays: number;          // Positive integer
  rationaleJson: {
    summary: string;
    factors: string[];
    sentiment: string;
  };
  risksJson: {
    market: string;
    specific: string;
  };
  model: string;                // e.g., "gemini-2.0-flash-exp"
  inputHash: string;
};
```

**Example Response:**
```json
{
  "run": {
    "id": "2043e8cc-20f5-4164-8cb8-d43d8ef959d6",
    "startedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": "2024-01-15T10:32:15.000Z",
    "total": 3,
    "completed": 3,
    "status": "complete",
    "paramsJson": {
      "tickers": ["AAPL", "GOOGL", "MSFT"]
    }
  },
  "completed": 3,
  "scores": [
    {
      "id": 1,
      "runId": "2043e8cc-20f5-4164-8cb8-d43d8ef959d6",
      "ticker": "AAPL",
      "ts": "2024-01-15T10:31:00.000Z",
      "score": 0.75,
      "confidence": 0.85,
      "direction": "up",
      "horizonDays": 30,
      "rationaleJson": {
        "summary": "Strong financial performance with positive momentum",
        "factors": ["Revenue growth", "Product innovation", "Market position"],
        "sentiment": "positive"
      },
      "risksJson": {
        "market": "General market volatility",
        "specific": "Competition in smartphone market"
      },
      "model": "gemini-2.0-flash-exp",
      "inputHash": "abc123..."
    }
  ]
}
```

**Error Response:**
- **Status Code:** `200 OK` (Note: API returns error object on 200)

```typescript
{
  error: "Run not found"
}
```

**TypeScript Type:**
```typescript
type BatchStatusResponse = 
  | {
      run: ScoreRun;
      completed: number;
      scores: Score[];
    }
  | {
      error: string;
    };

type ScoreRun = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  total: number;
  completed: number;
  status: "pending" | "running" | "complete" | "failed";
  paramsJson: {
    tickers: string[];
  };
};
```

---

### 3. Get Latest Score for Ticker

Retrieve the most recent score for a specific ticker symbol.

**Endpoint:** `GET /score/ticker/:ticker`

**URL Parameters:**
- `ticker` (string, required): The stock ticker symbol (e.g., "AAPL", "GOOGL")

**Example Request:**
```
GET /score/ticker/AAPL
```

**Response:**
- **Status Code:** `200 OK`

**Response Body:**
```typescript
Score  // Same type as defined in endpoint 2
```

**Example Response:**
```json
{
  "id": 42,
  "runId": "2043e8cc-20f5-4164-8cb8-d43d8ef959d6",
  "ticker": "AAPL",
  "ts": "2024-01-15T10:31:00.000Z",
  "score": 0.75,
  "confidence": 0.85,
  "direction": "up",
  "horizonDays": 30,
  "rationaleJson": {
    "summary": "Strong financial performance with positive momentum",
    "factors": ["Revenue growth", "Product innovation", "Market position"],
    "sentiment": "positive"
  },
  "risksJson": {
    "market": "General market volatility",
    "specific": "Competition in smartphone market"
  },
  "model": "gemini-2.0-flash-exp",
  "inputHash": "abc123..."
}
```

**Error Response:**
- **Status Code:** `200 OK` (Note: API returns error object on 200)

```typescript
{
  error: "No score found for ticker"
}
```

**TypeScript Type:**
```typescript
type TickerScoreResponse = Score | { error: string };
```

---

## Complete TypeScript Type Definitions

```typescript
// Request Types
type BatchCreateRequest = {
  tickers: string[];
};

// Response Types
type BatchCreateResponse = {
  runId: string;
  total: number;
  status: "pending";
};

type ScoreRun = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  total: number;
  completed: number;
  status: "pending" | "running" | "complete" | "failed";
  paramsJson: {
    tickers: string[];
  };
};

type Score = {
  id: number;
  runId: string;
  ticker: string;
  ts: string;
  score: number;              // 0-1 range
  confidence: number;         // 0-1 range
  direction: "up" | "flat" | "down";
  horizonDays: number;        // Positive integer
  rationaleJson: {
    summary: string;
    factors: string[];
    sentiment: string;
  };
  risksJson: {
    market: string;
    specific: string;
  };
  model: string;
  inputHash: string;
};

type BatchStatusResponse = 
  | {
      run: ScoreRun;
      completed: number;
      scores: Score[];
    }
  | {
      error: string;
    };

type TickerScoreResponse = 
  | Score
  | {
      error: string;
    };
```

---

## Status Meanings

### Batch Status Values

- **`pending`**: Batch job has been created but processing hasn't started
- **`running`**: Batch job is currently processing tickers
- **`complete`**: All tickers in the batch have been successfully scored
- **`failed`**: Batch job failed or some tickers failed to score

### Score Direction Values

- **`up`**: Expected positive price movement
- **`flat`**: Expected neutral/stable price movement
- **`down`**: Expected negative price movement

### Score and Confidence Ranges

- **`score`**: Value between 0.0 and 1.0, where:
  - Higher values indicate more favorable investment prospects
  - Values close to 1.0 suggest strong buy signals
  - Values close to 0.0 suggest poor investment prospects

- **`confidence`**: Value between 0.0 and 1.0, where:
  - Higher values indicate higher confidence in the score
  - Values close to 1.0 mean the AI model is very confident
  - Values close to 0.0 mean the AI model is uncertain

---

## Usage Examples

### Example 1: Create and Monitor a Batch Job

```typescript
const baseUrl = "https://mdpf-analyzer-99gfisuxc-kanekis-projects-237d2960.vercel.app";

// Step 1: Create batch job
const createBatch = async (tickers: string[]): Promise<BatchCreateResponse> => {
  const response = await fetch(`${baseUrl}/score/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tickers }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create batch: ${response.statusText}`);
  }

  return response.json();
};

// Step 2: Poll for batch status
const getBatchStatus = async (runId: string): Promise<BatchStatusResponse> => {
  const response = await fetch(`${baseUrl}/score/${runId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get batch status: ${response.statusText}`);
  }

  return response.json();
};

// Usage
async function scoreTickers(tickers: string[]) {
  // Create batch
  const batch = await createBatch(tickers);
  console.log(`Created batch with ID: ${batch.runId}`);

  // Poll until complete
  let status: BatchStatusResponse;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    status = await getBatchStatus(batch.runId);
    
    if ("error" in status) {
      throw new Error(status.error);
    }

    console.log(`Progress: ${status.completed}/${status.run.total} (${status.run.status})`);
  } while (status.run.status !== "complete" && status.run.status !== "failed");

  if (status.run.status === "failed") {
    throw new Error("Batch job failed");
  }

  return status.scores;
}

// Example usage
scoreTickers(["AAPL", "GOOGL", "MSFT"])
  .then(scores => {
    console.log("Scoring complete!");
    scores.forEach(score => {
      console.log(`${score.ticker}: ${(score.score * 100).toFixed(1)}% (${score.direction})`);
    });
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

### Example 2: Get Latest Score for a Single Ticker

```typescript
const getTickerScore = async (ticker: string): Promise<TickerScoreResponse> => {
  const response = await fetch(`${baseUrl}/score/ticker/${ticker}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get ticker score: ${response.statusText}`);
  }

  return response.json();
};

// Usage
getTickerScore("AAPL")
  .then(result => {
    if ("error" in result) {
      console.error(result.error);
      return;
    }

    const score = result;
    console.log(`Ticker: ${score.ticker}`);
    console.log(`Score: ${(score.score * 100).toFixed(1)}%`);
    console.log(`Confidence: ${(score.confidence * 100).toFixed(1)}%`);
    console.log(`Direction: ${score.direction}`);
    console.log(`Horizon: ${score.horizonDays} days`);
    console.log(`Summary: ${score.rationaleJson.summary}`);
    console.log(`Factors: ${score.rationaleJson.factors.join(", ")}`);
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

### Example 3: React Hook for Batch Scoring

```typescript
import { useState, useEffect } from "react";

const BASE_URL = "https://mdpf-analyzer-99gfisuxc-kanekis-projects-237d2960.vercel.app";

type UseBatchScoringResult = {
  createBatch: (tickers: string[]) => Promise<void>;
  status: BatchStatusResponse | null;
  loading: boolean;
  error: string | null;
};

export const useBatchScoring = (): UseBatchScoringResult => {
  const [status, setStatus] = useState<BatchStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBatch = async (tickers: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // Create batch
      const response = await fetch(`${BASE_URL}/score/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create batch: ${response.statusText}`);
      }

      const batch = await response.json();

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${BASE_URL}/score/${batch.runId}`);
          const statusData = await statusResponse.json();

          if ("error" in statusData) {
            throw new Error(statusData.error);
          }

          setStatus(statusData);

          if (statusData.run.status === "complete" || statusData.run.status === "failed") {
            clearInterval(pollInterval);
            setLoading(false);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setLoading(false);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }, 2000);

      // Cleanup interval on unmount
      return () => clearInterval(pollInterval);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return { createBatch, status, loading, error };
};
```

---

## Error Handling

The API uses a consistent error response format:

```typescript
{
  error: string
}
```

**Common Error Scenarios:**

1. **Run Not Found**: When querying a batch status with an invalid `runId`
   ```json
   {
     "error": "Run not found"
   }
   ```

2. **Ticker Not Found**: When querying a ticker that has no scores
   ```json
   {
     "error": "No score found for ticker"
   }
   ```

**HTTP Status Codes:**

- `201 Created`: Successfully created a batch job
- `200 OK`: Successful GET request (may contain error object in response body)
- `400 Bad Request`: Invalid request format
- `500 Internal Server Error`: Server error

**Best Practice:**
Always check for the `error` property in response objects, even when the HTTP status is 200 OK:

```typescript
const result = await response.json();
if ("error" in result) {
  // Handle error
  console.error(result.error);
  return;
}
// Process successful result
```

---

## Rate Limiting and Performance

- Batch jobs process tickers sequentially, which means larger batches take longer to complete
- Each ticker scoring operation may take several seconds as it:
  1. Fetches market data
  2. Retrieves news articles
  3. Processes data through AI model
  4. Stores results in database

**Recommendations:**
- For large batches (10+ tickers), implement polling with exponential backoff
- Consider showing progress indicators to users
- Cache ticker scores on the frontend to avoid redundant requests
- Use the `/score/ticker/:ticker` endpoint for individual lookups when possible

---

## Data Interpretation

### Score Interpretation

- **0.0 - 0.3**: Poor investment prospect
- **0.3 - 0.5**: Neutral/moderate prospect
- **0.5 - 0.7**: Good investment prospect
- **0.7 - 1.0**: Excellent investment prospect

### Confidence Interpretation

- **0.0 - 0.5**: Low confidence - consider the score with caution
- **0.5 - 0.7**: Moderate confidence
- **0.7 - 0.9**: High confidence
- **0.9 - 1.0**: Very high confidence

### Direction Interpretation

- **`up`**: AI model predicts positive price movement over the horizon period
- **`flat`**: AI model predicts stable/neutral price movement
- **`down`**: AI model predicts negative price movement

### Horizon Days

Represents the time period (in days) for which the score and direction prediction are relevant. Common values are typically 7, 14, 30, 60, or 90 days.

---

## Notes

1. **Async Processing**: Batch jobs are processed asynchronously. The `createBatch` endpoint returns immediately with a `runId`, and you must poll the status endpoint to check progress.

2. **Score Uniqueness**: Each ticker can only have one score per batch run (enforced by database constraint).

3. **Latest Score**: The `/score/ticker/:ticker` endpoint returns the most recent score across all batch runs, not just the latest batch.

4. **Date Format**: All date fields (`startedAt`, `completedAt`, `ts`) are returned as ISO 8601 strings and should be parsed as dates in your frontend code.

5. **Numeric Precision**: Score and confidence values are stored with 5 digits of precision (scale 4), providing high accuracy for percentage calculations.

