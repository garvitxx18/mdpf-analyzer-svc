# Portfolio Analyzer Service

AI-powered portfolio scoring and rebalancing service that uses Gemini AI to analyze securities and generate performance scores.

## Features

- Market data ingestion from Alpha Vantage
- News enrichment and analysis
- AI-powered scoring using Google Gemini
- Batch scoring with async processing
- RESTful API for scoring operations

## Prerequisites

- Node.js 18+
- Supabase account and project

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database - Supabase connection URL
DATABASE_URL=postgresql://user:password@host:5432/database

# API Keys
GEMINI_API_KEY=your_gemini_api_key
ALPHA_API_KEY=your_alpha_api_key

# Server
PORT=3000
```

Get your Supabase connection string from: Project Settings → Database → Connection string

## Development

```bash
# Set up your .env file with Supabase DATABASE_URL
cp .env.example .env
# Add your Supabase connection URL to .env

# Run database migrations
npm run db:generate
npm run db:push

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
  db/              # Database schemas and connection
  services/        # Business logic
  score/           # Scoring module (controllers, services, workers)
```

## Testing

Follows Test-Driven Development (TDD) principles. All production code is written in response to failing tests.

## License

MIT

