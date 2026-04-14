import { Camera, CameraProvider } from "@/lib/providers/types";
import {
  fetchJson,
  inferCameraCategory,
  inferStatusFromAge,
  sanitizeCameraName,
  titleCase,
} from "@/lib/providers/provider-utils";

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

function parseFinlandStationName(rawName: string) {
  const normalized = sanitizeCameraName(rawName);
  const parts = normalized.split(" ").filter(Boolean);
  const routeToken = parts[0] ?? "Road";
  const municipalityToken = parts[1] ?? parts[0] ?? "Finland";
  const placeToken = parts.slice(2).join(" ");

  const route = routeToken.toUpperCase().replace(/^([A-Z]{1,3})(\d+)/i, "$1 $2");
  const city = titleCase(municipalityToken);
  const place = placeToken ? titleCase(placeToken) : city;

  return {
    city,
    route,
    name: `${route} ${place}`.trim(),
    tags: [route.replace(/\s+/g, "").toLowerCase(), city.toLowerCase(), "weathercam", "finland"],
    description: `Official Digitraffic weather camera on ${route} near ${place}.`,
  };
}

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
      const parsedName = parseFinlandStationName(feature.properties.name);
      const lastUpdated = presetData?.measuredTime ?? feature.properties.dataUpdatedTime;
      const previewImageUrl = `https://weathercam.digitraffic.fi/${preferredPreset.id}.jpg`;

      return {
        id: `fi-${feature.id.toLowerCase()}`,
        name: parsedName.name,
        country: "Finland",
        city: parsedName.city,
        category: inferCameraCategory(parsedName.name),
        provider: "Finnish Transport Infrastructure Agency / Digitraffic",
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        previewImageUrl,
        officialSourceUrl: FINLAND_SOURCE_URL,
        lastUpdated,
        refreshSeconds: 300,
        tags: [...parsedName.tags, "road"],
        status:
          feature.properties.collectionStatus === "GATHERING"
            ? inferStatusFromAge(lastUpdated, 10 * 60)
            : "offline",
        licenseNote:
          "Official Digitraffic weathercam feed. Use a Digitraffic-User header and review reuse requirements before production.",
        description: parsedName.description,
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
