# Portfolio Analyzer - Complete Flow Explanation

## ✅ What's Working

### 1. **Server Running** 
- NestJS API server on `http://localhost:3000`
- No Swagger (temporarily disabled to fix compatibility)

### 2. **Database Connected**
- Supabase PostgreSQL connection working
- 6 tables created successfully

### 3. **API Endpoints Ready**
- `POST /score/batch` - Create batch scoring job
- `GET /score/:runId` - Check batch status
- `GET /score/ticker/:ticker` - Get latest score

## 🔄 Complete Request Flow

### Scenario: User wants to score Apple (AAPL)

```
1. USER → POST /score/batch { tickers: ["AAPL"] }
   │
   ├─ Server generates UUID runId
   ├─ Creates record in score_runs table
   └─ Returns: { runId, total: 1, status: "pending" }
   │
2. BACKGROUND PROCESSING:
   │
   ├─ Fetch Alpha Vantage Market Data
   │  ├─ OHLCV for last 30 days
   │  └─ Save to prices table
   │
   ├─ Fetch Alpha Vantage News  
   │  ├─ Latest 10 articles
   │  ├─ Calculate relevance scores
   │  └─ Save to news table
   │
   ├─ Build Prompt
   │  └─ Combine market data + news context
   │
   ├─ Send to Gemini AI
   │  ├─ AI analyzes the data
   │  └─ Returns: {
   │       score: 0.85,           // Overall score (0-1)
   │       confidence: 0.90,     // AI's confidence (0-1)  
   │       direction: "up",      // up/flat/down
   │       rationale: {          // Why this score
   │         summary: "...",
   │         factors: [...],
   │         sentiment: "positive"
   │       },
   │       risks: {              // What could go wrong
   │         market: "...",
   │         specific: "..."
   │       },
   │       horizon_days: 7       // 7-day prediction
   │     }
   │
   └─ Save to Supabase
      ├─ scores table (main result)
      └─ Update score_runs status to "complete"
   
3. USER → GET /score/:runId
   │
   └─ Returns: {
        run: { id, status: "complete", total: 1, completed: 1 },
        scores: [ { ticker: "AAPL", score: 0.85, ... } ]
      }

4. USER → GET /score/ticker/AAPL  
   │
   └─ Returns: Latest score for AAPL
```

## 🎯 Key Features

### **Deduplication**
- Input hash prevents re-scoring identical data
- Cache expires after 6 hours
- Saves API costs and time

### **Parallel Processing**
- Market data and news fetched simultaneously
- Each ticker scored independently

### **Error Handling**
- Retry logic for Gemini API (3 attempts)
- Exponential backoff for network issues
- Graceful error logging

### **Data Validation**
- Zod schemas for all data
- Runtime validation at boundaries
- Type-safe throughout

## 📊 Database Architecture

```
securities (Master)
  ├─ ticker: AAPL, GOOGL, etc.
  ├─ name, sector, industry
  
prices (Historical Market Data)
  ├─ ticker → securities.ticker
  ├─ ts, open, high, low, close, volume
  
news (Articles)
  ├─ ticker → securities.ticker
  ├─ ts, title, summary, source, url
  ├─ embedding_vector (optional for semantic search)
  
score_runs (Batch Tracking)
  ├─ id, status, total, completed
  ├─ started_at, completed_at
  
scores (AI Results)
  ├─ ticker → securities.ticker
  ├─ run_id → score_runs.id
  ├─ score, confidence, direction
  ├─ rationale_json, risks_json
  
input_cache (Deduplication)
  ├─ ticker, input_hash, cached_at
  ├─ expires_at, data_json
```

## 🚀 Current Status

**Working:**
- ✅ Database tables created
- ✅ Server running  
- ✅ API accepting requests
- ✅ All services implemented

**Issue:**
- ⚠️ 500 error on endpoints (likely database query issue)

**Next:**
- Debug the 500 error
- Test with sample data
- Fix any remaining issues

## 🔍 To Debug

Check server logs for the actual error. The issue is likely:
1. Missing API keys in `.env`
2. Database query syntax issue
3. Missing data in tables

Check logs with:
```bash
# Server should be running - check terminal output
# Or:
ps aux | grep tsx | grep portfolio
```

