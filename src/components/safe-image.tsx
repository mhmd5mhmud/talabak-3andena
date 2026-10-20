"use client";

import Image from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE, isOptimizable } from "@/lib/images";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Use inside a `relative` parent, like next/image `fill`. */
  fill?: boolean;
  sizes?: string;
};

/**
 * Food image that never breaks the page: falls back to a local placeholder when
 * the URL fails to load, and tolerates hosts that next/image has not been
 * configured for (e.g. a URL pasted by an admin) instead of throwing.
 */
export function SafeImage({ src, alt, className, fill, sizes }: Props) {
  const [failed, setFailed] = useState(false);
  const [prev, setPrev] = useState(src);
  if (prev !== src) {
    setPrev(src);
    setFailed(false);
  }
  const url = failed || !src ? FALLBACK_IMAGE : src;

  if (fill && isOptimizable(url)) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes || "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }
  // Unknown host, or non-fill usage: a plain <img> cannot throw on unconfigured hosts.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      className={fill ? `absolute inset-0 h-full w-full ${className || ""}` : className}
      onError={() => setFailed(true)}
    />
  );
}
