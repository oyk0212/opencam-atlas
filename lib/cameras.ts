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
    const cameraSets = await Promise.all(
      providers
        .filter((provider) => provider.meta.status === "active" || provider.meta.enabled)
        .map((provider) => provider.getCameras()),
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
  return [...cameras]
    .sort((left, right) => {
      const freshness =
        new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime();

      if (freshness !== 0) {
        return freshness;
      }

      return right.tags.length - left.tags.length;
    })
    .slice(0, 4);
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
