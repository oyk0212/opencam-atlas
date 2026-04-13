export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-[color:var(--border-strong)] bg-[color:var(--card)] px-6 py-10 text-center">
      <h3
        className="text-2xl text-[color:var(--text)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
