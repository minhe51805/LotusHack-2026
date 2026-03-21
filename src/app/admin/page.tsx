import { getSessions } from "@/lib/data";
import { computeAnalytics } from "@/lib/analytics";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const sessions = await getSessions();
  const data = computeAnalytics(sessions);
  return <AnalyticsDashboard data={data} />;
}
