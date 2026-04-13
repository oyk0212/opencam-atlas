import { Camera, CameraProvider } from "@/lib/providers/types";

export async function fetchSingaporeCameras(): Promise<Camera[]> {
  // TODO: Integrate the official LTA DataMall traffic image endpoint and map
  // provider-specific fields into the shared Camera type. Keep API keys in
  // environment variables and document rate limits before enabling in prod.
  return [];
}

export const singaporeProvider: CameraProvider = {
  meta: {
    id: "singapore",
    name: "Singapore Land Transport Authority",
    enabled: process.env.SINGAPORE_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "stubbed",
    note: "Typed adapter stub for future official API integration.",
  },
  async getCameras() {
    return fetchSingaporeCameras();
  },
};
