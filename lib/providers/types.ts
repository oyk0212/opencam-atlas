export type CameraStatus = "online" | "stale" | "offline";

export type CameraCategory =
  | "traffic"
  | "highway"
  | "bridge"
  | "beach"
  | "downtown"
  | "weather"
  | "rail"
  | "harbor"
  | "mountain"
  | "border crossing";

export interface Camera {
  id: string;
  name: string;
  country: string;
  city: string;
  category: CameraCategory;
  provider: string;
  latitude: number;
  longitude: number;
  previewImageUrl: string;
  streamUrl?: string;
  officialSourceUrl: string;
  lastUpdated: string;
  refreshSeconds: number;
  tags: string[];
  status: CameraStatus;
  licenseNote: string;
  description: string;
}

export interface CameraProviderMeta {
  id: string;
  name: string;
  status: "active" | "configured" | "stubbed";
  enabled: boolean;
  supportsLiveData: boolean;
  note: string;
}

export interface CameraProvider {
  meta: CameraProviderMeta;
  getCameras: () => Promise<Camera[]>;
}

export interface CameraFilterOptions {
  countries: string[];
  cities: string[];
  categories: CameraCategory[];
  providers: string[];
  tags: string[];
}
