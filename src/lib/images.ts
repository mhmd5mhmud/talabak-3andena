/** Single place that decides how food images are loaded. */
export const FALLBACK_IMAGE = "/food-fallback.svg";

// Keep in sync with images.remotePatterns in next.config.ts.
export const OPTIMIZED_HOSTS = ["images.unsplash.com", "www.themealdb.com"];

export function isOptimizable(src: string) {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && OPTIMIZED_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
