"use client";

import { useState } from "react";

interface CameraPreviewProps {
  alt: string;
  src: string;
  className?: string;
}

export function CameraPreview({ alt, src, className }: CameraPreviewProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setCurrentSrc("/images/camera-fallback.svg")}
      src={currentSrc}
    />
  );
}
