# Fix Two Critical Bot Issues in webhook-facebook Edge Function

## Issue 1: Add Message Debouncing (Batching)

**File:** supabase/functions/webhook-facebook/index.ts

When a customer sends multiple messages in quick succession (word by word), each message currently triggers a separate AI response. Implement a debounce mechanism:

1. When a message arrives, store it in the messages table as usual
2. Before calling ai-respond, check if there are recent messages from the same sender (within last 3 seconds) that haven't been responded to yet
3. If yes, skip the AI call - a later message will batch them together
4. If no new messages arrive within 3 seconds, proceed with AI call (ai-respond already loads full conversation history, so it will see all messages)

Implementation approach: Use a simple timestamp-based check in the webhook. After storing the message, wait ~3 seconds, then query for any newer unresponded messages from same sender. If current message is still the latest, proceed with AI call. If not, skip (the newer message's handler will process the batch).

## Issue 2: Fix Order Flow in System Prompt

**File:** supabase/functions/ai-respond/index.ts

The bot is redirecting customers to a human operator when they express purchase intent, instead of collecting order details. Review and fix the system prompt (Georgian) to ensure:

1. When customer shows purchase intent, the bot MUST collect: name, phone number, delivery address
2. Bot should NOT redirect to operator for standard purchases
3. Only redirect to operator for genuinely complex/custom requests that the bot truly cannot handle
4. After collecting all required info, confirm the order details and create the order

## Verification

- Deploy both edge functions to Supabase (project: ablvormhhqcjuoczlzng)
- Test debounce: rapid messages should produce ONE combined response
- Test order flow: purchase intent should trigger info collection, not operator redirect
