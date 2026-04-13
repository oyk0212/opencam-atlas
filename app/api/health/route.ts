import { NextResponse } from "next/server";

import { getAllCameras, getProviderMeta } from "@/lib/cameras";

export async function GET() {
  const [providers, cameras] = await Promise.all([getProviderMeta(), getAllCameras()]);

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: process.env.ENABLE_REAL_PROVIDERS === "true" ? "hybrid" : "mock",
    providers: providers.map((provider) => ({
      id: provider.id,
      status: provider.status,
      enabled: provider.enabled,
    })),
    cameraCount: cameras.length,
  });
}
