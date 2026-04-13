import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[rgba(16,17,17,0.82)] backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between gap-4 px-1 py-4">
        <Link href="/" className="min-w-0">
          <p
            className="truncate text-[28px] leading-none text-[color:var(--text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            OpenCam Atlas
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Live public cameras from official sources
          </p>
        </Link>
        <div className="hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-right text-xs text-[color:var(--muted)] md:block">
          Mock-first adapter architecture
          <div className="text-[color:var(--text)]">Official-provider ready</div>
        </div>
      </div>
    </header>
  );
}
