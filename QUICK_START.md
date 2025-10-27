# Quick Start Guide

## ✅ What's Done

1. ✅ Project builds successfully  
2. ✅ Swagger documentation added  
3. ✅ All endpoints documented  
4. ⏳ Tables need to be created in Supabase  
5. ⏳ API keys need to be configured  

## 🚀 Start the Server

```bash
npm run dev
```

The API will be available at:
- **API**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`

## 📋 Before You Start

### 1. Create Database Tables

Go to your Supabase SQL Editor and run the contents of:
`src/db/drizzle/migrations/0000_soft_steel_serpent.sql`

Or use the Supabase CLI:
```bash
supabase db push
```

### 2. Configure API Keys

Edit `.env` file:
```bash
DATABASE_URL=your_supabase_url  # Already configured ✅
GEMINI_API_KEY=your_gemini_key   # Add this
ALPHA_API_KEY=your_alpha_key     # Add this
```

### 3. Test the API

Once running, visit `http://localhost:3000/api` to see the Swagger documentation.

Try the endpoints:
```bash
# 1. Create a batch job
curl -X POST http://localhost:3000/score/batch \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["AAPL"]}'

# 2. Check status
curl http://localhost:3000/score/{runId}

# 3. Get ticker score
curl http://localhost:3000/score/ticker/AAPL
```

## 🎯 Next Steps

1. Create tables in Supabase (SQL Editor)
2. Add API keys to `.env`
3. Run `npm run dev`
4. Visit `http://localhost:3000/api` for Swagger docs

