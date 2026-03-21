"use client";

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
import type { AnalyticsPayload } from "@/lib/analytics";

const trendConfig: ChartConfig = {
  sessions: { label: "Phiên", color: "#3b82f6" },
  leads: { label: "Leads", color: "#22c55e" },
};

const examConfig: ChartConfig = {
  count: { label: "Số lượng", color: "#6366f1" },
};

const countryConfig: ChartConfig = {
  count: { label: "Quốc gia", color: "#f59e0b" },
};

const funnelConfig: ChartConfig = {
  value: { label: "Số phiên", color: "#3b82f6" },
};

const FUNNEL_COLORS = ["#3b82f6", "#22c55e", "#ef4444"];

interface Props {
  data: AnalyticsPayload;
}

export function AnalyticsCharts({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* 30-day trend */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
          Xu hướng 30 ngày qua
        </h2>
        <ChartContainer config={trendConfig} className="h-52">
          <AreaChart
            data={data.trend30}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/40"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => v.slice(5)}
              tick={{ fontSize: 10 }}
              interval={4}
            />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="var(--color-sessions)"
              fill="url(#gradSessions)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="var(--color-leads)"
              fill="url(#gradLeads)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </section>

      {/* Exam + Countries side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Exam distribution */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
            Phân bố kỳ thi mục tiêu
          </h2>
          {data.examDist.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              Chưa có dữ liệu
            </div>
          ) : (
            <ChartContainer config={examConfig} className="h-52">
              <BarChart
                data={data.examDist}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-border/40"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="exam"
                  tick={{ fontSize: 10 }}
                  width={56}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </section>

        {/* Top countries */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
            Quốc gia ưu tiên hàng đầu
          </h2>
          {data.topCountries.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              Chưa có dữ liệu
            </div>
          ) : (
            <ChartContainer config={countryConfig} className="h-52">
              <BarChart
                data={data.topCountries}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-border/40"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fontSize: 10 }}
                  width={72}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </section>
      </div>

      {/* Conversion funnel */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">
          Phễu chuyển đổi
        </h2>
        <ChartContainer config={funnelConfig} className="h-44">
          <BarChart
            data={data.funnel}
            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/40"
            />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <span>
                      {value} ({(item.payload as { pct: number }).pct}%)
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.funnel.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </section>
    </div>
  );
}
