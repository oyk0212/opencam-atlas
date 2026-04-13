import { DashboardSkeleton } from "@/components/skeletons";
import { SiteHeader } from "@/components/site-header";

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="container-shell">
        <DashboardSkeleton />
      </main>
    </>
  );
}
