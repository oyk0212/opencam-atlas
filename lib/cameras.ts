import { unstable_cache } from "next/cache";

import { getProviderRegistry } from "@/lib/providers";
import { Camera, CameraFilterOptions, CameraProviderMeta } from "@/lib/providers/types";

function dedupeCameras(cameras: Camera[]) {
  const map = new Map<string, Camera>();

  for (const camera of cameras) {
    map.set(camera.id, camera);
  }

  return Array.from(map.values()).sort(
    (left, right) =>
      new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime(),
  );
}

const getCachedCameras = unstable_cache(
  async () => {
    const providers = getProviderRegistry();
    const activeProviders = providers.filter(
      (provider) => provider.meta.id === "mock" || provider.meta.enabled,
    );
    const cameraSets = await Promise.all(
      activeProviders.map(async (provider) => {
        try {
          return await provider.getCameras();
        } catch (error) {
          console.error(`Provider ${provider.meta.id} failed`, error);
          return [];
        }
      }),
    );

    const merged = dedupeCameras(cameraSets.flat());
    return merged;
  },
  ["camera-catalog"],
  {
    revalidate: 60,
  },
);

export async function getAllCameras(): Promise<Camera[]> {
  return getCachedCameras();
}

export async function getCameraById(id: string): Promise<Camera | undefined> {
  const cameras = await getAllCameras();
  return cameras.find((camera) => camera.id === id);
}

export async function getProviderMeta(): Promise<CameraProviderMeta[]> {
  return getProviderRegistry().map((provider) => provider.meta);
}

export function getFilterOptions(cameras: Camera[]): CameraFilterOptions {
  return {
    countries: Array.from(new Set(cameras.map((camera) => camera.country))).sort(),
    cities: Array.from(new Set(cameras.map((camera) => camera.city))).sort(),
    categories: Array.from(new Set(cameras.map((camera) => camera.category))).sort(),
    providers: Array.from(new Set(cameras.map((camera) => camera.provider))).sort(),
    tags: Array.from(new Set(cameras.flatMap((camera) => camera.tags))).sort(),
  };
}

export function getTrendingCameras(cameras: Camera[]) {
  const now = Date.now();

  return [...cameras]
    .sort((left, right) => {
      const score = (camera: Camera) => {
        const ageMinutes = Math.max(
          0,
          (now - new Date(camera.lastUpdated).getTime()) / 60000,
        );
        const freshnessScore = Math.max(0, 180 - ageMinutes);
        const statusScore =
          camera.status === "online" ? 120 : camera.status === "stale" ? 45 : 0;
        const streamScore = camera.streamUrl ? 25 : 0;
        const scenicScore = camera.tags.some((tag) =>
          ["bridge", "harbor", "beach", "mountain", "downtown", "night view"].includes(tag),
        )
          ? 18
          : 0;
        const providerScore = camera.provider.toLowerCase().includes("mock") ? -20 : 12;

        return freshnessScore + statusScore + streamScore + scenicScore + providerScore;
      };

      return score(right) - score(left);
    })
    .slice(0, 4);
}

const TAG_STOP_WORDS = new Set([
  "official api",
  "official camera",
  "traffic",
  "road",
  "weathercam",
  "hong kong",
  "finland",
  "singapore",
  "scenic",
  "global webcam",
]);

export function getPopularTags(cameras: Camera[]) {
  const counts = new Map<string, number>();

  cameras.forEach((camera) => {
    new Set(camera.tags).forEach((tag) => {
      const normalized = tag.toLowerCase();
      if (TAG_STOP_WORDS.has(normalized) || normalized.startsWith("camera-")) {
        return;
      }

      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8);
}

export function getCameraStats(cameras: Camera[]) {
  const online = cameras.filter((camera) => camera.status === "online").length;
  const withStreams = cameras.filter((camera) => Boolean(camera.streamUrl)).length;

  return {
    total: cameras.length,
    online,
    countries: new Set(cameras.map((camera) => camera.country)).size,
    providers: new Set(cameras.map((camera) => camera.provider)).size,
    withStreams,
  };
}
