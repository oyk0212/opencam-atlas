import { Camera, CameraStatus } from "@/lib/providers/types";

const DEFAULT_FETCH_TIMEOUT_MS = 15000;

export async function fetchJson<T>(
  url: string,
  init?: RequestInit & { revalidateSeconds?: number },
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
      next: {
        revalidate: init?.revalidateSeconds ?? 300,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchText(
  url: string,
  init?: RequestInit & { revalidateSeconds?: number },
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "text/plain, text/xml, application/xml;q=0.9, */*;q=0.8",
        ...init?.headers,
      },
      next: {
        revalidate: init?.revalidateSeconds ?? 300,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export function inferCameraCategory(text: string): Camera["category"] {
  const value = text.toLowerCase();

  if (/(checkpoint|border|customs)/.test(value)) return "border crossing";
  if (/(harbour|harbor|port|pier|ferry|terminal)/.test(value)) return "harbor";
  if (/(bridge|tunnel)/.test(value)) return "bridge";
  if (/(rail|station|tram|metro|junction)/.test(value)) return "rail";
  if (/(beach|surf|coast|seafront)/.test(value)) return "beach";
  if (/(mountain|pass|fell|alp)/.test(value)) return "mountain";
  if (/(weather|snow|ice|wind)/.test(value)) return "weather";
  if (/(downtown|city hall|central|plaza|broadway)/.test(value)) return "downtown";
  if (/(expressway|motorway|highway|route|ring road)/.test(value)) return "highway";
  return "traffic";
}

export function inferStatusFromAge(lastUpdated: string, staleAfterSeconds: number): CameraStatus {
  const ageSeconds = (Date.now() - new Date(lastUpdated).getTime()) / 1000;

  if (ageSeconds <= staleAfterSeconds) {
    return "online";
  }

  if (ageSeconds <= staleAfterSeconds * 4) {
    return "stale";
  }

  return "offline";
}

export function sanitizeCameraName(value: string) {
  return value.replace(/\s*\[[A-Z0-9]+\]\s*$/i, "").replaceAll("_", " ").trim();
}
