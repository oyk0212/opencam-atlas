import { Camera, CameraProvider } from "@/lib/providers/types";

export async function fetchHongKongCameras(): Promise<Camera[]> {
  // TODO: Integrate the official Hong Kong Transport Department source once
  // the exact public endpoint, rate limits, and attribution requirements are
  // confirmed. Normalize the remote payload into the shared Camera type here.
  return [];
}

export const hongKongProvider: CameraProvider = {
  meta: {
    id: "hong-kong",
    name: "Hong Kong Transport Department",
    enabled: process.env.HONG_KONG_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "stubbed",
    note: "Typed adapter stub for future official API integration.",
  },
  async getCameras() {
    return fetchHongKongCameras();
  },
};
