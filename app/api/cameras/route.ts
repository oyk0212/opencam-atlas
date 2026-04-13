import { NextResponse } from "next/server";

import { getAllCameras, getFilterOptions } from "@/lib/cameras";

export async function GET() {
  const cameras = await getAllCameras();

  return NextResponse.json(
    {
      data: cameras,
      meta: {
        total: cameras.length,
        filters: getFilterOptions(cameras),
      },
    },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
