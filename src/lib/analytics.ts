import type { ChatSession } from "./data";

export interface DailyPoint {
  date: string;
  sessions: number;
  leads: number;
}

export interface ExamCount {
  exam: string;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  pct: number;
}

export interface TodayStats {
  sessions: number;
  leads: number;
  support: number;
  avgMessages: number;
}

export interface AllTimeStats {
  sessions: number;
  leads: number;
  support: number;
  avgMessages: number;
}

export interface AnalyticsPayload {
  today: TodayStats;
  allTime: AllTimeStats;
  trend30: DailyPoint[];
  examDist: ExamCount[];
  topCountries: CountryCount[];
  funnel: FunnelStep[];
}

export function computeAnalytics(sessions: ChatSession[]): AnalyticsPayload {
  const todayStr = new Date().toISOString().slice(0, 10);

  const todaySessions = sessions.filter(
    (s) => s.createdAt.slice(0, 10) === todayStr
  );

  const totalMsgs = sessions.reduce(
    (acc, s) => acc + (s.messages?.length ?? 0),
    0
  );
  const todayMsgs = todaySessions.reduce(
    (acc, s) => acc + (s.messages?.length ?? 0),
    0
  );

  const allTime: AllTimeStats = {
    sessions: sessions.length,
    leads: sessions.filter((s) => s.lead != null).length,
    support: sessions.filter((s) => s.needsSupport).length,
    avgMessages:
      sessions.length > 0 ? Math.round(totalMsgs / sessions.length) : 0,
  };

  const today: TodayStats = {
    sessions: todaySessions.length,
    leads: todaySessions.filter((s) => s.lead != null).length,
    support: todaySessions.filter((s) => s.needsSupport).length,
    avgMessages:
      todaySessions.length > 0
        ? Math.round(todayMsgs / todaySessions.length)
        : 0,
  };

  // 30-day trend
  const trend30Map: Record<string, { sessions: number; leads: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trend30Map[key] = { sessions: 0, leads: 0 };
  }
  for (const s of sessions) {
    const key = s.createdAt.slice(0, 10);
    if (key in trend30Map) {
      trend30Map[key].sessions++;
      if (s.lead != null) trend30Map[key].leads++;
    }
  }
  const trend30: DailyPoint[] = Object.entries(trend30Map).map(
    ([date, v]) => ({ date, ...v })
  );

  // Exam distribution (only sessions that have a lead)
  const examMap: Record<string, number> = {};
  for (const s of sessions) {
    if (s.lead == null) continue;
    const exam = s.lead.target_exam?.trim() || "Khác";
    examMap[exam] = (examMap[exam] ?? 0) + 1;
  }
  const examDist: ExamCount[] = Object.entries(examMap)
    .map(([exam, count]) => ({ exam, count }))
    .sort((a, b) => b.count - a.count);

  // Top countries
  const countryMap: Record<string, number> = {};
  for (const s of sessions) {
    for (const c of s.lead?.priority_countries ?? []) {
      const country = c.trim();
      if (country) countryMap[country] = (countryMap[country] ?? 0) + 1;
    }
  }
  const topCountries: CountryCount[] = Object.entries(countryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Conversion funnel
  const total = sessions.length;
  const withLead = sessions.filter((s) => s.lead != null).length;
  const withSupport = sessions.filter((s) => s.needsSupport).length;
  const funnel: FunnelStep[] = [
    { label: "Tổng phiên", value: total, pct: 100 },
    {
      label: "Có thông tin",
      value: withLead,
      pct: total > 0 ? Math.round((withLead / total) * 100) : 0,
    },
    {
      label: "Cần tư vấn",
      value: withSupport,
      pct: total > 0 ? Math.round((withSupport / total) * 100) : 0,
    },
  ];

  return { today, allTime, trend30, examDist, topCountries, funnel };
}
