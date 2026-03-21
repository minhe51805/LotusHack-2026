import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  BrainCircuit,
  ChartColumnIncreasing,
  Clock3,
  Globe2,
  GraduationCap,
  Handshake,
  MessageCircleMore,
  MicOff,
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
  title: "Study Abroad AI Assistant",
  description:
    "An AI-first landing page for study abroad guidance, readiness checks, and faster mentor handoff.",
};

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What it solves", href: "#what-it-solves" },
  { label: "Mentor handoff", href: "#mentor-handoff" },
  { label: "FAQ", href: "#faq" },
];

const proofStats = [
  {
    value: "24/7",
    label: "AI-first intake",
    detail: "Students can start anytime, not only during office hours.",
  },
  {
    value: "132",
    label: "Schools in the matching layer",
    detail: "Structured data keeps the conversation practical from the start.",
  },
  {
    value: "1-click",
    label: "Support request flow",
    detail: "When a student needs a real person, the handoff is instant.",
  },
  {
    value: "Full",
    label: "Conversation context saved",
    detail: "Mentors receive the profile, chat history, and urgency signal.",
  },
];

const solutionCards = [
  {
    icon: ScanSearch,
    title: "Readiness mapping",
    description:
      "Turn goals, grades, budget, and timing into a usable student profile.",
    footer: "For students who need a clear starting point.",
  },
  {
    icon: Globe2,
    title: "School and pathway matching",
    description:
      "Guide users toward countries, schools, and routes that make sense now.",
    footer: "Less random research, more direction.",
  },
  {
    icon: MicOff,
    title: "Low-pressure communication",
    description:
      "A guided chat feels easier than jumping straight into a live consultation.",
    footer: "Good for shy, busy, or hesitant users.",
  },
  {
    icon: Handshake,
    title: "Human mentor handoff",
    description:
      "When intent is real, mentors step in with the full conversation summary.",
    footer: "AI supports the team, not replaces it.",
  },
];

const workflowSteps = [
  {
    step: "01",
    icon: MessageCircleMore,
    title: "Start with uncertainty",
    description:
      "Students can begin with rough goals, doubts, or missing scores.",
  },
  {
    step: "02",
    icon: BrainCircuit,
    title: "Get guided and evaluated",
    description:
      "The assistant asks follow-up questions and turns the details into direction.",
  },
  {
    step: "03",
    icon: PhoneCall,
    title: "Escalate at the right moment",
    description:
      "When deeper advice is needed, mentors step in with context.",
  },
];

const studentNeeds = [
  {
    icon: Clock3,
    title: "Busy students",
    description:
      "Students who want direction without spending nights comparing schools.",
  },
  {
    icon: GraduationCap,
    title: "Students unsure of their level",
    description:
      "Students unsure whether their GPA, English, budget, or timeline is enough.",
  },
  {
    icon: Users,
    title: "Users who avoid sales pressure",
    description:
      "Students and parents who want clarity first, then a better human call.",
  },
];

const mentorSignals = [
  "Student profile, goals, and constraints captured in chat",
  "Key indicators like GPA, exams, and budget already organized",
  "Full conversation history ready for counselor review",
  "Instant support-needed status for urgent leads",
];

const faqs = [
  {
    question: "Is this replacing human counselors?",
    answer:
      "No. It handles the first layer of discovery so counselors can focus on deeper advice.",
  },
  {
    question: "Who is this best for?",
    answer:
      "Students who feel short on time, unsure of their level, or not ready for a live consultation yet.",
  },
  {
    question: "What happens after a student asks for deeper support?",
    answer:
      "The request is flagged instantly, and mentors can review the context before reaching out.",
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
              <span className="text-sm font-semibold">Study Abroad AI</span>
              <span className="text-xs text-muted-foreground">
                AI-guided intake for counseling teams
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
                  AI-first study abroad guidance
                </Badge>
                <div className="flex flex-col gap-4">
                  <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                    From uncertainty to a clear study abroad plan.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    A simple first step for students who need clarity fast.
                    Answer the right questions, sort the basics, and connect
                    with mentors when deeper support matters.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:w-auto">
                  <Link href="/chat">
                    Start a planning chat
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="sm:w-auto">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">Calm contact</p>
                  <p className="text-sm text-muted-foreground">
                    Less pressure up front.
                  </p>
                </div>
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">Clear qualification</p>
                  <p className="text-sm text-muted-foreground">
                    Turns interest into context.
                  </p>
                </div>
                <div className="flex h-full flex-col gap-1.5 rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-sm font-medium">Fast handoff</p>
                  <p className="text-sm text-muted-foreground">
                    Mentors step in with context.
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
                    <p className="text-sm font-medium">Better lead quality</p>
                    <p className="text-xs text-muted-foreground">
                      Qualify intent before the first call.
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
                        <CardTitle>AI Planning Assistant</CardTitle>
                        <CardDescription>
                          Guided chat for fit, readiness, and next steps
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="hero-preview-badge">Always on</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="hero-bubble-1 mr-10 rounded-3xl bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Tell me your target country, budget, current level, or
                      what feels unclear right now.
                    </p>
                  </div>
                  <div className="hero-bubble-2 ml-10 rounded-3xl bg-primary px-4 py-3 text-primary-foreground">
                    <p className="text-sm">
                      I want to study abroad, but I have not taken IELTS yet and
                      I do not know which schools fit me.
                    </p>
                  </div>
                  <div className="hero-bubble-3 mr-12 rounded-3xl bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      That is enough. I can map your readiness, narrow the
                      options, and connect you to a mentor.
                    </p>
                  </div>

                  <div className="hero-bubble-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">School fit</Badge>
                    <Badge variant="secondary">Budget planning</Badge>
                    <Badge variant="secondary">Exam roadmap</Badge>
                    <Badge variant="secondary">Mentor handoff</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Context is captured before a human reaches out.
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/chat">
                      Try the chat
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
                    <p className="text-sm font-medium">Human follow-up</p>
                    <p className="text-xs text-muted-foreground">
                      Mentors receive the brief instantly.
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
            A better first step for students who want help, not pressure.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Built to turn curiosity into a guided, high-context conversation.
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
            Three simple steps from first message to real advisor support.
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Comfortable for students, useful for the counseling team.
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
                    Calm, structured, and ready for follow-up.
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      <section
        id="mentor-handoff"
        className="mx-auto grid w-full max-w-6xl items-start gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
      >
        <div className="flex flex-col gap-4 self-start">
          <Card className="relative overflow-hidden border bg-muted/40 shadow-sm">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
            <CardHeader className="relative flex flex-col gap-4 p-6 sm:p-8">
              <Badge variant="outline" className="w-fit bg-background/80">
                Built for real people
              </Badge>
              <div className="flex flex-col gap-3">
                <CardTitle className="max-w-xl text-3xl sm:text-4xl">
                  A calmer start for students not ready for a live pitch.
                </CardTitle>
                <CardDescription className="max-w-xl text-base leading-7">
                  Let them think and respond first. The human conversation comes
                  later, with context.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {studentNeeds.map((item) => {
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
                  A warmer first touch and a better chance of ongoing engagement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 self-start">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-col gap-4 p-6 sm:p-8">
              <Badge className="w-fit">Mentor handoff</Badge>
              <div className="flex flex-col gap-3">
                <CardTitle className="max-w-2xl text-3xl sm:text-4xl">
                  Experts see the context before they reach out.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  Once support is requested, the next conversation starts with
                  clarity, not guesswork.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {mentorSignals.map((item, index) => (
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
                  Experience the flow
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
                Ready to launch
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Give first-time visitors a better way to ask for help.
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                Let AI guide the first conversation, reduce hesitation, and
                connect students to mentors while intent is still warm.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/chat">
                  Start a planning chat
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#what-it-solves">Review the benefits</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Study Abroad AI Assistant</p>
          <p>From visitor to qualified conversation, without the friction.</p>
        </footer>
      </section>
    </main>
  );
}
