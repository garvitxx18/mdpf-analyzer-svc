# Setup Instructions - Database Migration Issue Found

## Issue

The database connection is timing out when trying to create tables directly.

## Solution

Since you have a Supabase database, you have two options:

### Option 1: Use Supabase Dashboard (Recommended)

1. Go to your Supabase project
2. Click on the **SQL Editor**
3. Copy the contents of `src/db/drizzle/migrations/0000_soft_steel_serpent.sql`
4. Paste and execute in the SQL Editor

### Option 2: Use Supabase CLI

```bash
# Install Supabase CLI if not installed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Current Status

✅ Project builds successfully  
✅ All TypeScript errors fixed  
✅ Database schemas defined  
⏳ Need to create tables in Supabase database  
⏳ Need to start dev server

## Next Steps

1. **Create tables in Supabase** (use Option 1 above)
2. **Add your API keys to `.env`**:
   ```
   GEMINI_API_KEY=your_key_here
   ALPHA_API_KEY=your_key_here
   ```
3. **Start the dev server**:
   ```bash
   npm run dev
   ```

The migration file is located at: `src/db/drizzle/migrations/0000_soft_steel_serpent.sql`

