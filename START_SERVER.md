# How to Start the Server

## Quick Start

```bash
npm run dev
```

This will start the server on `http://localhost:3000`

## What to Expect

1. **Server starting** - You'll see terminal output showing:
   - "Application is running on: http://localhost:3000"
   - "Swagger documentation: http://localhost:3000/api"

2. **Swagger UI** - Visit `http://localhost:3000/api` to see the API documentation

3. **Keep it running** - The server runs in watch mode, so it will auto-reload on code changes

## Troubleshooting

If the server doesn't start:

1. **Check database connection** - Make sure your `DATABASE_URL` is correct in `.env`
2. **Check if port 3000 is in use**:
   ```bash
   lsof -i :3000
   ```

3. **Try a different port**:
   ```bash
   PORT=3001 npm run dev
   ```

4. **Check logs** - Look at the terminal output for errors

## Stop the Server

Press `Ctrl+C` in the terminal where the server is running

