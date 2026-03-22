# EduPath — AI Study Abroad Counselor

> Built at **LotusHack 2026** · [lotushacks2026.devpost.com](https://lotushacks2026.devpost.com/)

EduPath is an AI-first study abroad counseling platform built for consulting centers. It acts as a round-the-clock counselor that's transparent by design — every answer is grounded in real data pulled directly from the center's database. No invented scholarship figures, no fluff. For centers, it handles early-stage conversations automatically and delivers qualified leads with full context. For students, it's the kind of specificity that turns skeptics into believers.

---

## The Problem

Consulting centers pour money into marketing, get flooded with vague inquiries, then burn through staff hours figuring out who's actually serious. Meanwhile, students come in skeptical — inflated scholarship promises and surprise fees have made people wary of the whole industry.

EduPath fixes both sides: the AI is the first point of contact that students actually trust, and that centers actually find useful.

---

## What It Does

**For students and parents**
Every answer is grounded in real data fetched directly from the center's database — exact tuition figures, visa requirements, course breakdowns. The AI is only allowed to answer school-related questions after calling `search_schools`. No tool call, no answer. No hallucinations.

**For consulting centers**
EduPath handles early-stage conversations automatically. It chats naturally with prospective students, understands their situation, and collects the key details centers need — name, phone, GPA, budget, English level — without feeling like an interrogation. Qualified leads land directly in the database mid-conversation.

**Interactive UI**
Rather than dumping walls of text, the AI surfaces interactive components like selection forms directly in the chat, making the experience feel smooth and intentional.

---

## What Has Been Built

### 1. Student Chat Interface (`/chat`)

**Pre-Chat Form** — collects:
- Personal info: name, phone, email, age
- Academic info: current school, grade/year, GPA
- Financial info: annual budget (USD)
- Goals: target countries, field of study, desired exams (IELTS/TOEFL/SAT/ACT/AP/IB/GED/SSAT/ISEE/AMP), target score, timeline

**AI Chat** — powered by OpenRouter (context-aware reasoning in English and Vietnamese via Vercel AI SDK):
- `ask_user` — surfaces clickable multiple-choice options in the UI instead of open-ended text
- `match_schools` — weighted scoring algorithm matches student to up to 8 schools
- `search_schools` — keyword search against live school data; the AI cannot answer school questions without calling this first
- `save_lead` — persists the student profile to Supabase mid-conversation the moment name + phone are confirmed
- Streams responses token-by-token

**Support Request** — a persistent button lets students flag they need deeper consultation. This:
- Sets `needs_support = true` in the database
- Triggers a real-time notification in the admin dashboard

**Session Persistence** — full message history and extracted lead data are synced to Supabase after every AI response.

---

### 2. School Matching Algorithm

Located in `src/app/api/chat/route.ts` inside the `match_schools` tool.

For each of the 132 schools in the database, a score (0–110 points) is computed:

| Criterion | Max Points | Logic |
|-----------|-----------|-------|
| Country preference | 30 | Exact match with student's priority countries |
| Annual budget | 25 | Full if tuition ≤ budget; 12 pts if tuition ≤ 125% of budget |
| GPA | 25 | Full if GPA ≥ requirement; 12 pts if GPA ≥ 90% of requirement (normalises 4.0 ↔ 10.0 scales) |
| Certifications | 20 | All required certs met (IELTS/TOEFL/SAT) |
| Field of study | 10 | Program name contains student's target field |

Top 8 schools returned with match percentage, tuition range, scholarship availability, GPA/cert requirements, matching reasons, and a direct website link. Rendered as interactive cards in `src/components/chat/SchoolMatchCards.tsx`.

---

### 3. Admin Dashboard (`/admin`)

**Session List (sidebar)**
- Sessions ordered by: support requests first → most recently active
- Live indicators: green pulse dot for sessions active in the last 5 minutes
- Per-session tags: exam type, message count, lead collected, support-needed
- Real-time updates via Supabase `postgres_changes` — no page refresh needed

**Notifications**
- Browser notifications + in-app toasts for new sessions, leads collected, and support requests
- Toggle on/off per-counselor (persisted in localStorage)

**Session Detail (`/admin/[sessionId]`)**
- Full chat transcript + metadata panel side by side
- Red alert banner when `needs_support = true` — name and phone visible immediately
- Lead data panel shows every collected field with icons
- Session stats: created time, last activity, total messages

**Content Management**
- `/admin/schools` — CRUD interface for the school database
- `/admin/settings` — edit the AI system prompt live (injected with fresh school data on every request)

---

### 4. Data Layer

**Supabase (PostgreSQL)** with four main tables:

| Table | Purpose |
|-------|---------|
| `sessions` | One row per chat; stores `messages` (JSONB), `lead` (JSONB student profile), `needs_support` (bool) |
| `schools` | 132 schools with tuition, visa, scholarship, requirements, programs, images |
| `courses` | Test-prep courses (IELTS, TOEFL, SAT, AMP…) |
| `settings` | Single-row config (editable system prompt) |

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
│  5. Click "Need deeper help" → modal          │
└───────────────────┬──────────────────────────┘
                    │  HTTP (streaming)
                    ▼
┌──────────────────────────────────────────────┐
│            Next.js API Route                  │
│         /api/chat/route.ts                    │
│                                               │
│  a. Load system prompt from DB                │
│  b. Inject 132 schools into prompt            │
│  c. Call model via OpenRouter                 │
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
│   sessions (messages, lead, needs_support)    │
│   schools  (132 rows, queried at runtime)     │
│   settings (system prompt)                   │
└──────────────────┬───────────────────────────┘
                   │ postgres_changes (realtime)
                   ▼
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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons |
| AI | OpenRouter, Vercel AI SDK (real-time streaming + tool-calling) |
| Database | Supabase (PostgreSQL + Realtime) |
| Markdown | Streamdown (CJK-aware streaming renderer) |
| Validation | Zod |

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
    data.ts                          # All Supabase queries
    system-prompt.ts                 # Builds prompt with injected school data
    prompt-defaults.ts               # Default system prompt template

  components/
    chat/
      ChatBubble.tsx                 # Renders text, MCQ answers, school cards
      SchoolMatchCards.tsx           # School recommendation card component
      PreChatForm.tsx                # Initial student profile form
      AskUserModal.tsx               # Clickable multiple-choice question UI

supabase/
  schema.sql                         # Full DB schema
  migration_add_school_fields.sql    # Extended school fields

data/
  schools_structured.json            # 132 schools (source of truth for seeding)

scripts/
  seed-schools.mjs                   # Imports schools_structured.json → Supabase
```

---

## White-Label Configuration

No brand name is hard-coded. To deploy under your center's brand:

1. **System prompt** — go to `/admin/settings`, set your center name, credentials, and tone
2. **School data** — replace `data/schools_structured.json` with your own list and run `npm run seed:schools`
3. **Logo / colors** — update the avatar in `src/app/chat/page.tsx` and the color theme in `tailwind.config`
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

Use a public HTTPS tunnel for local webhook testing. Keep the tunnel URL in your own `.env.local`; do not commit it.

```bash
bun run dev
npx cloudflared tunnel --url http://localhost:3000
```

Put the printed URL into `.env.local` as `ZALO_WEBHOOK_BASE_URL`, then register:

```bash
bun run zalo:webhook:set
```

Useful commands:

```bash
bun run zalo:webhook:info
bun run zalo:bot:me
bun run zalo:webhook:delete
```

One Zalo bot has one active webhook URL — whoever runs `zalo:webhook:set` last overwrites it for the whole team.

---

## Getting Started

```bash
bun install

# Initialise the database
# Run supabase/schema.sql then supabase/migration_add_school_fields.sql in the Supabase SQL editor

# Seed the school database (run once after DB is initialised)
bun run seed:schools

bun run dev
```

- Student chat: `http://localhost:3000/chat`
- Admin dashboard: `http://localhost:3000/admin`

---

## Roadmap

### High Priority

**CRM integrations** — push qualified leads directly into Salesforce or HubSpot so centers can slot EduPath into their existing workflows.

**Export leads to CSV / Google Sheets** — one-click export from the admin dashboard; CSV or Google Sheets API push.

**Counselor assignment & notes** — let counselors claim sessions, leave internal notes, and mark them contacted / in-progress / closed.

### Medium Priority

**Voice support** — voice-to-text so students can talk to EduPath out loud, making consulting feel even more like a real conversation.

**Course recommendation** — `data/etest-course-directory-clean.json` is already cleaned but not wired in. Add a `recommend_courses` tool to suggest IELTS/SAT prep based on current vs. target score.

**Embeddable widget** — package the chat as a floating bubble any partner center can embed with one `<script>` tag.

### Lower Priority

**Analytics dashboard** — sessions per day, lead conversion rate, top requested countries, avg budget. Data is all in Supabase; just needs a `/admin/analytics` page (Recharts already installed).

---

## Business Logic

1. **No cold-call pressure** — students self-serve at their own pace; the AI never pushes a sale
2. **Hallucination-free by design** — the model cannot answer school questions without fetching real context first
3. **Lead capture is automatic** — name, phone, GPA, budget, English level collected naturally over conversation, no separate form
4. **Counselors are ready before they say hello** — full chat history and lead profile visible the moment support is requested
5. **Conversion funnel**: visit → chat → lead saved → support request → counselor contacts a pre-qualified, context-rich prospect
