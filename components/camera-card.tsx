import Link from "next/link";

import { CameraPreview } from "@/components/camera-preview";
import { StatusPill } from "@/components/status-pill";
import { formatRelativeTime } from "@/lib/format";
import { Camera } from "@/lib/providers/types";

export function CameraCard({
  camera,
  favorite,
  onToggleFavorite,
}: {
  camera: Camera;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const isRecent =
    Date.now() - new Date(camera.lastUpdated).getTime() <= 5 * 60 * 1000;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--card)] transition duration-200 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-strong)]">
      <div className="relative">
        <CameraPreview
          alt={`${camera.name} preview`}
          className="aspect-[16/10] w-full object-cover"
          src={camera.previewImageUrl}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <StatusPill status={camera.status} />
          {isRecent ? (
            <span className="rounded-full border border-[rgba(201,100,66,0.3)] bg-[rgba(201,100,66,0.18)] px-2.5 py-1 text-[11px] text-[color:var(--text)]">
              Recently updated
            </span>
          ) : null}
        </div>
        <button
          aria-label={favorite ? "Remove favorite" : "Save favorite"}
          className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[rgba(15,17,17,0.7)] text-lg text-[color:var(--text)] backdrop-blur-sm"
          onClick={() => onToggleFavorite?.(camera.id)}
          type="button"
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="text-xl leading-tight text-[color:var(--text)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {camera.name}
              </h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {camera.city}, {camera.country}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-[color:var(--soft)]">
            <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1">
              {camera.category}
            </span>
            <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1">
              {camera.provider}
            </span>
            {camera.streamUrl ? (
              <span className="rounded-full border border-[rgba(106,197,139,0.28)] px-2.5 py-1 text-[color:var(--success)]">
                has stream
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 text-sm text-[color:var(--muted)]">
          <div className="flex items-center justify-between gap-3">
            <span>Source</span>
            <span className="truncate text-right text-[color:var(--text)]">
              {camera.provider}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Last updated</span>
            <span className="text-[color:var(--text)]">
              {formatRelativeTime(camera.lastUpdated)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {camera.tags.slice(0, 4).map((tag) => (
            <span
              className="rounded-full bg-[rgba(245,244,237,0.05)] px-2.5 py-1 text-[11px] text-[color:var(--muted)]"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <a
            className="text-sm text-[color:var(--muted)] underline decoration-[rgba(245,244,237,0.18)] underline-offset-4 transition hover:text-[color:var(--text)]"
            href={camera.officialSourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Official source
          </a>
          <Link
            className="rounded-lg bg-[color:var(--accent)] px-4 py-2 text-sm text-[color:var(--text)] transition hover:brightness-110"
            href={`/camera/${camera.id}`}
          >
            Open detail
          </Link>
        </div>
      </div>
    </article>
  );
}
