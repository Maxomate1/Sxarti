## Fix Two Critical Messenger Bot Issues

### Issue 1: Message Debouncing (Bot responds separately to each rapid message)

**Problem:** `src/app/api/webhooks/facebook/route.ts` processes each incoming message
immediately via `processMessage()` with NO debouncing. When a user sends three separate
messages that form one sentence, the bot generates 3 independent AI responses instead
of 1 combined response.

**Fix approach:** Implement a debounce mechanism in the pipeline so that rapid-fire
messages from the same sender are batched before triggering AI:

1. In `src/lib/ai/pipeline.ts`, after storing the customer message (step 5, around line 166),
   add a debounce wait (2-3 seconds)
2. After the wait, query for any newer customer messages in the same conversation that
   arrived during the wait window
3. If newer messages exist, skip AI processing for this invocation (return early) --
   the newest message handler will process all accumulated messages
4. If no newer messages, proceed with AI (all prior messages are already in conversation
   history, so Gemini sees the full context)
5. Edge case: Ensure the debounce does not break the platformMessageId deduplication
   check (step 2, around line 80)

**Key files:**

- `src/lib/ai/pipeline.ts` -- add debounce logic after message insert
- `src/app/api/webhooks/facebook/route.ts` -- no changes needed (already sequential)

### Issue 2: Customer Name Not Fetched (shows unknown)

**Problem:** When a new conversation starts, customer_info is null and customer_name
is never populated. The Facebook Graph API is never called to get the sender profile
(first_name, last_name). The sidebar shows a question mark instead of the customer name.

**Fix approach:** After identifying the tenant and before/during conversation creation,
call the Facebook Graph API to fetch the sender profile:

1. In `src/lib/ai/pipeline.ts`, after finding/creating the conversation (around line 131),
   call the Facebook Graph API: GET /{platformUserId}?fields=first_name,last_name&access_token={token}
2. Update the conversation record with customer_name (first_name + last_name) and
   set customer_info.name so the AI and dashboard both have the name
3. Only fetch profile on NEW conversations (not every message) to avoid unnecessary API calls
4. Handle errors gracefully -- if the Graph API call fails (permissions, rate limits),
   continue without the name (do not block the conversation)
5. For Instagram platform, use the equivalent Instagram Graph API endpoint

**Key files:**

- `src/lib/ai/pipeline.ts` -- add profile fetch after conversation creation
- `src/lib/facebook/messenger.ts` -- add getUserProfile() helper function

### Verification

- Build must pass: npm run build
- Deploy to Vercel production after fix
- Test: Send 3 rapid messages on Messenger and verify only 1 bot response
- Test: Start a new conversation and verify customer name appears in dashboard
