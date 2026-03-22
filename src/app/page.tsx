import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  BrainCircuit,
  ChartColumnIncreasing,
  Clock3,
  Database,
  GraduationCap,
  Handshake,
  MessageCircleMore,
  NotebookPen,
  PhoneCall,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "EduPath — AI Study Abroad Counselor",
  description:
    "An AI counselor that's transparent by design. Every answer grounded in real school data — no invented facts, no pressure.",
};

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What it solves", href: "#what-it-solves" },
  { label: "For centers", href: "#for-centers" },
  { label: "FAQ", href: "#faq" },
];

const proofStats = [
  {
    value: "24/7",
    label: "Always-on intake",
    detail: "No office hours. Students get real answers at midnight or midday.",
  },
  {
    value: "132",
    label: "Schools in the database",
    detail: "Every answer is grounded in live tuition, visa, and scholarship data.",
  },
  {
    value: "Zero",
    label: "AI-invented facts",
    detail: "The model only answers after fetching real context. No tool call, no answer.",
  },
  {
    value: "Full",
    label: "Lead profile captured in chat",
    detail: "Name, GPA, budget, English level — collected naturally, no extra forms.",
  },
];

const solutionCards = [
  {
    icon: Database,
    title: "Data-grounded answers",
    description:
      "Every school fact — tuition, visa rules, scholarships — is pulled live from the database before the AI responds. No guessing, no fluff.",
    footer: "The kind of specificity that turns skeptics into believers.",
  },
  {
    icon: ScanSearch,
    title: "Automatic lead capture",
    description:
      "EduPath collects name, phone, GPA, budget, and English level naturally over conversation — without feeling like an interrogation.",
    footer: "Qualified leads land in the database mid-conversation.",
  },
  {
    icon: BrainCircuit,
    title: "Interactive chat components",
    description:
      "Rather than dumping walls of text, the AI surfaces selection forms and school cards directly in the chat.",
    footer: "Smooth, intentional, not a chatbot wall of options.",
  },
  {
    icon: Handshake,
    title: "Trust-first design",
    description:
      "The AI earns trust before asking for contact details — counselors step in with the full conversation summary when intent is real.",
    footer: "AI supports the team, not replaces it.",
  },
];

const workflowSteps = [
  {
    step: "01",
    icon: MessageCircleMore,
    title: "Student starts the conversation",
    description:
      "At any hour, in English or Vietnamese. Rough goals, doubts, and missing scores are all a valid starting point.",
  },
  {
    step: "02",
    icon: Database,
    title: "AI fetches real data, then answers",
    description:
      "The model queries live school data before responding. No school question gets answered without a real database lookup.",
  },
  {
    step: "03",
    icon: PhoneCall,
    title: "Lead saved, counselor alerted",
    description:
      "A qualified lead profile lands in Supabase. When a student flags they need deeper support, the team is notified instantly.",
  },
];

const centerBenefits = [
  {
    icon: Clock3,
    title: "Stop burning staff hours on bad leads",
    description:
      "EduPath handles early-stage conversations automatically, so counselors spend time on students who are actually ready.",
  },
  {
    icon: GraduationCap,
    title: "Context before the first call",
    description:
      "When a student requests support, counselors see the full chat history and lead profile — the first real conversation goes straight to substance.",
  },
  {
    icon: Users,
    title: "Students who distrust the industry",
    description:
      "Inflated promises and surprise fees have made families wary. EduPath wins trust with specificity, not sales pressure.",
  },
];

const leadSignals = [
  "Name, phone, GPA, budget, and English level collected automatically",
  "Full conversation history ready when the counselor calls",
  "Zero fabricated facts — every school detail fetched from your database",
  "Real-time alert the moment a student requests deeper support",
];

const faqs = [
  {
    question: "Can the AI make up scholarship amounts?",
    answer:
      "No. The model is only allowed to answer school-related questions after calling the search_schools tool. No tool call, no answer. Hallucination-free by architecture.",
  },
  {
    question: "Does it work in Vietnamese?",
    answer:
      "Yes. The AI reasons in both English and Vietnamese. The default system prompt and conversation flow are tuned for Vietnamese consulting centers.",
  },
  {
    question: "What happens when a student asks for deeper support?",
    answer:
      "The session is flagged instantly and counselors get an in-app notification with the student's name, phone, and full chat context — ready to call.",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <div className="relative isolate flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="size-[44rem] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute left-0 top-40 -z-10 size-72 rounded-full bg-secondary blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-[28rem] -z-10 size-80 rounded-full bg-muted blur-3xl" />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border bg-background shadow-sm">
              <BotMessageSquare className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">EduPath</span>
              <span className="text-xs text-muted-foreground">
                AI counselor for study abroad centers
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button asChild variant="outline" size="lg" className="hidden md:inline-flex">
            <Link href="/chat">Open chat</Link>
          </Button>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <Badge variant="outline" className="w-fit">
                  Built at LotusHack 2026
                </Badge>
                <div className="flex flex-col gap-4">
                  <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                    The AI counselor that earns trust before asking for a name.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    EduPath turns skeptical students into qualified leads — every
                    answer grounded in real school data, no invented facts, no
                    sales pressure.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:w-auto">
                  <Link href="/chat">
                    Try the counselor
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="sm:w-auto">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">No hallucinations</p>
                  <p className="text-sm text-muted-foreground">
                    Real data before every answer.
                  </p>
                </div>
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">Auto lead capture</p>
                  <p className="text-sm text-muted-foreground">
                    Profile built inside the chat.
                  </p>
                </div>
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">Instant handoff</p>
                  <p className="text-sm text-muted-foreground">
                    Counselors step in with full context.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="hero-preview-callout-left absolute -left-2 top-10 hidden rounded-3xl border bg-background/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary">
                    <ChartColumnIncreasing className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">Higher lead quality</p>
                    <p className="text-xs text-muted-foreground">
                      Pre-qualified before the first call.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="hero-preview-shell relative border bg-card/90 shadow-2xl backdrop-blur">
                <CardHeader className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="hero-preview-icon flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Sparkles className="size-5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardTitle>EduPath Counselor</CardTitle>
                        <CardDescription>
                          Real data. No invented facts. No pressure.
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="hero-preview-badge">Always on</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="hero-bubble-1 mr-10 rounded-3xl bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      What&apos;s the tuition at Murdoch Australia and do they
                      offer scholarships for a 7.5 GPA?
                    </p>
                  </div>
                  <div className="hero-bubble-2 ml-10 rounded-3xl bg-primary px-4 py-3 text-primary-foreground">
                    <p className="text-sm">
                      Let me pull the exact figures from our database right now.
                    </p>
                  </div>
                  <div className="hero-bubble-3 mr-12 rounded-3xl bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Murdoch AU: AUD 28,000/yr tuition. With a 7.5 GPA you
                      qualify for the Vice-Chancellor&apos;s Scholarship — up to
                      25% off. No invented numbers, pulled live.
                    </p>
                  </div>

                  <div className="hero-bubble-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">Live school data</Badge>
                    <Badge variant="secondary">132 schools</Badge>
                    <Badge variant="secondary">EN + VI</Badge>
                    <Badge variant="secondary">Zero hallucinations</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Every answer verified against the database.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/chat">
                      Try it now
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <div className="hero-preview-callout-right absolute -bottom-6 right-0 hidden rounded-3xl border bg-background/90 px-4 py-3 shadow-lg backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary">
                    <PhoneCall className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">Counselor notified</p>
                    <p className="text-xs text-muted-foreground">
                      Full context ready before the call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground sm:grid-cols-2 xl:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="flex h-full flex-col gap-2">
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="min-h-10 text-sm font-medium">{stat.label}</p>
              <p className="text-sm text-primary-foreground/70">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="what-it-solves"
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <Badge variant="outline" className="w-fit">
            What it solves
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Fix both sides of the trust problem.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Centers waste hours on bad leads. Students come in skeptical. EduPath fixes both.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {solutionCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="h-full">
                <CardHeader className="flex flex-1 flex-col gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex min-h-28 flex-col gap-2">
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Separator />
                </CardContent>
                <CardFooter className="mt-auto">
                  <p className="text-sm text-muted-foreground">{card.footer}</p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <Badge variant="outline" className="w-fit">
            How it works
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From first message to qualified lead in one conversation.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            No separate forms, no follow-up emails. The profile builds itself.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {workflowSteps.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.step} className="h-full">
                <CardHeader className="flex flex-1 flex-col gap-5">
                  <div className="flex items-center justify-between gap-4">
                    <Badge variant="outline">{item.step}</Badge>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <div className="flex min-h-28 flex-col gap-2">
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <p className="text-sm text-muted-foreground">
                    Structured, verifiable, ready for counselor review.
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="for-centers"
        className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
      >
        <div className="flex flex-col gap-4 self-start">
          <Card className="relative overflow-hidden border bg-muted/40 shadow-sm">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
            <CardHeader className="relative flex flex-col gap-4 p-6 sm:p-8">
              <Badge variant="outline" className="w-fit bg-background/80">
                For consulting centers
              </Badge>
              <div className="flex flex-col gap-3">
                <CardTitle className="max-w-xl text-3xl sm:text-4xl">
                  Stop guessing who&apos;s serious. Start with context.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-7">
                  EduPath handles the expensive guessing game — so your team
                  spends time on students who are already warmed up.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {centerBenefits.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="self-start border shadow-sm">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card className="self-start border shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">
                  A warmer first touch and a better chance of lasting engagement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 self-start">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-col gap-4 p-6 sm:p-8">
              <Badge className="w-fit">What counselors receive</Badge>
              <div className="flex flex-col gap-3">
                <CardTitle className="max-w-2xl text-3xl sm:text-4xl">
                  Every counselor call starts with a full brief.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  When a student requests support, the conversation — and
                  everything extracted from it — is already waiting.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {leadSignals.map((item, index) => (
              <Card key={item} className="border shadow-sm">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-11 justify-center">
                      {String(index + 1).padStart(2, "0")}
                    </Badge>
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary">
                      <NotebookPen className="size-4" />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground sm:self-center">
                    {item}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="self-start rounded-[1.75rem] bg-primary px-5 py-5 text-primary-foreground shadow-sm">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm leading-6 text-primary-foreground/80">
                  Faster response, better first call, smoother handoff.
                </p>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/chat">
                  See it in action
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <Badge variant="outline" className="w-fit">
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Short answers, clear expectations.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {faqs.map((item) => (
            <Card key={item.question} className="h-full">
              <CardHeader className="flex min-h-20 flex-col gap-3">
                <CardTitle>{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <Separator />
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border bg-muted/50 px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex max-w-3xl flex-col gap-4">
              <Badge variant="outline" className="w-fit">
                Try it now
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Give students a counselor they can actually trust.
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                Real data. No pressure. Full context for your team before they
                say hello.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/chat">
                  Start a conversation
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#what-it-solves">See what it solves</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>EduPath — Built at LotusHack 2026</p>
          <p>From skeptical visitor to qualified lead, without the friction.</p>
        </footer>
      </section>
    </main>
  );
}
