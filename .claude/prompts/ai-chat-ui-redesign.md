## AI Chat UI Redesign — Premium Typing Experience, Smooth Streaming & Clear Web Search State

### Context

File: src/app/dashboard/ai-chat/page.tsx (single ~1600-line component)
Stack: Next.js, React, TypeScript, Tailwind CSS, Lucide icons
Language: Georgian (ka-GE) — preserve all existing Georgian text strings

### Pain Points to Solve

1. **Typing experience feels bad** — Current input is a plain Textarea inside a bordered container with cramped layout. Needs to feel like a premium chat input (think ChatGPT/Claude level comfort)
2. **Streaming feels laggy** — Currently re-renders entire ReactMarkdown on every SSE chunk. The memoized MarkdownContent is only used for completed messages. Streaming needs a smoother visual experience
3. **Web search toggle is unclear** — Currently just a Globe icon button that changes color slightly (text-primary vs text-on-surface-variant/50). No label, no visual indicator for active state. Users can't tell if it's on or off

### Requirements

#### 1. Input Area Redesign

- Make the input area feel spacious and inviting — larger default height, better padding
- The web search toggle should be visually prominent with a clear ON/OFF state (pill/badge with label, not just an icon color change)
- Show web search status text or badge near the toggle when enabled (e.g., "ვებ ძიება ჩართულია" label visible)
- Consider a floating/elevated input bar design with subtle shadow
- Keep Enter to send, Shift+Enter for newline behavior

#### 2. Streaming Smoothness

- Add CSS animation for text appearing (fade-in per-line or smooth opacity transition)
- Consider rendering streaming text as plain text until complete, then switching to Markdown (avoids re-parsing on every chunk)
- Improve the typing indicator animation (current bouncing dots are basic)
- Add a subtle shimmer or pulse effect on the AI avatar during streaming

#### 3. Web Search Toggle Clarity

- Replace the bare Globe icon button with a clearly labeled toggle pill/chip
- Show distinct visual states: OFF (muted/outlined), ON (filled/highlighted with label)
- When web search is active, show a persistent indicator in the input area or near messages
- Display remaining quota inline when web search is enabled

#### 4. General Polish

- Improve message bubble spacing and visual hierarchy
- Make suggestion chips in empty state more visually appealing
- Ensure responsive design works on mobile (sm breakpoints)
- Maintain all existing functionality — do NOT change API calls, data fetching, session management, or business logic

### Constraints

- UI changes only — NO changes to API routes, hooks, types, or backend logic
- Preserve all Georgian language strings exactly as-is
- Keep the file as a single page component (dont split into new files unless absolutely necessary for readability)
- Use existing UI components from @/components/ui/ (Button, Textarea, Switch, Skeleton)
- Use Tailwind CSS classes only — no new CSS files
- Use the frontend-design skill for implementation
