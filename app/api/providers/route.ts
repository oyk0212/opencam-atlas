import { NextResponse } from "next/server";

import { getProviderMeta } from "@/lib/cameras";

export async function GET() {
  const providers = await getProviderMeta();

  return NextResponse.json(
    {
      data: providers,
      meta: {
        total: providers.length,
        mockMode: process.env.ENABLE_REAL_PROVIDERS !== "true",
      },
    },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
