import type { GeoPoint } from "@/types";

export function haversineKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function toRad(n: number) {
  return (n * Math.PI) / 180;
}

export function estimateEtaSeconds(distanceKm: number, prepMinutes: number) {
  const avgSpeedKmh = 28;
  const travelMin = (distanceKm / avgSpeedKmh) * 60;
  const buffer = Math.max(4, distanceKm * 0.8);
  return Math.round((prepMinutes + travelMin + buffer) * 60);
}

export function isLikelyReachableAddress(address: string, geo?: GeoPoint | null) {
  const trimmed = address.trim();
  if (trimmed.length < 12) return false;
  if (!/\d/.test(trimmed) && !/(شارع|حي|مدينة|طريق|مبنى|شقة)/.test(trimmed)) {
    return false;
  }
  if (!geo) return false;
  if (Math.abs(geo.lat) > 90 || Math.abs(geo.lng) > 180) return false;
  if (geo.accuracy && geo.accuracy > 2500) return false;
  return true;
}
