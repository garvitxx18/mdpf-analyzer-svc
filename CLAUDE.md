# Claude Development Notes

## Project Setup (Completed)

### What Was Done
- Initialized a new TypeScript/NestJS project with strict mode enabled
- Set up Drizzle ORM with PostgreSQL schema definitions
- Created comprehensive database schemas for all tables:
  - `securities` - master security data
  - `prices` - OHLCV market data
  - `news` - news articles with optional embeddings
  - `score_runs` - batch run metadata
  - `scores` - per-security Gemini AI scores
  - `input_cache` - deduplication cache
- Implemented schema-first development using Zod for runtime validation
- Created test factory functions following TDD principles
- Set up the basic NestJS application structure with score module

### File Structure Created
```
src/
  db/
    schemas.ts        # Zod schemas + Drizzle table definitions
    schema.ts         # Re-exports
    index.ts          # Database connection
    test-factories.ts # Test data builders
  services/
    securities/
      securities.service.ts  # Security CRUD operations
      securities.test.ts     # TDD tests
  score/
    score.module.ts    # NestJS module
    score.controller.ts # REST endpoints (stubbed)
    score.service.ts   # Business logic (stubbed)
  main.ts              # Application entry
  app.module.ts        # Root module
  index.ts            # Bootstrap
```

### Key Patterns Implemented

1. **Schema-First Development**: All schemas defined in Zod, types inferred from schemas
2. **Test Factory Pattern**: Factory functions with optional overrides for test data
3. **TDD Approach**: Tests written first, implementation follows
4. **Type Safety**: No `any` types, no type assertions, strict TypeScript config

### What Has Been Implemented

#### ✅ Sprint 1: Data Layer (AI-2 through AI-5) - COMPLETED
- ✅ Market data ingestor from Alpha Vantage API (`market-data.service.ts`)
- ✅ News enricher from Alpha Vantage News API (`news.service.ts`)
- ✅ Redis caching layer (`cache.service.ts`)
- ✅ Integration test harness with mocked APIs (`mock-apis.ts`)

#### ✅ Sprint 2: AI Scoring (AI-6 through AI-11) - COMPLETED
- ✅ Gemini prompt template with JSON schema (`gemini-prompt.ts`)
- ✅ Prompt builder utility (integrated in `gemini-prompt.ts`)
- ✅ Gemini client with retries and error handling (`gemini-client.ts`)
- ✅ Input hash deduplication (`deduplication.ts`)
- ✅ BullMQ worker for async scoring (`scoring.worker.ts`)
- ✅ Exponential backoff retry policy (implemented in GeminiClient)

#### ✅ Sprint 3: API + Persistence (AI-12 through AI-16) - COMPLETED
- ✅ REST API endpoints for batch scoring (`score.controller.ts`)
- ✅ Score run tracking (integrated in service)
- ✅ Score persistence (implemented in worker)
- ⏳ Observability logging (pending)

#### ⏳ Sprint 4: Quality & Deployment (AI-17 through AI-21) - IN PROGRESS
- ⏳ Observability logs (pending)
- ✅ JSON schema validation (implemented in GeminiClient with Zod)
- ⏳ Unit tests for scorer (pending - need integration tests)
- ⏳ E2E integration test (pending)
- ⏳ Dockerization (pending)

### Next Steps

1. Run database migrations: `npm run db:generate && npm run db:push`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Start implementing AI-2 (market data ingestor) with TDD

### Gotchas & Lessons Learned

- Drizzle ORM requires careful handling of nullable fields with `.default()` 
- Test factories should use Zod's `parse()` to ensure type safety
- Schema-first approach prevents type drift between DB and code
- Each service should have its own test file following naming pattern: `<service>.test.ts`

