"use client";

import { useEffect, useMemo, useState } from "react";

import { CameraPreview } from "@/components/camera-preview";
import { CameraMap } from "@/components/map/camera-map";
import { StatusPill } from "@/components/status-pill";
import { formatAbsoluteTime, formatCoordinate, formatRelativeTime } from "@/lib/format";
import { Camera } from "@/lib/providers/types";

export function CameraDetailClient({ initialCamera }: { initialCamera: Camera }) {
  const [camera, setCamera] = useState(initialCamera);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      setRefreshing(true);
      try {
        const response = await fetch(`/api/cameras/${camera.id}`, { cache: "no-store" });
        if (response.ok) {
          const next: Camera = await response.json();
          setCamera(next);
        }
      } finally {
        setRefreshing(false);
      }
    }, Math.max(camera.refreshSeconds, 30) * 1000);

    return () => window.clearInterval(interval);
  }, [autoRefresh, camera.id, camera.refreshSeconds]);

  const canEmbed = useMemo(
    () => Boolean(camera.streamUrl?.startsWith("/mock-stream/")),
    [camera.streamUrl],
  );

  return (
    <div className="space-y-6 pb-14 pt-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
          {canEmbed && camera.streamUrl ? (
            <iframe
              className="aspect-[16/9] w-full border-0"
              src={camera.streamUrl}
              title={`${camera.name} live feed`}
            />
          ) : (
            <CameraPreview
              alt={`${camera.name} preview`}
              className="aspect-[16/9] w-full object-cover"
              src={camera.previewImageUrl}
            />
          )}
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={camera.status} />
            <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs text-[color:var(--muted)]">
              {camera.category}
            </span>
            {camera.streamUrl ? (
              <span className="rounded-full border border-[rgba(106,197,139,0.28)] px-3 py-1 text-xs text-[color:var(--success)]">
                stream available
              </span>
            ) : null}
          </div>

          <h1
            className="mt-4 text-4xl leading-tight text-[color:var(--text)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {camera.name}
          </h1>
          <p className="mt-2 text-base text-[color:var(--muted)]">
            {camera.city}, {camera.country}
          </p>
          <p className="mt-6 text-base leading-7 text-[color:var(--muted)]">
            {camera.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaItem label="Provider" value={camera.provider} />
            <MetaItem label="Last updated" value={formatAbsoluteTime(camera.lastUpdated)} />
            <MetaItem label="Relative freshness" value={formatRelativeTime(camera.lastUpdated)} />
            <MetaItem label="Refresh interval" value={`${camera.refreshSeconds} seconds`} />
            <MetaItem
              label="Coordinates"
              value={`${formatCoordinate(camera.latitude)}, ${formatCoordinate(camera.longitude)}`}
            />
            <MetaItem label="License note" value={camera.licenseNote} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {camera.tags.map((tag) => (
              <span
                className="rounded-full bg-[rgba(250,249,245,0.05)] px-3 py-1 text-xs text-[color:var(--muted)]"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm text-[color:var(--text)] transition hover:brightness-110"
              href={camera.officialSourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              Open official source
            </a>
            <button
              className={`rounded-lg border px-4 py-2 text-sm ${
                autoRefresh
                  ? "border-[rgba(201,100,66,0.28)] bg-[rgba(201,100,66,0.18)] text-[color:var(--text)]"
                  : "border-[color:var(--border)] bg-[rgba(15,17,17,0.6)] text-[color:var(--muted)]"
              }`}
              onClick={() => setAutoRefresh((current) => !current)}
              type="button"
            >
              {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}
            </button>
            {refreshing ? (
              <span className="self-center text-sm text-[color:var(--muted)]">
                Refreshing...
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
          <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
            Source provenance
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-[color:var(--muted)]">
            <p>
              Provider: <span className="text-[color:var(--text)]">{camera.provider}</span>
            </p>
            <p>
              Official source URL:{" "}
              <a
                className="text-[color:var(--text)] underline underline-offset-4"
                href={camera.officialSourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                {camera.officialSourceUrl}
              </a>
            </p>
            <p>{camera.licenseNote}</p>
            <p className="rounded-lg border border-[color:var(--border)] bg-[rgba(201,100,66,0.08)] p-4 text-[color:var(--text)]">
              Availability depends on the official provider.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)]">
          <CameraMap
            cameras={[camera]}
            center={[camera.latitude, camera.longitude]}
            height={380}
            zoom={11}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6">
        <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
          Future AI highlights
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PlaceholderCard
            body="Summaries like traffic build-up, weather shifts, or unusual downtime events."
            title="Scene summaries"
          />
          <PlaceholderCard
            body="Detect sudden changes in image cadence or stale provider timestamps."
            title="Reliability alerts"
          />
          <PlaceholderCard
            body="Cluster cameras by tags, corridor relevance, or cross-provider incident context."
            title="Cross-camera signals"
          />
        </div>
      </section>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)] p-4">
      <p className="text-xs uppercase tracking-[0.08em] text-[color:var(--soft)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text)]">{value}</p>
    </div>
  );
}

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--border)] bg-[rgba(250,249,245,0.04)] p-5">
      <h2
        className="text-2xl text-[color:var(--text)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{body}</p>
    </div>
  );
}
