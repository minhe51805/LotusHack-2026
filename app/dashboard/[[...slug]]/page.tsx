import { AdminDashboard } from "@/components/admin-dashboard";

type DashboardCatchAllPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function DashboardCatchAllPage({
  params,
}: DashboardCatchAllPageProps) {
  const { slug } = await params;

  return <AdminDashboard slug={slug} />;
}
