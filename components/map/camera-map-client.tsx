"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";

import { Camera } from "@/lib/providers/types";

const marker = divIcon({
  className: "",
  html: '<span class="camera-marker"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function CameraMapClient({
  cameras,
  center,
  zoom = 3,
  height = 500,
}: {
  cameras: Camera[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  const fallbackCenter: [number, number] =
    center ??
    (cameras.length > 0
      ? [cameras[0].latitude, cameras[0].longitude]
      : [20, 0]);

  return (
    <MapContainer
      center={fallbackCenter}
      className="h-full w-full"
      scrollWheelZoom
      style={{ height }}
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cameras.map((camera) => (
        <Marker
          icon={marker}
          key={camera.id}
          position={[camera.latitude, camera.longitude]}
        >
          <Popup>
            <div className="map-popup min-w-44">
              <p className="font-semibold">{camera.name}</p>
              <p className="text-sm">
                {camera.city}, {camera.country}
              </p>
              <p className="mt-2 text-xs text-slate-600">{camera.provider}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
