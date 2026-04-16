## Task: Fix Sxarti Bot — Database Schema Missing from Supabase

### Problem

Supabase project nnxyvwkgaybthqpebjek has only MyBakuriani tables.
Sxarti's 26 migrations (supabase/migrations/) were never applied.
The bot can't find products, conversations, or business config → hallucinated responses.

### Phase 1: Apply Sxarti Migrations

1. Review all 26 migration files in supabase/migrations/ for order and dependencies
2. Apply each migration sequentially using Supabase MCP `apply_migration` tool
3. Verify all expected tables exist: businesses, products, conversations, messages, orders, delivery_zones, faqs, bundles, etc.
4. Verify RLS policies are active on all tables

### Phase 2: Verify Edge Functions

1. Check that webhook-facebook and ai-respond edge functions are deployed and pointing to correct Supabase URL/keys
2. Review edge function code for any hardcoded wrong project references
3. Test edge function connectivity to the database

### Phase 3: Verify Bot Data Flow

1. Check .env.local for correct SUPABASE_URL and SUPABASE_ANON_KEY
2. Check if there's seed data needed (at minimum: one business record)
3. Trace the message flow: webhook receives → conversation created → AI generates response → message stored → response sent back
4. Identify any code that silently fails when tables are missing

### Phase 4: Investigate Bot Response Quality

1. Review how the AI prompt is constructed (what context is passed to Gemini)
2. Check how products are fetched and included in the AI context
3. Check how product images are sent (the medieval warrior images suggest wrong image URLs or missing product data)
4. Verify the system prompt instructs the bot to only recommend actual products

### Success Criteria

- All Sxarti tables exist in the database with correct RLS
- Bot messages create records in conversations and messages tables
- Bot responses reference actual products from the products table
- No hallucinated product info or wrong images

### Abort Conditions

- If migrations conflict with existing MyBakuriani tables → STOP and report
- If applying migrations would delete MyBakuriani data → STOP and report
