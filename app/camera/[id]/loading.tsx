import { SiteHeader } from "@/components/site-header";

export default function CameraLoading() {
  return (
    <>
      <SiteHeader />
      <main className="container-shell pb-14 pt-10">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <div className="h-[420px] animate-pulse rounded-2xl bg-[rgba(250,249,245,0.05)]" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-[rgba(250,249,245,0.05)]" />
        </div>
      </main>
    </>
  );
}
