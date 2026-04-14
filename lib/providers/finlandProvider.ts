import { Camera, CameraProvider } from "@/lib/providers/types";
import { fetchJson, inferCameraCategory, inferStatusFromAge, sanitizeCameraName } from "@/lib/providers/provider-utils";

interface FinlandStationFeature {
  id: string;
  geometry: {
    coordinates: [number, number, number?];
  };
  properties: {
    id: string;
    name: string;
    collectionStatus: string;
    dataUpdatedTime: string;
    presets: Array<{
      id: string;
      inCollection: boolean;
    }>;
  };
}

interface FinlandStationCollection {
  features: FinlandStationFeature[];
}

interface FinlandStationData {
  id: string;
  dataUpdatedTime: string;
  presets: Array<{
    id: string;
    measuredTime: string;
  }>;
}

interface FinlandDataResponse {
  stations: FinlandStationData[];
}

const FINLAND_SOURCE_URL = "https://www.digitraffic.fi/en/road-traffic/";

export async function fetchFinlandCameras(): Promise<Camera[]> {
  const [stations, stationData] = await Promise.all([
    fetchJson<FinlandStationCollection>("https://tie.digitraffic.fi/api/weathercam/v1/stations", {
      headers: {
        "Digitraffic-User":
          process.env.DIGITRAFFIC_USER_AGENT ?? "OpenCam Atlas/0.1 (contact: local-dev)",
        "Accept-Encoding": "gzip",
      },
      revalidateSeconds: 300,
    }),
    fetchJson<FinlandDataResponse>(
      "https://tie.digitraffic.fi/api/weathercam/v1/stations/data",
      {
        headers: {
          "Digitraffic-User":
            process.env.DIGITRAFFIC_USER_AGENT ?? "OpenCam Atlas/0.1 (contact: local-dev)",
          "Accept-Encoding": "gzip",
        },
        revalidateSeconds: 300,
      },
    ),
  ]);

  const stationDataMap = new Map(stationData.stations.map((entry) => [entry.id, entry]));

  return stations.features
    .map((feature) => {
      const liveData = stationDataMap.get(feature.id);
      const preferredPreset =
        feature.properties.presets.find((preset) => preset.inCollection && preset.id.endsWith("01")) ??
        feature.properties.presets.find((preset) => preset.inCollection);

      if (!preferredPreset) {
        return null;
      }

      const presetData = liveData?.presets.find((preset) => preset.id === preferredPreset.id);
      const rawName = sanitizeCameraName(feature.properties.name);
      const nameParts = rawName.split(" ").filter(Boolean);
      const city = nameParts[1] ?? nameParts[0] ?? "Finland";
      const lastUpdated = presetData?.measuredTime ?? feature.properties.dataUpdatedTime;
      const previewImageUrl = `https://weathercam.digitraffic.fi/${preferredPreset.id}.jpg`;

      return {
        id: `fi-${feature.id.toLowerCase()}`,
        name: rawName,
        country: "Finland",
        city,
        category: inferCameraCategory(rawName),
        provider: "Finnish Transport Infrastructure Agency / Digitraffic",
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        previewImageUrl,
        officialSourceUrl: FINLAND_SOURCE_URL,
        lastUpdated,
        refreshSeconds: 300,
        tags: ["weathercam", "road", city.toLowerCase(), "finland"],
        status:
          feature.properties.collectionStatus === "GATHERING"
            ? inferStatusFromAge(lastUpdated, 10 * 60)
            : "offline",
        licenseNote:
          "Official Digitraffic weathercam feed. Use a Digitraffic-User header and review reuse requirements before production.",
        description: `Official Digitraffic weather camera at ${rawName}.`,
      } satisfies Camera;
    })
    .filter((camera): camera is Camera => camera !== null);
}

export const finlandProvider: CameraProvider = {
  meta: {
    id: "finland",
    name: "Finnish Transport Infrastructure Agency",
    enabled: process.env.FINLAND_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "active",
    note: "Implemented official Digitraffic weather camera adapter.",
  },
  async getCameras() {
    return fetchFinlandCameras();
  },
};
