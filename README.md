# Study Abroad AI Counselor — White-Label Platform

A fully white-label, AI-powered study-abroad consultation platform. Deploy it under any brand name. It acts as an always-on digital counselor that students and parents can use at any time to explore options, get school matches, and leave contact details — without feeling pressured by a human salesperson. Counselors get a real-time admin dashboard with full session data and instant support-request alerts.

---

## What Has Been Built

### 1. Student Chat Interface (`/chat`)

The core product. A student opens the chat, fills in a short profile form, and is immediately handed off to an AI that converses naturally in Vietnamese.

**Pre-Chat Form** — collects:
- Personal info: name, phone, email, age
- Academic info: current school, grade/year, GPA
- Financial info: annual budget (USD)
- Goals: target countries, field of study, desired exams (IELTS/TOEFL/SAT/ACT/AP/IB/GED/SSAT/ISEE/AMP), target score, timeline

**AI Chat** — powered by Google Gemini Flash (via OpenRouter + Vercel AI SDK):
- Asks follow-up questions through clickable multiple-choice options (`ask_user` tool) — no open-ended typing required, keeps the flow fast and guided
- Matches the student to up to 8 schools using a weighted scoring algorithm (`match_schools` tool)
- Looks up detailed visa, scholarship, and cost-of-living info for any school (`search_schools` tool)
- Automatically extracts and saves the student's profile to the database whenever name + phone are confirmed (`save_lead` tool)
- Streams responses token-by-token for a snappy feel

**Support Request** — a persistent "⚡ Tôi cần tư vấn chuyên sâu hơn" (I need deeper consultation) button appears after the first message. Clicking it opens a small modal (name + phone), then:
- Marks the session as `needs_support = true` in the database
- Immediately triggers a real-time notification in the admin dashboard

**Session Persistence** — after every AI response, the full message history and extracted lead data are synced to Supabase so nothing is lost if the page is refreshed.

---

### 2. School Matching Algorithm

Located in `src/app/api/chat/route.ts` inside the `match_schools` tool.

For each of the 132 schools in the database, a score (0–110 points) is computed:

| Criterion | Max Points | Logic |
|-----------|-----------|-------|
| Country preference | 30 | Exact match with student's priority countries |
| Annual budget | 25 | Full if tuition ≤ budget; 12 pts if tuition ≤ 125% of budget |
| GPA | 25 | Full if GPA ≥ requirement; 12 pts if GPA ≥ 90% of requirement (normalises 4.0 ↔ 10.0 scales) |
| Certifications (IELTS/TOEFL/SAT) | 20 | All required certs met |
| Field of study | 10 | Program name contains the student's target field |

The top 8 schools by score are returned with: match percentage, tuition range, scholarship availability, GPA/cert requirements, matching reasons, and a direct website link.

Results are rendered as interactive cards in `src/components/chat/SchoolMatchCards.tsx`.

---

### 3. Admin Dashboard (`/admin`)

A real-time operations panel for counselors.

**Session List (sidebar)**
- All sessions ordered by: support requests first → most recently active
- Live indicators: green pulse dot for sessions active in the last 5 minutes
- Tags per session: exam type, message count, lead collected flag, support-needed flag
- Real-time updates via Supabase `postgres_changes` subscriptions — no page refresh needed

**Notifications**
- Browser notifications + in-app toasts for: new session started, lead data collected, support request received
- Toggle on/off per-counselor (persisted in localStorage)

**Session Detail (`/admin/[sessionId]`)**
- Split-pane: full chat transcript on the left, metadata panel on the right
- Red alert banner when `needs_support = true`, showing the student's name and phone so the counselor can call immediately
- Lead data panel shows every collected field (name, school, GPA, budget, goals, etc.) with icons
- Session stats: created time, last activity, total messages

**Content Management**
- `/admin/schools` — CRUD interface for the school database
- `/admin/settings` — edit the AI system prompt (changes are live immediately; the prompt builder injects fresh school data on every request)

---

### 4. Data Layer & Database

**Supabase (PostgreSQL)** with four main tables:

| Table | Purpose |
|-------|---------|
| `sessions` | One row per chat session; stores `messages` (JSONB array), `lead` (JSONB student profile), `needs_support` (bool) |
| `schools` | 132 schools with tuition, visa, scholarship, requirements, programs, images |
| `courses` | Test-prep course offerings (IELTS, TOEFL, SAT, AMP…) |
| `settings` | Single-row config (system prompt editable from admin) |

---

## Architecture & Data Flow

```
┌──────────────────────────────────────────────┐
│                  Student Browser              │
│                                               │
│  1. Fill PreChatForm → submit                 │
│  2. Messages stream in via useChat() hook     │
│  3. Click answer options (ask_user tool)      │
│  4. View school match cards                   │
│  5. Click "⚡ Need deeper help" → modal       │
└───────────────────┬──────────────────────────┘
                    │  HTTP (streaming)
                    ▼
┌──────────────────────────────────────────────┐
│            Next.js API Route                  │
│         /api/chat/route.ts                    │
│                                               │
│  a. Load system prompt from DB                │
│  b. Inject 132 schools into prompt            │
│  c. Call Gemini Flash (OpenRouter)            │
│  d. Stream tool calls + text tokens           │
│                                               │
│  Tools available to the AI:                   │
│   · ask_user      → clickable MCQ in UI       │
│   · match_schools → weighted scoring engine   │
│   · search_schools → keyword DB search        │
│   · save_lead     → persist profile to DB     │
└───────────────────┬──────────────────────────┘
                    │  Supabase JS client
                    ▼
┌──────────────────────────────────────────────┐
│              Supabase (PostgreSQL)            │
│                                               │
│   sessions ──────────────────────────────┐   │
│   schools  (132 rows, queried at runtime) │   │
│   settings (system prompt)               │   │
└──────────────────┬───────────────────────┘   │
                   │ postgres_changes (realtime) │
                   ▼                             │
┌──────────────────────────────────────────────┐
│              Admin Browser                    │
│                                               │
│  Real-time session list updates               │
│  Toast + browser notifications                │
│  Session detail: transcript + lead panel      │
│  Red alert when needs_support = true          │
└──────────────────────────────────────────────┘
```

---

## Key Files

```
src/
  app/
    chat/page.tsx                    # Student chat UI + session sync
    admin/
      layout.tsx                     # Sidebar with real-time session list
      page.tsx                       # Admin home / session overview
      [sessionId]/page.tsx           # Full session detail view
      settings/page.tsx              # System prompt editor
      schools/page.tsx               # School CRUD
    api/
      chat/route.ts                  # Core AI engine (tools + streaming)
      chat/request-support/route.ts  # Support request handler
      admin/sessions/route.ts        # Session CRUD API
      admin/schools/route.ts         # Schools CRUD API

  lib/
    data.ts                          # All Supabase queries (sessions, schools, settings)
    system-prompt.ts                 # Builds prompt string with injected school data
    prompt-defaults.ts               # Default system prompt template (Vietnamese)

  components/
    chat/
      ChatBubble.tsx                 # Renders text, MCQ answers, school cards
      SchoolMatchCards.tsx           # School recommendation card component
      PreChatForm.tsx                # Initial student profile form
      AskUserModal.tsx               # Clickable multiple-choice question UI

supabase/
  schema.sql                         # Full DB schema (run once to init)
  migration_add_school_fields.sql    # Extended school fields migration

data/
  schools_structured.json            # 132 schools (source of truth for seeding)

scripts/
  seed-schools.mjs                   # Imports schools_structured.json → Supabase
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI, Lucide icons |
| AI | Google Gemini Flash via OpenRouter, Vercel AI SDK 6 |
| Database | Supabase (PostgreSQL + Realtime) |
| Markdown | Streamdown (CJK-aware streaming markdown renderer) |
| Charts | Recharts |
| Validation | Zod |

---

## White-Label Configuration

This platform ships with no brand name hard-coded. To deploy under your brand:

1. **System prompt** — go to `/admin/settings` and replace `[Tên trung tâm]` with your center's name, credentials, and tone
2. **School data** — replace `data/schools_structured.json` with your own school list and run `npm run seed:schools`
3. **Logo / colors** — update the avatar initials in `src/app/chat/page.tsx` and the color theme in `tailwind.config`
4. **Embed** — drop the `/chat` URL into any `<iframe>` on your existing website

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
ZALO_BOT_TOKEN=
ZALO_WEBHOOK_SECRET=
ZALO_WEBHOOK_BASE_URL=
```

## Zalo Bot Tunnel Workflow

Use a public HTTPS tunnel for local webhook testing. Keep the tunnel URL in each developer's own `.env.local`; do not commit it.

```env
ZALO_BOT_TOKEN=
ZALO_WEBHOOK_SECRET=
ZALO_WEBHOOK_BASE_URL=https://your-public-tunnel-url.trycloudflare.com
```

Recommended local flow with Cloudflare Tunnel:

```bash
bun run dev
npx cloudflared tunnel --url http://localhost:3000
```

Cloudflare will print a public HTTPS URL similar to:

```txt
https://random-name.trycloudflare.com
```

Put that URL into `.env.local` as `ZALO_WEBHOOK_BASE_URL`, then register your webhook:

```bash
bun run zalo:webhook:set
```

Check the tunnel route in a browser:

```txt
https://random-name.trycloudflare.com/api/zalo/webhook
```

Expected response:

```json
{
  "ok": true,
  "route": "/api/zalo/webhook"
}
```

Useful commands:

```bash
bun run zalo:webhook:info
bun run zalo:bot:me
bun run zalo:webhook:delete
```

Important notes:

- Keep both terminals running: `bun run dev` and `cloudflared tunnel`
- If the tunnel URL changes, update `.env.local` and run `bun run zalo:webhook:set` again
- One Zalo bot has one active webhook URL. If multiple teammates use the same `ZALO_BOT_TOKEN`, whoever runs `bun run zalo:webhook:set` last will overwrite the webhook URL for everyone else
- `localhost` alone will not work for Zalo webhook; it must be reachable through a public HTTPS URL

---

## Getting Started

```bash
bun install

# Initialise the database
# Run supabase/schema.sql then supabase/migration_add_school_fields.sql in the Supabase SQL editor
# If you already have an existing DB, also run supabase/add_zalo_system_prompt.sql

# Seed the school database (run once after DB is initialised)
bun run seed:schools

bun run dev
```

- Student chat: `http://localhost:3000/chat`
- Admin dashboard: `http://localhost:3000/admin`

---

## What Can Be Done Next (Roadmap)

The foundation is solid. These are the highest-value additions that are clearly scoped and buildable on top of what exists:

### High Priority

**Export leads to CSV / Google Sheets**
A one-click export button in the admin dashboard that dumps all leads (name, phone, email, school, budget, GPA, exam, support status) as a downloadable CSV. Could be extended to push rows into a shared Google Sheet via the Sheets API.

**Counselor assignment & notes**
Let counselors claim a session, leave internal notes, and mark it as "contacted / in progress / closed". Prevents two counselors calling the same student.

**Webhook / Zalo / Telegram alert**
When `needs_support` flips to `true`, fire a webhook to a Zalo OA or Telegram bot so counselors get notified on their phone — not just in the browser tab.

### Medium Priority

**Course recommendation**
The course data (`data/etest-course-directory-clean.json`) is already crawled and cleaned but not yet wired into the AI. Add a `recommend_courses` tool so the AI can suggest the right IELTS/SAT prep course based on the student's current score and target score.

**Embeddable widget (iframe / JS snippet)**
Package the chat as a floating bubble widget (like Intercom) that any partner center can paste one `<script>` tag to embed, with their brand token passed as a query param.

**Scholarship calculator**
Given a student's GPA, certs, and target country, compute a realistic scholarship range and display it as a visual estimate inside the chat — not just a text mention.

### Lower Priority / Nice to Have

**Analytics dashboard**
Charts showing: sessions per day, lead conversion rate (sessions → leads → support requests), top requested countries, avg budget. The data is all in Supabase; it just needs a `/admin/analytics` page with Recharts (already installed).


## Business Logic Summary

1. **No cold-call pressure** — students self-serve at their own pace; the AI never pushes a sale
2. **Lead capture is automatic** — the AI extracts name, phone, budget, GPA, and goals from the conversation and saves them without requiring a separate form
3. **Counselors are ready before they say hello** — when a student requests support, the counselor sees the full chat history and lead profile instantly, so the first real conversation goes straight to substance
4. **Conversion funnel**: visit → chat → lead saved → support request → counselor contacts a pre-qualified, context-rich prospect
