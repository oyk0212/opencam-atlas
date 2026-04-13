export function DashboardSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="h-52 animate-pulse rounded-2xl bg-[rgba(250,249,245,0.05)]" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-lg bg-[rgba(250,249,245,0.05)]"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-[380px] animate-pulse rounded-lg bg-[rgba(250,249,245,0.05)]"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
