# ✅ Swagger is Ready!

## 🎉 Current Status

- ✅ Server running on `http://localhost:3000`
- ✅ Swagger UI available at `http://localhost:3000/api`
- ✅ All endpoints documented
- ✅ Database tables created in Supabase

## 📚 Access Swagger UI

**Open in your browser:**
```
http://localhost:3000/api
```

## 🔌 API Endpoints

### 1. POST /score/batch
**Create a batch scoring job**

Example:
```bash
curl -X POST http://localhost:3000/score/batch \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["AAPL", "GOOGL", "MSFT"]}'
```

Response:
```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 3,
  "status": "pending"
}
```

### 2. GET /score/:runId
**Get batch status and results**

Example:
```bash
curl http://localhost:3000/score/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "run": { "id": "...", "status": "complete", "total": 3, "completed": 3 },
  "completed": 3,
  "scores": [ /* array of scores */ ]
}
```

### 3. GET /score/ticker/:ticker
**Get latest score for a ticker**

Example:
```bash
curl http://localhost:3000/score/ticker/AAPL
```

Response:
```json
{
  "ticker": "AAPL",
  "score": "0.85",
  "confidence": "0.90",
  "direction": "up",
  "rationaleJson": { /* AI analysis */ },
  "risksJson": { /* risk assessment */ }
}
```

## 🎯 Try It Now

1. Open `http://localhost:3000/api` in your browser
2. You'll see the Swagger UI with all endpoints
3. Click "Try it out" on any endpoint
4. Fill in the parameters
5. Click "Execute"

## 📝 Note

The server is running but endpoints may return 500 errors because:
- You need to add your API keys to `.env`:
  - `GEMINI_API_KEY=your_key`
  - `ALPHA_API_KEY=your_key`

Once you add the API keys, the scoring will work!

