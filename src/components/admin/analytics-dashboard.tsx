"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  UserCheck,
  Headphones,
  BarChart2,
  TrendingUp,
  Globe,
  Clock,
  BookOpen,
  Banknote,
} from "lucide-react";
import type { AnalyticsPayload } from "@/lib/analytics";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function formatBudget(usd?: number) {
  if (!usd) return "—";
  return `$${usd.toLocaleString("en-US")}`;
}

function formatDate() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

// ── Chart configs ─────────────────────────────────────────────────────────────

const trendConfig: ChartConfig = {
  sessions: { label: "Phiên", color: "#3b82f6" },
  leads: { label: "Leads", color: "#22c55e" },
};

const examConfig: ChartConfig = {
  count: { label: "Số phiên", color: "#6366f1" },
};

const countryConfig: ChartConfig = {
  count: { label: "Số lượng", color: "#0ea5e9" },
};

const budgetConfig: ChartConfig = {
  count: { label: "Số leads", color: "#f59e0b" },
};

const hourConfig: ChartConfig = {
  count: { label: "Phiên", color: "#8b5cf6" },
};

const dayConfig: ChartConfig = {
  count: { label: "Phiên", color: "#ec4899" },
};

const fieldConfig: ChartConfig = {
  count: { label: "Số leads", color: "#14b8a6" },
};

// ── Stat card data ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  color: string;
  iconBg: string;
}

function StatCard({ title, value, sub, icon: Icon, color, iconBg }: StatCardProps) {
  return (
    <Card size="sm" className="gap-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium">{title}</CardDescription>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon size={14} className={color} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ── Funnel with progress bars ─────────────────────────────────────────────────

const FUNNEL_COLORS = ["bg-blue-500", "bg-green-500", "bg-red-500"];
const FUNNEL_TEXT = ["text-blue-600 dark:text-blue-400", "text-green-600 dark:text-green-400", "text-red-600 dark:text-red-400"];

// ── Main dashboard ────────────────────────────────────────────────────────────

interface Props {
  data: AnalyticsPayload;
}

export function AnalyticsDashboard({ data }: Props) {
  const todayCards: StatCardProps[] = [
    {
      title: "Phiên hôm nay",
      value: data.today.sessions,
      sub: `${data.allTime.sessions} tổng • ${data.allTime.sessions > 0 ? Math.round((data.today.sessions / data.allTime.sessions) * 100) : 0}% so với tổng`,
      icon: MessageSquare,
      color: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
    },
    {
      title: "Leads hôm nay",
      value: data.today.leads,
      sub: `${data.allTime.leads} tổng • tỷ lệ ${data.allTime.sessions > 0 ? Math.round((data.allTime.leads / data.allTime.sessions) * 100) : 0}%`,
      icon: UserCheck,
      color: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-950/50",
    },
    {
      title: "Cần hỗ trợ",
      value: data.today.support,
      sub: `${data.allTime.support} tổng • ${data.allTime.leads > 0 ? Math.round((data.allTime.support / data.allTime.leads) * 100) : 0}% của leads`,
      icon: Headphones,
      color: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-950/50",
    },
    {
      title: "TB tin nhắn / phiên",
      value: data.today.avgMessages,
      sub: `${data.allTime.avgMessages} tổng thể • tổng ${data.allTime.sessions} phiên`,
      icon: BarChart2,
      color: "text-violet-600",
      iconBg: "bg-violet-100 dark:bg-violet-950/50",
    },
  ];

  const allTimeCards: StatCardProps[] = [
    {
      title: "Tổng phiên",
      value: data.allTime.sessions,
      sub: `${data.today.sessions} hôm nay`,
      icon: MessageSquare,
      color: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
    },
    {
      title: "Tổng leads",
      value: data.allTime.leads,
      sub: `${data.allTime.sessions > 0 ? Math.round((data.allTime.leads / data.allTime.sessions) * 100) : 0}% tỷ lệ chuyển đổi`,
      icon: UserCheck,
      color: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-950/50",
    },
    {
      title: "Yêu cầu hỗ trợ",
      value: data.allTime.support,
      sub: `${data.allTime.leads > 0 ? Math.round((data.allTime.support / data.allTime.leads) * 100) : 0}% của tổng leads`,
      icon: Headphones,
      color: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-950/50",
    },
    {
      title: "TB tin nhắn / phiên",
      value: data.allTime.avgMessages,
      sub: `tổng ${data.allTime.sessions} phiên`,
      icon: BarChart2,
      color: "text-violet-600",
      iconBg: "bg-violet-100 dark:bg-violet-950/50",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-muted/30 overflow-y-auto">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Tổng quan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Số liệu nền tảng tư vấn du học ETEST
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {formatDate()}
        </Badge>
      </div>

      <div className="flex-1 px-6 py-5 space-y-6 max-w-7xl">
        {/* ── Stat Cards with Tabs ──────────────────────────────────────── */}
        <Tabs defaultValue="today">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="alltime">Tổng cộng</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {todayCards.map((c) => <StatCard key={c.title} {...c} />)}
            </div>
          </TabsContent>
          <TabsContent value="alltime">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {allTimeCards.map((c) => <StatCard key={c.title} {...c} />)}
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Trend + Funnel ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* 30-day trend */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Xu hướng 30 ngày qua</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Phiên chat và leads theo ngày
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-48">
                <AreaChart
                  data={data.trend30}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => v.slice(5)}
                    tick={{ fontSize: 10 }}
                    interval={6}
                  />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--color-sessions)"
                    fill="url(#gSessions)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-leads)"
                    fill="url(#gLeads)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
              <div className="flex gap-4 mt-3 pt-3 border-t">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  Phiên chat
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                  Leads
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion funnel */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Phễu chuyển đổi</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Tỷ lệ từ phiên chat đến tư vấn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {data.funnel.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${FUNNEL_TEXT[i]}`}>
                        {step.value}
                      </span>
                      <Badge variant="outline" className="text-xs h-4">
                        {step.pct}%
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${FUNNEL_COLORS[i]}`}
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.allTime.sessions > 0 && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground text-center">
                    Tỷ lệ chuyển đổi:{" "}
                    <span className="font-semibold text-foreground">
                      {Math.round((data.allTime.leads / data.allTime.sessions) * 100)}%
                    </span>{" "}
                    phiên → leads
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Three distribution charts ─────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Exam distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Kỳ thi mục tiêu</CardTitle>
              </div>
              <CardDescription className="text-xs">Phân bố theo kỳ thi</CardDescription>
            </CardHeader>
            <CardContent>
              {data.examDist.length === 0 ? (
                <EmptyState />
              ) : (
                <ChartContainer config={examConfig} className="h-44">
                  <BarChart
                    data={data.examDist}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="exam" tick={{ fontSize: 10 }} width={48} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Top countries */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Quốc gia ưu tiên</CardTitle>
              </div>
              <CardDescription className="text-xs">Top 8 quốc gia mong muốn</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topCountries.length === 0 ? (
                <EmptyState />
              ) : (
                <ChartContainer config={countryConfig} className="h-44">
                  <BarChart
                    data={data.topCountries}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Budget distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Banknote size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Ngân sách dự kiến</CardTitle>
              </div>
              <CardDescription className="text-xs">Phân bố ngân sách của leads</CardDescription>
            </CardHeader>
            <CardContent>
              {data.budgetDist.every((b) => b.count === 0) ? (
                <EmptyState />
              ) : (
                <ChartContainer config={budgetConfig} className="h-44">
                  <BarChart
                    data={data.budgetDist}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="range" tick={{ fontSize: 10 }} width={64} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Activity + Field of study ─────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Activity by hour */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Hoạt động theo giờ</CardTitle>
              </div>
              <CardDescription className="text-xs">Số phiên theo từng giờ trong ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={hourConfig} className="h-36">
                <BarChart
                  data={data.activityByHour}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[2, 2, 0, 0]}>
                    {data.activityByHour.map((entry, i) => {
                      const h = i;
                      const isActive = h >= 8 && h <= 22;
                      return (
                        <Cell key={i} fill={isActive ? "#8b5cf6" : "#8b5cf640"} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Field of study */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Ngành học quan tâm</CardTitle>
              </div>
              <CardDescription className="text-xs">Lĩnh vực học tập phổ biến nhất</CardDescription>
            </CardHeader>
            <CardContent>
              {data.fieldDist.length === 0 ? (
                <EmptyState />
              ) : (
                <ChartContainer config={fieldConfig} className="h-36">
                  <BarChart
                    data={data.fieldDist}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="field" tick={{ fontSize: 10 }} width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Recent Leads table ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-muted-foreground" />
                <CardTitle className="text-sm">Leads gần đây</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                {data.recentLeads.length} leads
              </Badge>
            </div>
            <CardDescription className="text-xs">
              10 leads gần nhất có đầy đủ thông tin
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentLeads.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Chưa có lead nào được ghi nhận
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Khách hàng</TableHead>
                    <TableHead>Kỳ thi</TableHead>
                    <TableHead>Quốc gia</TableHead>
                    <TableHead>Ngành</TableHead>
                    <TableHead>Ngân sách</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="pr-4">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="pl-4">
                        <Link
                          href={`/admin/${lead.id}`}
                          className="font-medium hover:underline text-foreground"
                        >
                          {lead.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {lead.exam ? (
                          <Badge variant="secondary" className="text-xs font-normal">
                            {lead.exam}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.countries.slice(0, 2).map((c) => (
                            <Badge key={c} variant="outline" className="text-xs font-normal">
                              {c}
                            </Badge>
                          ))}
                          {lead.countries.length > 2 && (
                            <Badge variant="outline" className="text-xs font-normal">
                              +{lead.countries.length - 2}
                            </Badge>
                          )}
                          {lead.countries.length === 0 && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {lead.field || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">
                          {formatBudget(lead.budget)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(lead.time)}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        {lead.needsSupport ? (
                          <Badge variant="destructive" className="text-xs">
                            ⚡ Hỗ trợ
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
                            Bình thường
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
      Chưa có dữ liệu
    </div>
  );
}
