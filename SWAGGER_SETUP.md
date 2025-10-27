# Swagger API Documentation

## Access

Once the server is running, Swagger UI will be available at:
- **URL**: `http://localhost:3000/api`
- **JSON Docs**: `http://localhost:3000/api-json`

## Features

### Endpoints Documented

1. **POST /score/batch** - Create a batch scoring job
   - Request body: `{ tickers: string[] }`
   - Returns: `{ runId, total, status }`

2. **GET /score/:runId** - Get batch status
   - Path param: `runId` (UUID)
   - Returns: `{ run, completed, scores }`

3. **GET /score/ticker/:ticker** - Get latest score for ticker
   - Path param: `ticker` (string)
   - Returns: Score object with fields

## Usage

1. Start the server:
   ```bash
   npm run dev
   ```

2. Open Swagger UI:
   - Navigate to `http://localhost:3000/api`

3. Try the API:
   - Use the "Try it out" button on any endpoint
   - Fill in the request parameters
   - Click "Execute"

## Example Request

```bash
# Start batch scoring
curl -X POST http://localhost:3000/score/batch \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["AAPL", "GOOGL", "MSFT"]}'

# Response:
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 3,
  "status": "pending"
}
```

