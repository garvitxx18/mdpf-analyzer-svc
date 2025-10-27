# Database Entries Flow

This document explains what database entries are created when you call the scoring API.

## API Call

```bash
POST /score/batch
{
  "tickers": ["AAPL", "GOOGL", "MSFT"]
}
```

## Database Tables Affected

### 1. **score_runs** table
**When:** Immediately when the batch is created  
**What happens:**
- A new row is inserted with:
  - `id`: UUID (unique run ID)
  - `startedAt`: Current timestamp
  - `total`: Number of tickers (e.g., 3)
  - `completed`: 0
  - `status`: "pending"
  - `paramsJson`: { "tickers": ["AAPL", "GOOGL", "MSFT"] }
- After all scoring completes, this row is updated with:
  - `completed`: Number of successfully scored tickers
  - `status`: "complete" or "failed" (based on success rate)
  - `completedAt`: Timestamp

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2025-01-27T01:00:00Z",
  "total": 3,
  "completed": 3,
  "status": "complete",
  "paramsJson": { "tickers": ["AAPL", "GOOGL", "MSFT"] }
}
```

### 2. **securities** table
**When:** Before scoring each ticker (if ticker doesn't exist)  
**What happens:**
- Check if ticker exists in securities table
- If NOT, insert a new row with:
  - `ticker`: "AAPL" (or whatever ticker)
  - `name`: Same as ticker ("AAPL")
  - `currency`: "USD"
  - `sector`: null
  - `industry`: null
  - `lotSize`: 1
  - `createdAt`: Current timestamp

**Example:**
```json
{
  "id": 1,
  "ticker": "AAPL",
  "name": "AAPL",
  "currency": "USD",
  "sector": null,
  "industry": null,
  "lotSize": 1,
  "createdAt": "2025-01-27T01:00:00Z"
}
```

### 3. **scores** table
**When:** After successful scoring of each ticker  
**What happens:**
- For EACH successfully scored ticker, insert a row with:
  - `runId`: UUID from score_runs
  - `ticker`: "AAPL"
  - `ts`: Current timestamp
  - `score`: AI-generated score (0-1)
  - `confidence`: AI confidence level (0-1)
  - `direction`: "up", "flat", or "down"
  - `horizonDays`: Prediction horizon (e.g., 7)
  - `rationaleJson`: AI reasoning (JSON object)
  - `risksJson`: AI risk assessment (JSON object)
  - `model`: "gemini-2.0-flash-exp"
  - `inputHash`: SHA-256 hash of input data (for deduplication)

**Example:**
```json
{
  "id": 1,
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "ticker": "AAPL",
  "ts": "2025-01-27T01:00:05Z",
  "score": "0.7500",
  "confidence": "0.8500",
  "direction": "up",
  "horizonDays": 7,
  "rationaleJson": {
    "summary": "Strong fundamentals",
    "factors": ["Earnings growth", "Market position"],
    "sentiment": "positive"
  },
  "risksJson": {
    "market": "Potential volatility",
    "specific": "Regulatory concerns"
  },
  "model": "gemini-2.0-flash-exp",
  "inputHash": "abc123def456..."
}
```

## What is NOT stored

The following data is fetched from Alpha Vantage API but is NOT stored in the database:

1. **prices** table: Defined in schema but NOT populated
   - Market data (OHLCV) is fetched from API but not saved
   - Used only for enrichment in the current request

2. **news** table: Defined in schema but NOT populated
   - News articles are fetched from API but not saved
   - Used only for enrichment in the current request

3. **input_cache** table: Defined in schema but NOT populated
   - Intended for caching but not currently used

## Database Flow Summary

For a batch request with 3 tickers:

```
1. score_runs: 1 row created
   - Status: pending → complete
   - Updated when finished

2. securities: 3 rows (if tickers are new)
   - Only if ticker doesn't already exist

3. scores: 3 rows (one per ticker)
   - Contains AI-generated scores
   - All linked to same runId
```

## Complete Flow Diagram

```
POST /score/batch
  │
  ├─> INSERT into score_runs
  │   └─ status: "pending"
  │
  └─> FOR EACH ticker:
      │
      ├─> CHECK if ticker exists in securities
      │   └─> IF NOT: INSERT into securities
      │       └─ name: ticker, currency: USD
      │
      ├─> FETCH market data from Alpha Vantage API
      │   └─ NOT stored in database
      │
      ├─> FETCH news from Alpha Vantage API
      │   └─ NOT stored in database
      │
      ├─> GENERATE AI score via Gemini API
      │   └─ Model: gemini-2.0-flash-exp
      │
      └─> INSERT into scores
          └─ All score data + metadata
      │
  └─> UPDATE score_runs
      └─ completed count, status, completedAt
```

## Queries to View Results

```sql
-- View all runs and their status
SELECT * FROM score_runs ORDER BY started_at DESC LIMIT 10;

-- View latest scores for a ticker
SELECT * FROM scores WHERE ticker = 'AAPL' ORDER BY ts DESC LIMIT 5;

-- View complete batch results for a run
SELECT 
  s.ticker,
  s.score,
  s.confidence,
  s.direction,
  s.rationale_json,
  s.risks_json
FROM scores s
WHERE s.run_id = 'YOUR-RUN-ID'
ORDER BY s.ticker;
```

