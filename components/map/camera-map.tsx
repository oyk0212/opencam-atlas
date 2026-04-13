import dynamic from "next/dynamic";

import { Camera } from "@/lib/providers/types";

const CameraMapClient = dynamic(
  () => import("@/components/map/camera-map-client").then((mod) => mod.CameraMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] animate-pulse rounded-lg bg-[rgba(250,249,245,0.05)]" />
    ),
  },
);

export function CameraMap(props: {
  cameras: Camera[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  return <CameraMapClient {...props} />;
}
