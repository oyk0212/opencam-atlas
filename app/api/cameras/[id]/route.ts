import { NextResponse } from "next/server";

import { getCameraById } from "@/lib/cameras";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const camera = await getCameraById(id);

  if (!camera) {
    return NextResponse.json(
      { error: "Camera not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(camera, {
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=120",
    },
  });
}
