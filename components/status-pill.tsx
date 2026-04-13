import { CameraStatus } from "@/lib/providers/types";

const styles: Record<CameraStatus, string> = {
  online:
    "border-[rgba(106,197,139,0.28)] bg-[rgba(106,197,139,0.14)] text-[color:var(--success)]",
  stale:
    "border-[rgba(216,177,100,0.28)] bg-[rgba(216,177,100,0.14)] text-[color:var(--warning)]",
  offline:
    "border-[rgba(217,106,106,0.28)] bg-[rgba(217,106,106,0.14)] text-[color:var(--danger)]",
};

export function StatusPill({ status }: { status: CameraStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
