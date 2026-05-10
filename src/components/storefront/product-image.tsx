"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images";

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function normalizeSrc(src: string | undefined) {
  if (!src) return FALLBACK_PRODUCT_IMAGE;
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) return src;
  return FALLBACK_PRODUCT_IMAGE;
}

/** Disk or remote URL with on-disk fallback when the file is missing or URL fails. */
export function ProductImage({ src, alt, fill, width, height, className, sizes, priority }: Props) {
  const [current, setCurrent] = useState(() => normalizeSrc(src));

  useEffect(() => {
    setCurrent(normalizeSrc(src));
  }, [src]);

  const onError = () => setCurrent(FALLBACK_PRODUCT_IMAGE);

  if (fill) {
    return (
      <Image
        src={current}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={onError}
    />
  );
}
