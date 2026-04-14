import { DashboardShell } from "@/components/dashboard-shell";
import { SiteHeader } from "@/components/site-header";
import {
  getAllCameras,
  getCameraStats,
  getFilterOptions,
  getPopularTags,
  getProviderMeta,
  getTrendingCameras,
} from "@/lib/cameras";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [cameras, providers, resolvedSearchParams] = await Promise.all([
    getAllCameras(),
    getProviderMeta(),
    searchParams,
  ]);

  const initialFilters = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return (
    <>
      <SiteHeader />
      <main className="container-shell">
        <DashboardShell
          cameras={cameras}
          filterOptions={getFilterOptions(cameras)}
          initialFilters={initialFilters}
          popularTags={getPopularTags(cameras)}
          providers={providers}
          stats={getCameraStats(cameras)}
          trending={getTrendingCameras(cameras)}
        />
      </main>
    </>
  );
}
