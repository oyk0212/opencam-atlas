import Link from "next/link";
import { notFound } from "next/navigation";

import { CameraDetailClient } from "@/components/camera-detail-client";
import { SiteHeader } from "@/components/site-header";
import { getAllCameras, getCameraById } from "@/lib/cameras";

export const revalidate = 60;

export async function generateStaticParams() {
  const cameras = await getAllCameras();
  return cameras.map((camera) => ({ id: camera.id }));
}

export default async function CameraDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const camera = await getCameraById(id);

  if (!camera) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="container-shell">
        <div className="pt-5">
          <Link
            className="text-sm text-[color:var(--muted)] underline underline-offset-4"
            href="/"
          >
            Back to atlas
          </Link>
        </div>
        <CameraDetailClient initialCamera={camera} />
      </main>
    </>
  );
}
