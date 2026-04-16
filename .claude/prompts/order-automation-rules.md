# Feature: Order Automation Rules (Next Steps / Triggers)

## Goal

Add a configurable rules engine to orders so business owners can define
automated actions that fire when an order reaches a specific status.
Examples: sync to Google Sheets on creation, message customer on delivery,
or both.

## Context (existing system)

- Order interface: src/types/database.ts (lines 117-134)
- Statuses: payment_status (pending | confirmed), delivery_status (pending | shipped | delivered)
- Orders page: src/app/dashboard/orders/page.tsx
- Notifications: src/lib/notifications/ (WhatsApp + Telegram, Georgian templates)
- Google Sheets: src/lib/sheets/sync.ts (product sync exists, order sync does not)
- Tenant config: tenants table has google_sheet_id, notification_config
- Supabase project: ablvormhhqcjuoczlzng

## Database (Supabase migration)

1. Create `order_rules` table:
   - id (uuid, PK)
   - tenant_id (uuid, FK → tenants)
   - name (text) — user-friendly label
   - trigger_event (text) — enum: 'order_created', 'payment_confirmed',
     'order_shipped', 'order_delivered'
   - action_type (text) — enum: 'google_sheet_sync', 'message_customer',
     'notify_owner'
   - action_config (jsonb) — flexible config per action type:
     - google_sheet_sync: { sheet_id?: string } (falls back to tenant default)
     - message_customer: { template: string } (Georgian text with {order_number},
       {customer_name} placeholders)
     - notify_owner: { message: string }
   - is_active (boolean, default true)
   - created_at, updated_at (timestamptz)
2. Add RLS policies: tenant can only CRUD their own rules
3. Verify RLS against live DB state

## Backend Logic

4. Create src/lib/orders/rules-engine.ts:
   - `executeOrderRules(tenantId, orderId, triggerEvent)`
   - Fetches active rules matching the trigger, executes each action
   - For google_sheet_sync: append order row to sheet (extend existing
     src/lib/sheets/sync.ts with an `appendOrderToSheet` function)
   - For message_customer: use existing notification system to send
     the configured template text via the bot's channel (Facebook/Instagram)
   - For notify_owner: use existing `notifyOwner()` from src/lib/notifications/
5. Hook rule execution into the order status update flow in the orders page
   (src/app/dashboard/orders/page.tsx, around lines 96-108 where statuses
   are updated)

## Dashboard UI

6. Create src/app/dashboard/orders/rules/page.tsx:
   - List existing rules with toggle (active/inactive)
   - Add/Edit rule modal with:
     - Trigger dropdown (4 events)
     - Action type dropdown (3 actions)
     - Dynamic config form based on action type
     - Template editor with placeholder hints for message_customer
   - Delete rule (with confirmation)
7. Add "ავტომატიზაცია" (Automation) tab/link in orders page or sidebar
   navigation, consistent with existing nav patterns
8. Mobile-responsive, matches existing Tailwind design patterns

## Verification

- [ ] npm run build passes with zero errors
- [ ] RLS policies verified on live Supabase DB
- [ ] Rules CRUD works from dashboard
- [ ] Rule fires correctly when order status changes
- [ ] Google Sheet gets new row on order_created trigger
- [ ] Customer receives message on delivery trigger

## Abort Conditions

- Stop if Google Sheets auth requires new service account setup (flag it)
- Stop if modifying order status flow would break existing notification logic
- Do not touch existing notification templates — only add new rule-driven ones
