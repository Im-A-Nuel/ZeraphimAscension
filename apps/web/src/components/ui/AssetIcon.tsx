"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";

interface AssetIconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: ReactNode;
}

export const AssetIcon = ({ src, alt, size = 18, className, fallback }: AssetIconProps) => {
  const [failed, setFailed] = useState(false);

  if (failed && fallback) {
    return <>{fallback}</>;
  }

  if (failed) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
};
