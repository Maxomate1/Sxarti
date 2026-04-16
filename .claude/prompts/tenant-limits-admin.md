## Task: Per-Business Admin Controls for Conversation & Context Limits

### Context

Currently, message history limits are hardcoded:

- Customer chatbot: `.limit(20)` in `supabase/functions/ai-respond/index.ts:39` and `src/lib/ai/pipeline.ts:192`
- Owner AI chat: `.limit(20)` and 10,000 char limit in `src/app/api/ai-chat/route.ts:132,56`
- Monthly conversation quotas: hardcoded in `src/components/admin/billing/subscriber-table.tsx:63-67`

An existing pattern for per-plan admin config exists: `web_search_limits` table + `src/components/admin/settings/web-search-settings.tsx`.

### Requirements

**Phase 1 — Database Migration**

1. Create `tenant_limits` table (or add columns to `tenants`) with per-tenant overrides:
   - `max_bot_messages` (int, default 20) — how many recent messages the chatbot loads as context
   - `max_owner_chat_messages` (int, default 20) — owner AI chat message history window
   - `max_owner_chat_chars` (int, default 10000) — owner AI chat per-message character limit
   - `max_conversations_monthly` (int, nullable) — override monthly conversation quota (null = use plan default)
2. Add appropriate RLS policies (admin read/write, tenant read-only on own row).
3. Seed default values matching current hardcoded limits.

**Phase 2 — Backend: Use Dynamic Limits** 4. In `supabase/functions/ai-respond/index.ts` — replace hardcoded `.limit(20)` with tenant's `max_bot_messages` value fetched from DB. 5. In `src/lib/ai/pipeline.ts` — same: replace `.limit(20)` with dynamic value. 6. In `src/app/api/ai-chat/route.ts` — replace `.limit(20)` with `max_owner_chat_messages` and `10000` char limit with `max_owner_chat_chars`. 7. Add a shared helper (e.g. `src/lib/tenant-limits.ts`) to fetch and cache tenant limits to avoid repeated queries.

**Phase 3 — Admin UI** 8. Add a "Business Limits" settings section in the admin panel (either a new tab in `/admin/settings` or inline in the business detail modal at `/admin/businesses`). 9. UI should show per-business override fields:

- Bot context messages (slider or number input, range 5-50)
- Owner chat context messages (range 5-50)
- Owner chat character limit (range 5,000-50,000)
- Monthly conversation limit (number input or "use plan default" toggle)

10. Follow existing admin settings patterns (see `web-search-settings.tsx` for reference).
11. Include confirmation dialog before saving changes.

**Phase 4 — Verification** 12. Verify the edge function `ai-respond` correctly loads dynamic limit (test with Supabase logs). 13. Verify admin UI correctly reads/writes to DB. 14. Verify a tenant with increased limits (e.g. 40 messages) actually gets larger context in chatbot responses. 15. Run `npm run build` — zero errors.

### Constraints

- Do NOT change platform message length limits (2000 FB / 1000 IG) — those are API constraints.
- Maintain backward compatibility: existing tenants without overrides use current defaults.
- All DB changes via Supabase MCP `apply_migration`.
- Use existing admin layout patterns and Tailwind styling.
