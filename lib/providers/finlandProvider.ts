import { Camera, CameraProvider } from "@/lib/providers/types";

export async function fetchFinlandCameras(): Promise<Camera[]> {
  // TODO: Integrate the official Digitraffic APIs and map the response into
  // the normalized Camera interface after validating fields, refresh cadence,
  // and licensing requirements for image reuse.
  return [];
}

export const finlandProvider: CameraProvider = {
  meta: {
    id: "finland",
    name: "Finnish Transport Infrastructure Agency",
    enabled: process.env.FINLAND_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "stubbed",
    note: "Typed adapter stub for future official API integration.",
  },
  async getCameras() {
    return fetchFinlandCameras();
  },
};
