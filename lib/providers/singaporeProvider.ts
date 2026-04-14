import { Camera, CameraProvider } from "@/lib/providers/types";
import { fetchJson, inferStatusFromAge } from "@/lib/providers/provider-utils";

interface SingaporeCamera {
  timestamp: string;
  image: string;
  location: {
    latitude: number;
    longitude: number;
  };
  camera_id: string;
}

interface SingaporeResponse {
  items: Array<{
    timestamp: string;
    cameras: SingaporeCamera[];
  }>;
}

const SINGAPORE_SOURCE_URL =
  "https://data.gov.sg/datasets/d_6cdb6b405b25aaaacbaf7689bcc6fae0/view";

export async function fetchSingaporeCameras(): Promise<Camera[]> {
  const response = await fetchJson<SingaporeResponse>(
    "https://api.data.gov.sg/v1/transport/traffic-images",
    {
      revalidateSeconds: 300,
    },
  );
  const latest = response.items[0];

  if (!latest) {
    return [];
  }

  return latest.cameras.map((camera) => {
    const isBorder = camera.location.latitude > 1.42;
    const category = isBorder
      ? "border crossing"
      : camera.location.latitude < 1.31
        ? "downtown"
        : "highway";

    return {
      id: `sg-${camera.camera_id}`,
      name: isBorder
        ? `Singapore border camera ${camera.camera_id}`
        : `Singapore traffic camera ${camera.camera_id}`,
      country: "Singapore",
      city: "Singapore",
      category,
      provider: "Singapore Land Transport Authority",
      latitude: camera.location.latitude,
      longitude: camera.location.longitude,
      previewImageUrl: camera.image,
      officialSourceUrl: SINGAPORE_SOURCE_URL,
      lastUpdated: camera.timestamp,
      refreshSeconds: 300,
      tags: [
        isBorder ? "border crossing" : "expressway",
        camera.location.latitude < 1.31 ? "downtown" : "traffic",
        "singapore",
        `camera-${camera.camera_id}`,
      ],
      status: inferStatusFromAge(camera.timestamp, 10 * 60),
      licenseNote:
        "Official LTA traffic-images dataset from data.gov.sg. Review Open Data Licence and API rate limits before production use.",
      description:
        "Official Singapore traffic image served from the national open-data transport feed.",
    } satisfies Camera;
  });
}

export const singaporeProvider: CameraProvider = {
  meta: {
    id: "singapore",
    name: "Singapore Land Transport Authority",
    enabled: process.env.SINGAPORE_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "active",
    note: "Implemented official data.gov.sg traffic-images adapter.",
  },
  async getCameras() {
    return fetchSingaporeCameras();
  },
};
