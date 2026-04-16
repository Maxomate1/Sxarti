# Implement Web Search via Gemini Grounding for Owner AI Chat

Follow spec: docs/superpowers/specs/2026-03-24-owner-chat-web-search-design.md

## Phase 1: Database Migration

Create migration supabase/migrations/YYYYMMDDHHMMSS_add_web_search.sql with:

1. **web_search_limits table** — admin-configurable rate limits per plan
   - Columns: id (uuid PK), plan_id (text, UNIQUE, CHECK IN starter/business/premium), monthly_limit (integer), created_at, updated_at
   - Seed: starter=10, business=50, premium=-1
   - RLS: SELECT for admin via is_admin(), SELECT for owners matching their plan, UPDATE for admin only

2. **web_search_usage table** — per-tenant monthly usage
   - Columns: id (uuid PK), tenant_id (FK to tenants), month (date), usage_count (int DEFAULT 0), created_at, updated_at
   - UNIQUE on (tenant_id, month)
   - RLS: SELECT for owners via tenant ownership, SELECT for admin, insert/update via service role

3. **increment_web_search_usage RPC** — SECURITY DEFINER function
   - Accepts only p_tenant_id uuid
   - Internally looks up subscription_plan from tenants (no caller spoofing)
   - Fetches monthly_limit from web_search_limits
   - Upserts web_search_usage for current month, increments usage_count
   - Returns JSON: { allowed: boolean, usage: int, limit: int }

4. **Alter ai_chat_messages**: add used_web_search boolean DEFAULT false

After creating migration, apply it via Supabase MCP apply_migration tool. Then verify against live DB with execute_sql that tables exist and RLS policies are correct.

## Phase 2: Backend — API Route Changes

Modify /src/app/api/ai-chat/route.ts:

1. Accept webSearchEnabled: boolean in POST body
2. If webSearchEnabled:
   - Call increment_web_search_usage RPC with tenant_id
   - If not allowed, proceed WITHOUT web search, send SSE warning event
   - If allowed, add tools: [{ googleSearchRetrieval: {} }] to Gemini call
3. After streaming completes, call await result.response to get aggregated response
4. Extract sources from response.candidates?.[0]?.groundingMetadata?.groundingChunks
   - Note: SDK v0.21 may use groundingChuncks (typo) — check both spellings
5. Send final SSE event: data: { sources: [...webSources], type: "web_sources" }
6. Save message with used_web_search: true and web sources in sources JSONB

Important: The existing SSE format is data: {text, done, sources, session_id}\n\n. Add web sources as additional entries in the sources array with format { type: "web", title: string, url: string }.

## Phase 3: Frontend — Chat UI Changes

Modify /src/app/dashboard/ai-chat/page.tsx:

1. **Web search toggle button**: Globe icon (Lucide Globe or Search) next to the message textarea
   - Active state: highlighted/primary color
   - Inactive: muted/gray
   - Disabled + tooltip when quota exhausted or plan limit is 0
   - Store toggle state in component state

2. **Quota indicator**: Small text near toggle showing "5/50 ძებნა ამ თვეში"
   - Hidden when limit is -1 (unlimited)
   - Red text when 80% or more used
   - Georgian language labels

3. **Sources display on messages**: Collapsible block below AI responses
   - Header: "წყაროები (N)" with chevron
   - List of clickable links (title + URL, opens in new tab)
   - Collapsed by default
   - Only shown when message has web sources

4. **Web search badge**: Small indicator on messages where used_web_search is true

5. **useWebSearchQuota hook**: New hook in /src/hooks/ or inline
   - Fetches current usage from web_search_usage + limit from web_search_limits
   - Returns { usage, limit, isExhausted, isLoading }
   - Refetches after each web search message

6. Pass webSearchEnabled flag in fetch body to /api/ai-chat

## Phase 4: Admin Dashboard

Add web search settings section in the admin area:

1. Table view showing: Plan | Monthly Limit | Actions (edit)
2. Inline edit for updating limits per plan
3. Input validation: integer that is -1 or higher (-1 means unlimited, 0 means disabled)
4. Uses admin Supabase client with is_admin() RLS

## Verification Checklist

- npm run build passes with no TypeScript errors
- Migration applied successfully, tables visible in Supabase
- RLS policies verified: owner can only read own usage, admin can read/update all
- Toggle sends webSearchEnabled flag correctly
- Quota increments and blocks when exceeded
- Sources render correctly with collapsible UI
- Unlimited plan (-1) shows no quota indicator
- Messages with used_web_search true show badge on reload

## Abort Conditions

- If Gemini SDK v0.21 doesnt support googleSearchRetrieval tool, stop and report — may need SDK upgrade
- If groundingMetadata is not present on aggregated response, check SDK docs via Context7 before proceeding
