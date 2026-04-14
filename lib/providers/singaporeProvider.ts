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

function inferSingaporeZone(latitude: number, longitude: number) {
  if (latitude > 1.43 && longitude < 103.79) {
    return {
      name: "Woodlands Checkpoint",
      city: "Woodlands",
      category: "border crossing" as const,
      tags: ["border crossing", "checkpoint", "woodlands"],
    };
  }

  if (latitude > 1.41 && longitude >= 103.79) {
    return {
      name: "Northern Gateway",
      city: "Woodlands",
      category: "border crossing" as const,
      tags: ["border crossing", "checkpoint", "northbound"],
    };
  }

  if (latitude < 1.29 && longitude < 103.87) {
    return {
      name: "Marina Bay / CBD",
      city: "Downtown Core",
      category: "downtown" as const,
      tags: ["downtown", "marina bay", "cbd"],
    };
  }

  if (latitude < 1.305 && longitude >= 103.87) {
    return {
      name: "East Coast Parkway",
      city: "Marine Parade",
      category: "highway" as const,
      tags: ["expressway", "east coast", "airport corridor"],
    };
  }

  if (longitude > 103.94) {
    return {
      name: "Tampines / Pasir Ris Corridor",
      city: "Tampines",
      category: "highway" as const,
      tags: ["expressway", "east", "commuter corridor"],
    };
  }

  if (longitude < 103.73) {
    return {
      name: "Jurong West Corridor",
      city: "Jurong West",
      category: "highway" as const,
      tags: ["expressway", "west", "industrial corridor"],
    };
  }

  if (latitude > 1.37) {
    return {
      name: "Ang Mo Kio / Yishun Belt",
      city: "Yishun",
      category: "highway" as const,
      tags: ["expressway", "north", "commuter corridor"],
    };
  }

  return {
    name: "Central Expressway",
    city: "Singapore",
    category: "highway" as const,
    tags: ["expressway", "traffic", "urban corridor"],
  };
}

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
    const zone = inferSingaporeZone(camera.location.latitude, camera.location.longitude);

    return {
      id: `sg-${camera.camera_id}`,
      name: `${zone.name} ${camera.camera_id}`,
      country: "Singapore",
      city: zone.city,
      category: zone.category,
      provider: "Singapore Land Transport Authority",
      latitude: camera.location.latitude,
      longitude: camera.location.longitude,
      previewImageUrl: camera.image,
      officialSourceUrl: SINGAPORE_SOURCE_URL,
      lastUpdated: camera.timestamp,
      refreshSeconds: 300,
      tags: [
        ...zone.tags,
        "singapore",
        `camera-${camera.camera_id}`,
      ],
      status: inferStatusFromAge(camera.timestamp, 10 * 60),
      licenseNote:
        "Official LTA traffic-images dataset from data.gov.sg. Review Open Data Licence and API rate limits before production use.",
      description: `Official Singapore traffic image covering ${zone.name}.`,
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
