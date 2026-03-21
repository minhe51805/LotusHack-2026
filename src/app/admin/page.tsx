import { getSessions } from "@/lib/data";
import { computeAnalytics } from "@/lib/analytics";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, UserCheck, Headphones, BarChart2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sessions = await getSessions();
  const data = computeAnalytics(sessions);

  const statCards = [
    {
      title: "Phiên hôm nay",
      value: data.today.sessions,
      sub: `${data.allTime.sessions} tổng`,
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Leads hôm nay",
      value: data.today.leads,
      sub: `${data.allTime.leads} tổng`,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Cần hỗ trợ",
      value: data.today.support,
      sub: `${data.allTime.support} tổng`,
      icon: Headphones,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "TB tin nhắn/phiên",
      value: data.today.avgMessages,
      sub: `${data.allTime.avgMessages} tổng thể`,
      icon: BarChart2,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Page header */}
      <div className="shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          Tổng quan
        </h1>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
          Số liệu thống kê nền tảng tư vấn du học
        </p>
      </div>

      {/* Dashboard content */}
      <div className="flex-1 px-6 py-5 space-y-6 max-w-6xl">
        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.title} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`p-1.5 rounded-lg ${card.bg}`}>
                    <card.icon size={14} className={card.color} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                  {card.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <AnalyticsCharts data={data} />
      </div>
    </div>
  );
}
