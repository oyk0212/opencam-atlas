import { Camera, CameraProvider } from "@/lib/providers/types";
import { fetchJson, inferCameraCategory } from "@/lib/providers/provider-utils";

interface WindyWebcam {
  id: string | number;
  title?: string;
  location?: {
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  images?: {
    current?: {
      preview?: string;
    };
  };
  player?: {
    live?: {
      available?: boolean;
      embed?: string;
    };
  };
  urls?: {
    detail?: string;
  };
  categories?: Array<{
    id?: string;
    name?: string;
  }>;
}

interface WindyResponse {
  webcams?: WindyWebcam[];
}

const DEFAULT_WINDY_LIMIT = 24;

export async function fetchWindyWebcams(): Promise<Camera[]> {
  const apiKey = process.env.WINDY_API_KEY;

  if (!apiKey) {
    return [];
  }

  const limit = Number(process.env.WINDY_PROVIDER_LIMIT ?? DEFAULT_WINDY_LIMIT);
  const url = new URL("https://api.windy.com/webcams/api/v3/webcams");
  url.searchParams.set("limit", String(Math.min(limit, 50)));
  url.searchParams.set("sort", "popularity,desc");
  url.searchParams.set("include", "categories,images,location,player,urls");
  url.searchParams.set("lang", "en");

  const response = await fetchJson<WindyResponse>(url.toString(), {
    headers: {
      "X-WINDY-API-KEY": apiKey,
    },
    revalidateSeconds: 300,
  });

  const cameras: Camera[] = [];

  for (const webcam of response.webcams ?? []) {
      if (
        !webcam.location?.latitude ||
        !webcam.location?.longitude ||
        !webcam.images?.current?.preview
      ) {
        continue;
      }

      const categories = webcam.categories?.map((category) => category.name).filter(Boolean) ?? [];
      const label = [webcam.title, ...categories].join(" ");
      const streamUrl = webcam.player?.live?.available ? webcam.player.live.embed : undefined;

      cameras.push({
        id: `windy-${webcam.id}`,
        name: webcam.title?.trim() || `Windy webcam ${webcam.id}`,
        country: webcam.location.country?.trim() || "Unknown",
        city: webcam.location.city?.trim() || webcam.location.country?.trim() || "Unknown",
        category: inferCameraCategory(label),
        provider: "Windy Webcams API",
        latitude: webcam.location.latitude,
        longitude: webcam.location.longitude,
        previewImageUrl: webcam.images.current.preview,
        streamUrl,
        officialSourceUrl: webcam.urls?.detail || "https://api.windy.com/webcams",
        lastUpdated: new Date().toISOString(),
        refreshSeconds: 600,
        tags: [...(categories.filter((value): value is string => Boolean(value)).slice(0, 4)), "scenic", "global webcam"],
        status: "online",
        licenseNote:
          "Official Windy Webcams API. Requires API key and Windy attribution; signed image URLs can expire.",
        description:
          "Global scenic/public webcam returned by Windy's official Webcams API.",
        ...(streamUrl ? { streamUrl } : {}),
      });
  }

  return cameras;
}

export const windyProvider: CameraProvider = {
  meta: {
    id: "windy",
    name: "Windy Webcams API",
    enabled:
      process.env.WINDY_PROVIDER_ENABLED === "true" && Boolean(process.env.WINDY_API_KEY),
    supportsLiveData: true,
    status: process.env.WINDY_API_KEY ? "configured" : "stubbed",
    note: process.env.WINDY_API_KEY
      ? "Implemented global scenic-webcam adapter. Enable it to merge official Windy webcams."
      : "Implemented Windy adapter; add an API key to bring in global scenic/public webcams.",
  },
  async getCameras() {
    return fetchWindyWebcams();
  },
};
