# Portfolio Analyzer - Current Flow Explained

## 🎯 Overall Architecture

```
User Request → NestJS API → Services → Gemini AI → Database
                         ↓
                    External APIs
               (Alpha Vantage, Supabase)
```

## 📊 Data Flow

### 1. Batch Scoring Request Flow

```
POST /score/batch
  │
  ├─ Request: { tickers: ["AAPL", "GOOGL", "MSFT"] }
  │
  ├─ Generate runId (UUID)
  │
  ├─ Create score_runs record in DB
  │
  └─ For each ticker:
      │
      ├─ Fetch Market Data (Alpha Vantage)
      │  └─ Open, High, Low, Close, Volume
      │
      ├─ Fetch News (Alpha Vantage)
      │  └─ Recent articles with relevance scores
      │
      ├─ Build Prompt
      │  └─ Combine market data + news context
      │
      ├─ Send to Gemini AI
      │  └─ Get AI-generated score with:
      │     - score (0-1)
      │     - confidence (0-1)
      │     - direction (up/flat/down)
      │     - rationale (why)
      │     - risks (what could go wrong)
      │
      └─ Save to scores table in Supabase
```

### 2. Get Batch Status Flow

```
GET /score/:runId
  │
  ├─ Query score_runs table
  │  └─ Get run metadata
  │
  ├─ Query scores table by runId
  │  └─ Get all scores for this batch
  │
  └─ Return: { run, completed, scores }
```

### 3. Get Ticker Score Flow

```
GET /score/ticker/:ticker
  │
  ├─ Query scores table
  │  └─ Get latest score for ticker
  │
  └─ Return: { score, confidence, direction, ... }
```

## 🗂️ Database Tables (Supabase)

### 1. `securities` - Master stock list
- Stores ticker, name, sector, industry
- Primary reference for all securities

### 2. `prices` - Market data
- OHLCV data from Alpha Vantage
- Historical price data for analysis

### 3. `news` - News articles
- Recent news about each ticker
- Includes relevance scores

### 4. `score_runs` - Batch tracking
- Tracks each batch scoring job
- Status: pending → running → complete/failed

### 5. `scores` - AI-generated scores
- Gemini AI output for each ticker
- Includes score, confidence, rationale, risks

### 6. `input_cache` - Deduplication
- Prevents re-scoring same data
- 6-hour expiry window

## 🔧 Current Components

### ✅ Working
- Database schema defined (Zod + Drizzle)
- Database connection to Supabase
- Tables created in Supabase
- Market data fetcher (Alpha Vantage)
- News fetcher (Alpha Vantage)
- Gemini client with retry logic
- API endpoints defined
- TypeScript strict mode
- Test factories for all entities

### ⏳ Needs Fixing
- Swagger documentation (compatibility issue)
- Server not starting due to Swagger error
- Database tables need to be verified

### 🚀 To Use

1. **Start the server** (after fixing Swagger):
   ```bash
   npm run dev
   ```

2. **Create a batch job**:
   ```bash
   curl -X POST http://localhost:3000/score/batch \
     -H "Content-Type: application/json" \
     -d '{"tickers": ["AAPL", "GOOGL"]}'
   ```

3. **Check status**:
   ```bash
   curl http://localhost:3000/score/{runId}
   ```

4. **Get ticker score**:
   ```bash
   curl http://localhost:3000/score/ticker/AAPL
   ```

## 🔑 Environment Variables Needed

```bash
# Database (✅ Configured)
DATABASE_URL=your_supabase_url

# APIs (⏳ Need to add)
GEMINI_API_KEY=your_key
ALPHA_API_KEY=your_key
```

## 📝 Next Steps

1. **Fix Swagger** - Remove incompatible decorators
2. **Start Server** - Should work without Swagger
3. **Test API** - Use curl or Postman
4. **Add API Keys** - Configure in .env
5. **Run First Scoring** - Test with a ticker

