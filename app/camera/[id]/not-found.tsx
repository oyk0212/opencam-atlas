import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function CameraNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-shell pb-14 pt-16">
        <div className="rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[color:var(--card)] px-6 py-14 text-center">
          <h1
            className="text-4xl text-[color:var(--text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Camera not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
            This camera ID is not present in the current provider output. In mock mode,
            only the seeded public-camera catalog is available.
          </p>
          <Link
            className="mt-6 inline-flex rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm text-[color:var(--text)]"
            href="/"
          >
            Return to homepage
          </Link>
        </div>
      </main>
    </>
  );
}
