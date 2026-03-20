import Link from "next/link";
import {
  Activity,
  BellDot,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  Plus,
  Settings2,
  Sparkles,
  Users2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminActivityFeed,
  adminContentQueue,
  adminHealthCards,
  adminLeadQueue,
  adminMetrics,
  adminNavigation,
  getAdminSection,
} from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  slug?: string[];
};

const navIcons = {
  overview: LayoutDashboard,
  content: FileText,
  leads: FolderKanban,
  media: ImageIcon,
  automation: Sparkles,
  team: Users2,
  settings: Settings2,
} as const;

const metricToneClass = {
  positive: "text-emerald-600",
  neutral: "text-slate-500",
  warning: "text-amber-600",
} as const;

const statusToneClass = {
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Review": "bg-amber-50 text-amber-700 ring-amber-200",
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  Scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
} as const;

export function AdminDashboard({ slug }: AdminDashboardProps) {
  const activeSection = getAdminSection(slug);

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 p-6">
        <aside className="hidden w-[290px] shrink-0 flex-col rounded-[28px] bg-[#0f172a] px-5 py-6 text-white shadow-[0_30px_60px_-35px_rgba(15,23,42,0.8)] lg:flex">
          <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Internal System CMS
            </p>
            <h1 className="mt-3 text-2xl font-semibold">ETEST Admin</h1>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Publishing, leads, assets, and internal ops in one workspace.
            </p>
          </div>

          <nav className="mt-6 flex-1 space-y-1">
            {adminNavigation.map((item) => {
              const Icon = navIcons[item.key as keyof typeof navIcons] ?? LayoutDashboard;
              const isActive = item.key === activeSection.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl px-4 py-3 transition",
                    isActive
                      ? "bg-white text-slate-900 shadow-[0_16px_30px_-24px_rgba(255,255,255,0.9)]"
                      : "text-white/72 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <Icon className="mt-0.5 size-4.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p
                      className={cn(
                        "mt-1 text-xs leading-5",
                        isActive ? "text-slate-500" : "text-white/45",
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
              Workspace
            </p>
            <p className="mt-2 text-sm font-medium">LotusHack 2026</p>
            <p className="mt-1 text-sm text-white/55">Content window closes in 2 hours.</p>
          </div>
        </aside>

        <main className="flex-1 rounded-[30px] bg-white p-5 shadow-[0_28px_50px_-36px_rgba(15,23,42,0.35)] sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Dashboard</span>
                <ChevronRight className="size-4" />
                <span>{activeSection.label}</span>
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-slate-950">
                {activeSection.label}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {activeSection.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-[280px]">
                <Input
                  placeholder="Search entries, leads, assets..."
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-4"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-2xl px-4">
                <BellDot className="size-4" />
                Alerts
              </Button>
              <Button className="h-11 rounded-2xl px-4">
                <Plus className="size-4" />
                New item
              </Button>
            </div>
          </div>

          <section className="mt-6 grid gap-4 xl:grid-cols-4">
            {adminMetrics.map((metric) => (
              <Card
                key={metric.label}
                className="rounded-[24px] border border-slate-200 bg-[#fbfcfe] py-0 shadow-none"
              >
                <CardHeader className="px-5 pt-5">
                  <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {metric.label}
                  </CardDescription>
                  <CardTitle className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                    {metric.value}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <p className={cn("text-sm font-medium", metricToneClass[metric.tone])}>
                    {metric.delta}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
            <Card className="rounded-[26px] border border-slate-200 bg-white py-0 shadow-none">
              <CardHeader className="border-b border-slate-200 px-6 py-5">
                <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Editorial queue
                </CardDescription>
                <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                  Content pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                        <th className="px-6 py-4 font-semibold">Entry</th>
                        <th className="px-6 py-4 font-semibold">Owner</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminContentQueue.map((item) => (
                        <tr key={item.title} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-6 py-4 align-top">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-slate-500">{item.type}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{item.owner}</td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
                                statusToneClass[item.status],
                              )}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{item.updatedAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="rounded-[26px] border border-slate-200 bg-white py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-6 py-5">
                  <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Activity
                  </CardDescription>
                  <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                    Recent system events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 py-5">
                  {adminActivityFeed.map((item) => (
                    <div key={`${item.title}-${item.time}`} className="flex gap-3">
                      <div className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Activity className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border border-slate-200 bg-white py-0 shadow-none">
                <CardHeader className="border-b border-slate-200 px-6 py-5">
                  <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quick actions
                  </CardDescription>
                  <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                    Team shortcuts
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 px-6 py-5 sm:grid-cols-2">
                  <Button className="h-11 justify-start rounded-2xl">
                    <Plus className="size-4" />
                    Create landing page
                  </Button>
                  <Button variant="outline" className="h-11 justify-start rounded-2xl">
                    <Sparkles className="size-4" />
                    Trigger automation
                  </Button>
                  <Button variant="outline" className="h-11 justify-start rounded-2xl">
                    <Users2 className="size-4" />
                    Assign new leads
                  </Button>
                  <Button variant="outline" className="h-11 justify-start rounded-2xl">
                    <Settings2 className="size-4" />
                    Open workspace settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-[26px] border border-slate-200 bg-white py-0 shadow-none">
              <CardHeader className="border-b border-slate-200 px-6 py-5">
                <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Lead inbox
                </CardDescription>
                <CardTitle className="mt-1 text-xl font-semibold text-slate-950">
                  Priority follow-ups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 py-5">
                {adminLeadQueue.map((lead) => (
                  <div
                    key={`${lead.name}-${lead.updatedAt}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {lead.source} · {lead.stage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Updated
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{lead.updatedAt}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {adminHealthCards.map((item) => {
                const healthy = item.value === "Healthy";
                return (
                  <Card
                    key={item.label}
                    className="rounded-[26px] border border-slate-200 bg-white py-0 shadow-none"
                  >
                    <CardHeader className="px-6 pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {item.label}
                          </CardDescription>
                          <CardTitle className="mt-2 text-2xl font-semibold text-slate-950">
                            {item.value}
                          </CardTitle>
                        </div>
                        <div
                          className={cn(
                            "inline-flex size-10 items-center justify-center rounded-full",
                            healthy
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600",
                          )}
                        >
                          {healthy ? (
                            <CircleCheckBig className="size-5" />
                          ) : (
                            <CircleAlert className="size-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                      <p className="text-sm leading-6 text-slate-500">{item.detail}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
