import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
import { getAnalyticsSnapshot } from "@/lib/admin/analytics-data";
import { subDays } from "date-fns";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const toRaw = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const fromRaw = typeof searchParams.from === "string" ? searchParams.from : undefined;

  const to = toRaw ? new Date(toRaw) : new Date();
  const from = fromRaw ? new Date(fromRaw) : subDays(to, 30);

  const initial = await getAnalyticsSnapshot(from, to);

  return <AnalyticsDashboard initial={initial} fromIso={from.toISOString()} toIso={to.toISOString()} />;
}
