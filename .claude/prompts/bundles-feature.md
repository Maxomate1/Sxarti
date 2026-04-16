## Feature: Product Bundles with Optional Bot Auto-Suggest

### Context

- Products table: `products` (id, tenant_id, name, price, stock_quantity, images, variants, is_active)
- Bot pipeline: `src/lib/ai/pipeline.ts` — processes messages, executes actions (add_to_cart, create_order, etc.)
- System prompt: `src/lib/ai/prompts/system.ts` — builds context for Gemini including products, cart, stages
- Product management UI: `src/app/dashboard/products/page.tsx`, `src/components/products/product-form-modal.tsx`
- Types: `src/types/database.ts` (Product, CartItem, OrderItem interfaces)
- Migration naming: `supabase/migrations/YYYYMMDD00000N_description.sql`
- Supabase project: `ablvormhhqcjuoczlzng`

### Phase 1 — Database Schema

1. Create migration `20260329000001_create_bundles.sql`:
   - Table `bundles`: id (uuid PK), tenant_id (FK to tenants), name (text), description (text nullable), discount_type ('fixed' or 'percentage'), discount_value (numeric), is_active (boolean default true), bot_auto_suggest (boolean default false — when true, bot suggests this bundle if customer shows interest in ANY item in the bundle), created_at, updated_at
   - Table `bundle_items`: id (uuid PK), bundle_id (FK to bundles ON DELETE CASCADE), product_id (FK to products), quantity (int default 1)
   - RLS policies on both tables: tenant isolation (select/insert/update/delete where tenant_id matches auth user's tenant)
   - Indexes: bundle_items(bundle_id), bundle_items(product_id), bundles(tenant_id, is_active)
2. Apply migration via Supabase MCP, then verify RLS policies are active

### Phase 2 — TypeScript Types and Utilities

3. Add `Bundle` and `BundleItem` interfaces to `src/types/database.ts`
4. Create `src/lib/bundles.ts` — helper to fetch bundles with their items and computed bundle price for a tenant

### Phase 3 — Dashboard UI (Bundle Management)

5. Create `src/app/dashboard/bundles/page.tsx` — list all bundles for the tenant with create/edit/delete
6. Create `src/components/bundles/bundle-form-modal.tsx`:
   - Name, description fields
   - Product selector (multi-select from tenant's active products with quantity per item)
   - Discount type (fixed GEL or %) and discount value
   - Toggle: bot_auto_suggest
   - Show computed original price vs bundle price
7. Add nav item to dashboard sidebar
8. Mobile responsive, consistent with existing product management UI patterns

### Phase 4 — Bot Integration

9. In `src/lib/ai/prompts/system.ts`:
   - Add `bundles` to `SystemPromptInput` interface
   - Add new section listing active bundles with items, prices, and savings
   - For bundles with `bot_auto_suggest: true`, add explicit instruction for bot to suggest the bundle when customer is interested in any item from it
   - For bundles with `bot_auto_suggest: false`, just list them as available but don't instruct proactive suggestion
10. In `src/lib/ai/pipeline.ts`:
    - Fetch active bundles (with items) alongside products in the parallel context loading phase
    - Pass bundles to `buildSystemPrompt`
    - Add new action `add_bundle_to_cart` that adds all bundle items to cart with the discounted total
11. Update the JSON action format in system prompt section 10 to include add_bundle_to_cart action

### Phase 5 — Verification

12. Run `npm run build` — must pass with zero errors
13. Verify migration applied and RLS active via execute_sql
14. Test bundle CRUD from dashboard UI manually

### Success Criteria

- Business owners can create/edit/delete bundles from dashboard
- Each bundle links N products with quantities and a discount
- `bot_auto_suggest` toggle controls whether bot proactively offers the bundle
- Bot correctly suggests auto-suggest bundles when customer mentions a related product
- Bot does NOT suggest bundles where auto_suggest is off (but can mention if asked)
- Bundle price calculation: sum(product.price \* quantity) minus discount
- All tables have proper RLS tenant isolation

### Abort Conditions

- If migration fails: do not proceed, debug schema first
- If build fails after Phase 4: fix type/import errors before continuing
