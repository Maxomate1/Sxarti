# Sxarti Website & Product Improvement Recommendations

**Date:** 2026-03-28
**Based on:** Georgian SMB market research + full codebase audit
**Priority scoring:** Impact (H/M/L) × Effort (S/M/L) — best items are High Impact + Small Effort

---

## Executive Summary

Sxarti sits in a **completely uncontested market** — zero competitors offer AI sales chatbot automation in Georgian. The product core is strong, but the website and onboarding have critical gaps that could block conversion. The biggest opportunity is not building more features — it's **removing friction and building trust** for a market where 98% of SMEs have never used AI.

**Top 3 priorities:**

1. Fix the pricing inconsistency (confusing potential customers right now)
2. Complete the onboarding flow (Facebook connection is a stub)
3. Add real social proof and market education (videos, case studies, ROI calculator)

---

## Category 1: Quick Wins (Small effort, immediate impact)

### QW-1. Fix Marketing Page Pricing Inconsistency

- **Impact:** HIGH | **Effort:** SMALL
- **Problem:** Marketing page shows Starter at ₾79 with 500 conversations. Actual system price is ₾49 with 100 conversations. Every other page (settings, admin, billing) uses ₾49.
- **Action:** Update `marketing-page.tsx` lines 51-93 to match real prices: Starter ₾49 (100 convos), Business ₾149 (500 convos), Premium ₾299 (unlimited).
- **Rationale:** Price confusion kills conversion. In a price-sensitive market (avg salary ₾1,800-2,500/mo), showing ₾79 instead of ₾49 could lose 30%+ of potential signups.

### QW-2. Add ROI Calculator to Marketing Page

- **Impact:** HIGH | **Effort:** SMALL
- **Problem:** 98% of Georgian SMEs never used AI. They need concrete proof that ₾49/mo pays for itself.
- **Action:** Simple interactive widget: "How many DMs do you get per day?" → "That's X hours/month of manual work. Sxarti handles it for ₾49/month — less than ₾2/day."
- **Rationale:** Research shows clear ROI justification is essential for price-sensitive Georgian market. Convert abstract "AI chatbot" into tangible time/money savings.

### QW-3. Add Real Testimonials & Case Studies

- **Impact:** HIGH | **Effort:** SMALL
- **Problem:** Current testimonials are hardcoded placeholder text. No real social proof.
- **Action:** Replace with 3-5 real customer quotes (even if from beta users). Add business name, photo, industry. Include specific metrics: "გაყიდვები 40%-ით გაიზარდა" ("Sales increased 40%").
- **Rationale:** Georgian business culture values personal trust and word-of-mouth. Real testimonials from recognizable local businesses are the #1 trust signal.

### QW-4. Add "How It Works" Video Section (Georgian)

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** No visual explanation of how the product works. Low digital literacy audience needs to SEE it, not read about it.
- **Action:** Record 60-90 second Georgian-language demo video showing: customer sends message → bot responds → order created → owner sees it on dashboard. Embed on marketing page.
- **Rationale:** Research confirms digital literacy is low. Video tutorials in Georgian are the #1 recommended onboarding approach for this market.

### QW-5. Improve Hero Section Messaging

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** Current hero "შენი გაყიდვები არასდროს იძინებს" (Your sales never sleep) is catchy but doesn't explain what the product does.
- **Action:** Add a sub-headline that explains the value: "AI ასისტენტი, რომელიც Facebook-ზე და Instagram-ზე შენს მყიდველებს ქართულად ემსახურება 24/7" (AI assistant that serves your customers in Georgian on Facebook and Instagram 24/7).
- **Rationale:** With 98% of SMEs unfamiliar with AI chatbots, the hero must educate, not just intrigue.

### QW-6. Add Trust Badges & Statistics

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** No trust signals beyond the "14 days free" mention.
- **Action:** Add a trust bar: "X+ ბიზნესი უკვე იყენებს" (X+ businesses already use it), "Y+ შეკვეთა დამუშავებული" (Y+ orders processed), "24/7 ქართულად" (24/7 in Georgian). Add security badges (SSL, data protection).
- **Rationale:** Social proof through numbers is highly effective in markets with low AI trust.

### QW-7. Mobile-Optimize the Marketing Page CTA Buttons

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** While responsive, the marketing page doesn't have sticky mobile CTAs.
- **Action:** Add a sticky bottom CTA bar on mobile: "უფასოდ დაიწყე" (Start free) that stays visible while scrolling.
- **Rationale:** 76.6% of Georgians are on social media, primarily via mobile. The marketing page must convert mobile visitors.

---

## Category 2: Feature Gaps (Missing capabilities that competitors have or users expect)

### FG-1. Complete Facebook Connection in Onboarding

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** Onboarding Step 2 (Facebook connection) shows a "coming soon" placeholder. Users must skip it and later find Settings → Connections to set up Facebook manually.
- **Action:** Wire Step 2 to the existing manual key entry flow (Page ID + Access Token) that already works in Settings. Include a step-by-step guide with screenshots showing where to find Page ID and Access Token in Facebook.
- **Rationale:** The onboarding is the first impression. A "coming soon" placeholder on the core feature (Facebook connection) signals an unfinished product and drives abandonment.

### FG-2. Industry-Specific Templates

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** No pre-built templates. Business owners must configure the bot from scratch.
- **Action:** Create 5 starter templates for top Georgian social commerce categories:
  1. **ტანსაცმელი (Apparel)** — size questions, color variants, return policy
  2. **სილამაზე (Beauty)** — appointment booking, product recommendations
  3. **საკვები (Food/Delivery)** — menu browsing, delivery time estimates, order tracking
  4. **სახლი და ბაღი (Home & Garden)** — dimensions, availability, delivery scheduling
  5. **ელექტრონიკა (Electronics)** — specs comparison, warranty info
     Each template includes: pre-filled products, FAQ items, bot instructions, behavior rules, and greeting message.
- **Rationale:** Research shows top categories are Apparel (28%), Home & Garden (11.6%), Beauty (9.3%). Templates reduce time-to-value from hours to minutes.

### FG-3. Complete Instagram Integration

- **Impact:** HIGH | **Effort:** LARGE
- **Problem:** Instagram webhook exists but the connection UI is a placeholder with no handler.
- **Action:** Implement Instagram connection similar to Facebook — manual Business Account ID + token entry, or OAuth flow. Wire the existing webhook to process Instagram DMs through the same AI pipeline.
- **Rationale:** Instagram is used by 53.8% of Tbilisi social commerce stores. Missing Instagram means losing half the addressable market.

### FG-4. Connect CMS to Public Marketing Pages

- **Impact:** MEDIUM | **Effort:** MEDIUM
- **Problem:** Full CMS exists in admin (block editor, page storage in DB) but the public marketing page uses hardcoded React components, not CMS content.
- **Action:** Create a renderer that fetches CMS page blocks and renders them on the public-facing pages. This allows non-developer admins to update marketing copy, testimonials, and pricing without code changes.
- **Rationale:** Being able to quickly update marketing copy, add case studies, and adjust messaging is critical for a market education strategy.

### FG-5. Google Sheets Sync UI

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** `sheets-sync` edge function exists and `google_sheet_id` is in tenant schema, but no UI to configure it.
- **Action:** Add a "Google Sheets" section in Settings → Connections where users can paste their Sheet ID and trigger manual sync. Show last sync timestamp.
- **Rationale:** Many Georgian SMBs track inventory and orders in Google Sheets. This integration bridges their existing workflow with Sxarti without requiring them to abandon familiar tools.

### FG-6. WhatsApp Channel Support

- **Impact:** MEDIUM | **Effort:** LARGE
- **Problem:** WhatsApp is only used for owner notifications, not as a customer-facing channel.
- **Action:** Add WhatsApp Business API as a customer-facing channel alongside Facebook and Instagram. Many Georgian consumers use WhatsApp for business communication.
- **Rationale:** Diversifying beyond Facebook/Instagram reduces platform dependency risk and captures the segment of customers who prefer WhatsApp.

### FG-7. Payment Integration (BOG/TBC Checkout)

- **Impact:** HIGH | **Effort:** LARGE
- **Problem:** Currently the bot collects order info but payment is arranged separately (bank transfer to IBAN). No in-chat payment.
- **Action:** Integrate BOG iPay or TBC e-commerce payment gateway so customers can pay directly through a link sent by the bot during conversation.
- **Rationale:** Research shows 90.71% of card transactions are digital payments. Removing the friction of manual bank transfer could dramatically increase order completion rates. This is a feature NO international competitor can offer.

### FG-8. Fix Test Message Placeholder

- **Impact:** LOW | **Effort:** SMALL
- **Problem:** Onboarding completion screen "Send test message" button shows "coming soon" toast.
- **Action:** Wire it to send a real test message through the configured Facebook page, or simulate a bot conversation in-app so users can see the bot working before going live.
- **Rationale:** Seeing the bot work immediately after setup creates an "aha moment" that drives activation.

---

## Category 3: Growth Levers (Viral loops, referral mechanics, acquisition)

### GL-1. Free Tier / Extended Free Trial

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** 14-day trial may not be enough for businesses that have never used AI. No free tier exists.
- **Action:** Option A: Extend trial to 30 days. Option B: Add a free tier with 20 conversations/month (enough to see value, not enough to avoid upgrading). Option C: "First month free" promotion.
- **Rationale:** Research shows 98% of Georgian SMEs never used AI. Trust barrier is enormous. Longer free exposure converts skeptics into believers. ManyChat and Tidio both offer free tiers.

### GL-2. Referral Program

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** No viral mechanics exist in the product.
- **Action:** "მოიწვიე მეგობარი" (Invite a friend) program: both referrer and referred get 1 month free or 50% off. Track via referral codes. Show referral link in dashboard sidebar.
- **Rationale:** Georgian business community is tight-knit. Word-of-mouth is the #1 trust channel. A referral program turns satisfied customers into sales reps.

### GL-3. "Powered by Sxarti" Badge in Bot Conversations

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** No organic discovery mechanism. Customers chatting with Sxarti-powered bots don't know Sxarti exists.
- **Action:** Add a subtle "⚡ სხარტი" link at the end of the first bot message or in the bot's profile. Links to sxarti.ge with UTM tracking. Premium plan users can remove it.
- **Rationale:** This is how ManyChat, Tidio, and Chatfuel grew — every bot conversation is a free advertisement. The free/starter tier becomes a distribution channel.

### GL-4. Partner Program with Digital Agencies

- **Impact:** MEDIUM | **Effort:** MEDIUM
- **Problem:** No channel partnerships exist.
- **Action:** Create a partner/reseller program for Georgian digital marketing agencies (Multiplayer, WATSON, Punch Creative, PPC Magic, etc.). They set up Sxarti for their clients, earn recurring commission (15-20% of subscription).
- **Rationale:** These agencies already serve Georgian SMBs but offer no chatbot SaaS. Sxarti fills a gap in their service portfolio. They have existing client relationships and trust.

### GL-5. Content Marketing: Georgian-Language Blog & Social Proof

- **Impact:** MEDIUM | **Effort:** MEDIUM
- **Problem:** No content marketing presence. No SEO strategy for Georgian-language search.
- **Action:** Launch a blog section with Georgian-language content: "როგორ გავზარდოთ გაყიდვები Facebook-ზე" (How to increase sales on Facebook), case studies, AI education content. Post on Facebook/Instagram to reach the 2.85M social media users.
- **Rationale:** Market education is the #1 priority per research. Content marketing positions Sxarti as the expert in social commerce automation while building SEO authority for Georgian-language queries.

### GL-6. GITA Grant Integration

- **Impact:** LOW | **Effort:** SMALL
- **Problem:** Georgian government offers grants (up to ₾30,000) for SME digitalization, but businesses don't connect this with Sxarti.
- **Action:** Add a section on the marketing page: "სხარტი GITA-ს გრანტით" (Sxarti with GITA grant) — explain how businesses can use government grants to fund their subscription. Provide a template application letter.
- **Rationale:** Removes cost barrier entirely. Positions Sxarti as government-aligned digital transformation tool.

---

## Category 4: Retention Boosters (Reduce churn, increase stickiness)

### RB-1. Weekly Performance Report (Email/Telegram)

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** Business owners only see analytics when they log into the dashboard. Passive users may forget about the product.
- **Action:** Automated weekly summary sent via Telegram or email: conversations handled, orders generated, revenue attributed, time saved. Include comparison to previous week. End with "💡 Tip: try enabling [feature] to increase conversions."
- **Rationale:** Keeps the product top-of-mind, demonstrates ongoing value, and nudges feature adoption. Critical for a market where AI skepticism is high — constant proof of value prevents churn.

### RB-2. Onboarding Completion Score & Guided Setup

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** After the 5-step onboarding, there's no guidance on optimizing the bot. Users may set up bare minimum and not see full value.
- **Action:** Dashboard widget showing "Setup Score: 65%" with checkmarks: ✅ Products added, ✅ Delivery zones set, ❌ FAQs not configured, ❌ No knowledge documents uploaded, ❌ Bot instructions not customized. Each item links to the relevant settings page.
- **Rationale:** Increases feature adoption, which increases perceived value, which reduces churn. Users who configure more features see better bot performance.

### RB-3. Bot Performance Insights & Suggestions

- **Impact:** MEDIUM | **Effort:** MEDIUM
- **Problem:** Analytics show data but don't tell business owners what to do about it.
- **Action:** AI-generated weekly insights in the dashboard: "შენი ბოტი ამ კვირაში 23 საუბარს ვერ გაუმკლავდა. ყველაზე ხშირი მიზეზი: პროდუქტის ზომების შეკითხვები. რეკომენდაცია: დაამატე ზომების ცხრილი შენს პროდუქტებს." (Your bot couldn't handle 23 conversations this week. Most common reason: product size questions. Recommendation: add a size chart to your products.)
- **Rationale:** Turns raw data into actionable advice. Business owners with low digital literacy need the system to tell them what to improve.

### RB-4. Conversation Handoff Quality Improvement

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** When the bot hands off to a human, the transition can be jarring for customers.
- **Action:** Improve handoff messages with context: "I'm connecting you with [Business Name]. They'll see our full conversation." Notify the owner with a summary of what the customer needs, not just "new handoff."
- **Rationale:** Smooth handoffs maintain customer satisfaction and prevent business owners from thinking the bot is failing (which drives churn).

### RB-5. Seasonal Campaign Templates

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** No proactive engagement — the bot only responds to incoming messages.
- **Action:** Pre-built seasonal campaigns: New Year, 8 March, Easter, Black Friday, Tbilisoba. Templates include: promotional greeting message, discount announcement, product highlight. Owner activates with one click.
- **Rationale:** Gives business owners a reason to engage with the dashboard regularly and reminds them the product is working for them.

---

## Category 5: Georgian Market-Specific (Localization, cultural fit)

### GE-1. Full Georgian Language Onboarding Video Tutorials

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** No video tutorials exist. Written documentation alone is insufficient for low-literacy audience.
- **Action:** Create 5 short (2-3 min) Georgian-language video tutorials:
  1. რეგისტრაცია და პროფილის შექმნა (Registration & profile setup)
  2. Facebook გვერდის დაკავშირება (Connecting your Facebook page)
  3. პროდუქტების დამატება (Adding products)
  4. ბოტის მორგება (Customizing the bot)
  5. შეკვეთების მართვა (Managing orders)
     Host on YouTube (free), embed in onboarding flow and help section.
- **Rationale:** Research confirms video tutorials in Georgian are the #1 recommended approach for digital literacy gaps.

### GE-2. Georgian Holiday & Cultural Context for Bot

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** The bot has no awareness of Georgian holidays, cultural norms, or seasonal buying patterns.
- **Action:** Add a Georgian cultural context module to the bot's system prompt: major holidays (ახალი წელი, აღდგომა, თბილისობა, 26 მაისი), greeting conventions, polite forms (თქვენ vs შენ), common Georgian shopping phrases.
- **Rationale:** Cultural fluency builds trust. A bot that says "გილოცავთ ახალ წელს!" (Happy New Year!) at the right time feels Georgian, not foreign.

### GE-3. Regional Pricing & Delivery Intelligence

- **Impact:** MEDIUM | **Effort:** MEDIUM
- **Problem:** Delivery zones are manually configured but the bot doesn't understand Georgian geography.
- **Action:** Pre-load Georgian city/region database. Bot can auto-detect delivery zone from customer's location mention ("ვარკეთილიდან ვარ" → Tbilisi suburbs zone). Show estimated delivery time based on zone.
- **Rationale:** Delivery is the #1 operational pain point per research. Automated delivery estimation reduces manual work and improves customer experience.

### GE-4. Georgian Business Registration Integration

- **Impact:** LOW | **Effort:** LARGE
- **Problem:** No verification of business legitimacy.
- **Action:** Optional business verification: link to rs.ge (Revenue Service) business registration. Verified businesses get a badge. Builds trust for customers seeing the bot.
- **Rationale:** Trust is the #1 barrier. A "verified Georgian business" badge adds legitimacy.

### GE-5. Cash on Delivery Support

- **Impact:** MEDIUM | **Effort:** SMALL
- **Problem:** Payment options focus on bank transfer (BOG IBAN, TBC account). Many customers outside Tbilisi prefer cash on delivery.
- **Action:** Add "ნაღდი ანგარიშსწორება" (Cash on delivery) as an explicit payment option the bot can offer. Track COD orders separately in order management.
- **Rationale:** Research confirms cash is still common in rural areas. Supporting COD captures the non-Tbilisi market segment.

### GE-6. Multicurrency & Cross-border Support

- **Impact:** LOW | **Effort:** MEDIUM
- **Problem:** Everything is GEL-only. Some Georgian businesses sell to diaspora customers.
- **Action:** Allow products to display prices in USD/EUR alongside GEL. Bot can quote in customer's preferred currency.
- **Rationale:** ~1.5 million Georgians live abroad. Diaspora purchasing is a significant e-commerce segment.

### GE-7. Georgian Language Quality Monitoring

- **Impact:** HIGH | **Effort:** MEDIUM
- **Problem:** Georgian is a low-resource NLP language. The bot may produce unnatural or incorrect Georgian.
- **Action:** Add a "conversation quality" feedback loop: after each conversation, optionally ask the customer "როგორ შეაფასებთ მომსახურებას?" (How would you rate the service?) 1-5 stars. Flag conversations rated ≤2 for owner review. Track quality metrics over time.
- **Rationale:** Research emphasizes Georgian NLP quality must be flawless — one bad conversation destroys trust. Monitoring catches issues before they become reputation problems.

---

## Priority Matrix

### Do First (High Impact + Small/Medium Effort)

| #   | Item                               | Impact | Effort |
| --- | ---------------------------------- | ------ | ------ |
| 1   | QW-1: Fix pricing inconsistency    | HIGH   | SMALL  |
| 2   | QW-2: ROI calculator               | HIGH   | SMALL  |
| 3   | QW-3: Real testimonials            | HIGH   | SMALL  |
| 4   | GL-3: "Powered by Sxarti" badge    | MEDIUM | SMALL  |
| 5   | QW-5: Improve hero messaging       | MEDIUM | SMALL  |
| 6   | QW-6: Trust badges & stats         | MEDIUM | SMALL  |
| 7   | FG-1: Complete Facebook onboarding | HIGH   | MEDIUM |
| 8   | FG-2: Industry templates           | HIGH   | MEDIUM |
| 9   | GL-1: Free tier / extended trial   | HIGH   | MEDIUM |
| 10  | GL-2: Referral program             | HIGH   | MEDIUM |
| 11  | RB-1: Weekly performance report    | HIGH   | MEDIUM |
| 12  | RB-2: Onboarding completion score  | HIGH   | MEDIUM |

### Do Next (High Impact + Large Effort or Medium Impact + Small Effort)

| #   | Item                              | Impact | Effort |
| --- | --------------------------------- | ------ | ------ |
| 13  | FG-3: Complete Instagram          | HIGH   | LARGE  |
| 14  | FG-7: BOG/TBC payment integration | HIGH   | LARGE  |
| 15  | GE-1: Georgian video tutorials    | HIGH   | MEDIUM |
| 16  | GE-7: Quality monitoring          | HIGH   | MEDIUM |
| 17  | QW-4: How it works video          | HIGH   | MEDIUM |
| 18  | FG-5: Google Sheets UI            | MEDIUM | SMALL  |
| 19  | RB-4: Handoff improvement         | MEDIUM | SMALL  |
| 20  | RB-5: Seasonal campaigns          | MEDIUM | SMALL  |
| 21  | GE-2: Cultural context            | MEDIUM | SMALL  |
| 22  | GE-5: Cash on delivery            | MEDIUM | SMALL  |
| 23  | FG-8: Fix test message            | LOW    | SMALL  |

### Do Later (Medium Impact + Medium/Large Effort or Low Impact)

| #   | Item                                 | Impact | Effort |
| --- | ------------------------------------ | ------ | ------ |
| 24  | FG-4: Connect CMS to public pages    | MEDIUM | MEDIUM |
| 25  | GL-4: Partner program                | MEDIUM | MEDIUM |
| 26  | GL-5: Content marketing/blog         | MEDIUM | MEDIUM |
| 27  | RB-3: Bot performance insights       | MEDIUM | MEDIUM |
| 28  | GE-3: Regional delivery intelligence | MEDIUM | MEDIUM |
| 29  | FG-6: WhatsApp channel               | MEDIUM | LARGE  |
| 30  | GE-6: Multicurrency                  | LOW    | MEDIUM |
| 31  | GE-4: Business registration          | LOW    | LARGE  |
| 32  | GL-6: GITA grant integration         | LOW    | SMALL  |

---

## Implementation Roadmap Suggestion

### Sprint 1 (Week 1-2): "Fix the Foundation"

- QW-1: Fix pricing inconsistency
- QW-3: Real testimonials
- QW-5: Improve hero messaging
- QW-6: Trust badges
- FG-1: Complete Facebook onboarding
- FG-8: Fix test message button
- GL-3: Powered by Sxarti badge

### Sprint 2 (Week 3-4): "Build Trust"

- QW-2: ROI calculator
- QW-4: How it works video
- GE-1: Georgian video tutorials
- GL-1: Free tier / extended trial
- RB-2: Onboarding completion score

### Sprint 3 (Week 5-8): "Grow"

- FG-2: Industry templates (all 5)
- GL-2: Referral program
- RB-1: Weekly performance report
- GE-2: Cultural context for bot
- GE-5: Cash on delivery support
- RB-5: Seasonal campaign templates

### Sprint 4 (Week 9-12): "Complete the Platform"

- FG-3: Instagram integration
- FG-7: BOG/TBC payment integration
- GE-7: Quality monitoring
- FG-4: CMS → public pages
- FG-5: Google Sheets UI

### Ongoing

- GL-4: Partner program development
- GL-5: Content marketing
- RB-3: Bot performance insights
- GE-3: Regional delivery intelligence

---

## Key Metrics to Track

| Metric                                    | Current State | Target (3 months)  | Target (6 months) |
| ----------------------------------------- | ------------- | ------------------ | ----------------- |
| Marketing page → signup conversion        | Unknown       | 5%                 | 8%                |
| Trial → paid conversion                   | Unknown       | 15%                | 25%               |
| Onboarding completion rate                | Unknown       | 70%                | 85%               |
| Monthly churn rate                        | Unknown       | <8%                | <5%               |
| Conversations handled by bot (vs handoff) | Unknown       | 70%                | 85%               |
| Customer satisfaction (bot quality)       | Not tracked   | 4.0/5              | 4.5/5             |
| Referral signups                          | 0             | 10% of new signups | 20%               |

---

## Sources

- [Full market research report](./2026-03-28-georgian-smb-landscape-research.md)
- Codebase audit performed 2026-03-28
- CLAUDE.md project documentation
