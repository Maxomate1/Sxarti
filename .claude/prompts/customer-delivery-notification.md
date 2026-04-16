# Feature: Default Customer Notification on Order Delivery

## Goal

When an order's delivery_status is changed to "delivered", automatically send
a message to the customer through their original conversation channel
(Messenger/Instagram). This should be a built-in behavior — not dependent on
the user creating an automation rule.

## Context (existing system)

- Rules engine already has `message_customer` logic: src/lib/orders/rules-engine.ts (lines 87-157)
  - Looks up conversation via order.conversation_id
  - Sends via sendMessageWithRetry / sendInstagramMessageWithRetry
  - Stores message in messages table
- Order status updates: src/app/dashboard/orders/page.tsx (handleStatusUpdate)
- API endpoint: src/app/api/orders/execute-rules/route.ts
- Tenant settings page: src/app/dashboard/settings/page.tsx
- Tenant interface: src/types/database.ts (Tenant type)

## Implementation

1. Add a `delivery_message_template` field to the tenants table (Supabase migration)
   - Default: 'გამარჯობა {customer_name}! თქვენი შეკვეთა #{order_number} მიწოდებულია. მადლობა შეძენისთვის!'
   - Nullable text field — if null, use default Georgian template above

2. Create `sendCustomerMessage(tenantId, orderId, messageText)` utility in
   src/lib/orders/rules-engine.ts (extract from existing message_customer case
   to avoid duplication)

3. Add a new function `notifyCustomerOnDelivery(tenantId, orderId)` that:
   - Fetches the tenant's delivery_message_template (or uses default)
   - Interpolates {order_number}, {customer_name}, {total} etc.
   - Calls sendCustomerMessage

4. Hook into the order status update flow — when delivery_status → "delivered",
   call notifyCustomerOnDelivery in the background (same pattern as rule execution
   in src/app/dashboard/orders/page.tsx lines 109-123)

5. Add template configuration to tenant settings page:
   - Textarea for delivery message template
   - Placeholder hints (same as automation rules page)
   - Save to tenants.delivery_message_template

6. Update Tenant TypeScript interface with delivery_message_template field

## Verification

- [ ] npm run build passes
- [ ] RLS unchanged (using existing tenants table)
- [ ] Setting delivery_status to "delivered" sends message to customer
- [ ] Custom template from settings is used when configured
- [ ] Default Georgian template used when no custom template set
- [ ] Message appears in conversation history (messages table)

## Abort Conditions

- Do not modify existing automation rules behavior
- Do not duplicate the message if user also has an automation rule for order_delivered + message_customer
