# Owner AI Chat — Web Search via Gemini Grounding

**Date:** 2026-03-24
**Status:** Approved
**Scope:** Owner AI business assistant only (not customer-facing bot)

## Summary

Add web search capability to the owner's AI chat using Gemini's built-in Google Search grounding. The feature is gated by a manual toggle in the chat UI, rate-limited per subscription plan, and admin-configurable.

## Goals

- Owner can toggle web search on/off per message
- AI blends web results naturally into responses + shows collapsible sources
- Rate limits per plan, enforced server-side
- Admin can configure limits from the dashboard

## Non-Goals

- Customer-facing bot web search (future scope)
- Custom search providers or external search APIs
- Caching search results

---

## Database Schema

### Table: `web_search_limits`

Admin-configurable rate limits per subscription plan.

| Column        | Type        | Default           | Notes                                                         |
| ------------- | ----------- | ----------------- | ------------------------------------------------------------- |
| id            | uuid        | gen_random_uuid() | PK                                                            |
| plan_id       | text        | —                 | CHECK (plan_id IN ('starter', 'business', 'premium')), unique |
| monthly_limit | integer     | —                 | 0 = disabled, -1 = unlimited                                  |
| created_at    | timestamptz | now()             |                                                               |
| updated_at    | timestamptz | now()             |                                                               |

**Default seed data:**

- starter: 10
- business: 50
- premium: -1 (unlimited)

**RLS Policies:**

- `SELECT` for authenticated users via `is_admin()` function (admin dashboard)
- `SELECT` for authenticated users where `plan_id = (SELECT subscription_plan FROM tenants WHERE owner_id = auth.uid())` (owners read their own plan limit)
- `UPDATE` for admin only via `is_admin()`
- Service role bypasses RLS (used by RPC)

### Table: `web_search_usage`

Tracks per-tenant monthly usage.

| Column      | Type        | Notes                                 |
| ----------- | ----------- | ------------------------------------- |
| id          | uuid        | PK, gen_random_uuid()                 |
| tenant_id   | uuid        | FK → tenants                          |
| month       | date        | First day of month (e.g., 2026-03-01) |
| usage_count | integer     | Default 0, incremented per search     |
| created_at  | timestamptz | now()                                 |
| updated_at  | timestamptz | now()                                 |

**Constraints:** Unique on (tenant_id, month).

**RLS Policies:**

- `SELECT` for owners: `tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())`
- `SELECT` for admin via `is_admin()`
- Insert/update via service role only (through RPC)

### RPC: `increment_web_search_usage`

`SECURITY DEFINER` function that accepts only `p_tenant_id uuid`:

1. Looks up `tenants.subscription_plan` internally (caller cannot spoof plan)
2. Fetches `monthly_limit` from `web_search_limits` for that plan
3. Upserts `web_search_usage` for current month, increments `usage_count`
4. Returns `{ allowed: boolean, usage: number, limit: number }`

Usage is incremented optimistically. If Gemini grounding fails or is not used, the usage still counts — this is the simplest approach and avoids rollback complexity. The quota represents "requests with web search enabled," not "successful web searches."

---

## Backend Changes

### `/src/app/api/ai-chat/route.ts`

This is where the owner chat Gemini call lives (NOT `/src/lib/ai/gemini.ts`, which is customer-bot-specific).

- Accept `webSearchEnabled: boolean` in POST request body
- If `webSearchEnabled`:
  1. Call `increment_web_search_usage` RPC — if not allowed, respond without web search and include quota warning in SSE
  2. Pass `tools: [{ googleSearchRetrieval: {} }]` to Gemini call
  3. After streaming completes, call `await result.response` to get the aggregated response with `groundingMetadata`
  4. Extract sources from `response.candidates[0].groundingMetadata.groundingChunks` (note: SDK may use `groundingChuncks` — verify at implementation time)
  5. Send citations as a final SSE event: `{ type: "sources", data: [{ title, url }] }`

### Streaming + Metadata Extraction

Gemini's `groundingMetadata` is available on the aggregated response, not individual stream chunks. Pattern:

```
const result = model.generateContentStream(...)
// Stream text chunks to client via SSE
for await (const chunk of result.stream) { ... }
// After stream completes, get grounding metadata
const aggregated = await result.response
const sources = aggregated.candidates?.[0]?.groundingMetadata?.groundingChunks
```

---

## Frontend Changes

### Chat Input Area

- **Web search toggle**: Icon button (globe icon) next to message input
  - On: highlighted/active state
  - Off: muted/default state
  - Disabled + tooltip when: plan limit is 0, or monthly quota exhausted
- **Quota indicator**: Small text below or beside toggle: "5/50 searches this month"
  - Hidden when limit is -1 (unlimited)
  - Red when >= 80% used

### Chat Message Display

- **Sources section**: Collapsible block below AI responses that used web search
  - Header: "Sources (N)" with expand/collapse chevron
  - Content: List of linked titles (title + URL)
  - Collapsed by default
- **Web search badge**: Small indicator on messages that used web search

### `ai_chat_messages` Schema Extension

Add to existing table:

- `used_web_search boolean DEFAULT false` — persists whether message used web search (for badge on reload)
- Extend `sources` JSONB to support web sources: `{ type: "web", title: string, url: string }` alongside existing `{ type: "products", label, count }` format

### API Integration

- New hook: `useWebSearchQuota(tenantId)` — fetches current usage + limit from `web_search_usage` + `web_search_limits`
- Passes `webSearchEnabled` flag with each chat message request

---

## Admin Dashboard

### Web Search Settings Section

Located in admin settings (existing admin area). Uses `is_admin()` RLS + admin Supabase client.

- Table view: Plan | Monthly Limit | Actions
- Inline edit or modal for updating limits per plan
- Input validation: integer >= -1 (-1 = unlimited, 0 = disabled)
- Changes take effect immediately (no restart needed)
- Uses admin-authenticated Supabase client (RLS allows admin via `is_admin()`)

---

## Data Flow

```
1. Owner toggles web search ON in chat UI
2. Owner sends message
3. POST /api/ai-chat { message, webSearchEnabled: true }
4. Server calls increment_web_search_usage RPC (SECURITY DEFINER, looks up plan internally)
   - If quota exceeded → proceed without web search, return quota warning
   - If allowed → usage incremented, continue
5. Call Gemini with tools: [{ googleSearchRetrieval: {} }]
6. Gemini searches Google, generates grounded response
7. Stream text chunks to client via SSE
8. After stream completes, extract groundingMetadata from aggregated response → sources
9. Send final SSE sources event + save message with used_web_search=true and web sources
10. Frontend renders response with collapsible sources
11. Quota indicator updates via hook refetch
```

---

## Error Handling

- **Quota exceeded**: AI still responds but without web search; UI shows "Monthly search limit reached"
- **Gemini grounding fails**: AI falls back to non-grounded response; usage still counts (optimistic increment)
- **Network errors**: Standard retry logic already in place

---

## Testing Plan

1. Unit: `increment_web_search_usage` RPC returns correct allowed/denied for each plan
2. Unit: RPC rejects spoofed tenant_id (user can only increment for their own tenant)
3. Integration: AI chat route with/without web search flag
4. E2E: Toggle, send message, verify sources appear, quota decrements
5. Edge cases: Quota boundary (last search), plan with 0 limit, unlimited plan (-1)
6. Security: Cross-tenant usage reads blocked by RLS, plan_id CHECK constraint prevents invalid plans
