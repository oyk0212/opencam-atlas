import { XMLParser } from "fast-xml-parser";

import { Camera, CameraProvider } from "@/lib/providers/types";
import { fetchText, inferCameraCategory, sanitizeCameraName } from "@/lib/providers/provider-utils";

interface HongKongImageNode {
  key: string;
  region: string;
  district: string;
  description: string;
  latitude: number | string;
  longitude: number | string;
  url: string;
}

interface HongKongXml {
  "image-list": {
    image: HongKongImageNode[] | HongKongImageNode;
  };
}

const HONG_KONG_SOURCE_URL =
  "https://data.gov.hk/en-data/dataset/hk-td-tis_2-traffic-snapshot-images";

export async function fetchHongKongCameras(): Promise<Camera[]> {
  const xml = await fetchText(
    "https://static.data.gov.hk/td/traffic-snapshot-images/code/Traffic_Camera_Locations_En.xml",
    { revalidateSeconds: 120 },
  );
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
  const parsed = parser.parse(xml) as HongKongXml;
  const images = Array.isArray(parsed["image-list"].image)
    ? parsed["image-list"].image
    : [parsed["image-list"].image];
  const fetchedAt = new Date().toISOString();

  return images.map((image) => {
    const label = `${image.region} ${image.district} ${image.description}`;

    return {
      id: `hk-${String(image.key).toLowerCase()}`,
      name: sanitizeCameraName(image.description),
      country: "Hong Kong",
      city: image.district,
      category: inferCameraCategory(label),
      provider: "Hong Kong Transport Department",
      latitude: Number(image.latitude),
      longitude: Number(image.longitude),
      previewImageUrl: image.url,
      officialSourceUrl: HONG_KONG_SOURCE_URL,
      lastUpdated: fetchedAt,
      refreshSeconds: 120,
      tags: [image.region, image.district, "official camera", "hong kong"],
      status: "online",
      licenseNote:
        "Official DATA.GOV.HK transport dataset. Review Hong Kong Transport Department reuse terms before redistribution.",
      description: sanitizeCameraName(image.description),
    } satisfies Camera;
  });
}

export const hongKongProvider: CameraProvider = {
  meta: {
    id: "hong-kong",
    name: "Hong Kong Transport Department",
    enabled: process.env.HONG_KONG_PROVIDER_ENABLED === "true",
    supportsLiveData: true,
    status: "active",
    note: "Implemented official DATA.GOV.HK traffic snapshot adapter.",
  },
  async getCameras() {
    return fetchHongKongCameras();
  },
};
