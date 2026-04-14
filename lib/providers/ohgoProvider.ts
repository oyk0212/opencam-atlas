import { Camera, CameraProvider } from "@/lib/providers/types";
import { fetchJson, inferCameraCategory, inferStatusFromAge } from "@/lib/providers/provider-utils";

interface OhgoCameraView {
  Direction?: string;
  MainRoute?: string;
  SmallUrl?: string;
  LargeUrl?: string;
}

interface OhgoCameraItem {
  Id: string;
  Latitude: number;
  Longitude: number;
  Location?: string;
  Description?: string;
  LastUpdateTime?: string;
  CameraViews?: OhgoCameraView[];
}

interface OhgoResponse {
  Results?: OhgoCameraItem[];
}

const OHGO_DOCS_URL = "https://publicapi.ohgo.com/docs/v1/cameras";

export async function fetchOhgoCameras(): Promise<Camera[]> {
  const apiKey = process.env.OHGO_API_KEY;

  if (!apiKey) {
    return [];
  }

  const response = await fetchJson<OhgoResponse>("https://publicapi.ohgo.com/api/v1/cameras", {
    headers: {
      Authorization: `APIKEY ${apiKey}`,
    },
    revalidateSeconds: 300,
  });

  return (response.Results ?? [])
    .map((item) => {
      const primaryView = item.CameraViews?.find((view) => view.LargeUrl || view.SmallUrl);
      const lastUpdated = item.LastUpdateTime ?? new Date().toISOString();
      const label = [item.Location, item.Description].filter(Boolean).join(" ");

      if (!primaryView?.LargeUrl && !primaryView?.SmallUrl) {
        return null;
      }

      return {
        id: `ohgo-${item.Id}`,
        name: item.Location?.trim() || `Ohio traffic camera ${item.Id}`,
        country: "United States",
        city: "Ohio",
        category: inferCameraCategory(label || primaryView.MainRoute || "traffic"),
        provider: "Ohio Department of Transportation / OHGO",
        latitude: item.Latitude,
        longitude: item.Longitude,
        previewImageUrl: primaryView.LargeUrl ?? primaryView.SmallUrl ?? "",
        officialSourceUrl: OHGO_DOCS_URL,
        lastUpdated,
        refreshSeconds: 300,
        tags: [primaryView.MainRoute, primaryView.Direction, "ohgo", "official api"].filter(
          Boolean,
        ) as string[],
        status: inferStatusFromAge(lastUpdated, 10 * 60),
        licenseNote:
          "Official OHGO API. Requires registration and API key; review Ohio DOT terms before public redistribution.",
        description:
          item.Description?.trim() ||
          `Official OHGO traffic camera on ${primaryView.MainRoute ?? "an Ohio route"}.`,
      } satisfies Camera;
    })
    .filter((camera): camera is Camera => camera !== null);
}

export const ohgoProvider: CameraProvider = {
  meta: {
    id: "ohgo",
    name: "Ohio Department of Transportation / OHGO",
    enabled:
      process.env.OHGO_PROVIDER_ENABLED === "true" && Boolean(process.env.OHGO_API_KEY),
    supportsLiveData: true,
    status: process.env.OHGO_API_KEY ? "configured" : "stubbed",
    note: process.env.OHGO_API_KEY
      ? "Implemented official OHGO adapter. Enable it to merge Ohio cameras into the atlas."
      : "Official OHGO adapter is implemented, but it needs an API key before it can run.",
  },
  async getCameras() {
    return fetchOhgoCameras();
  },
};
