import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "talabak_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secret() {
  // Prefer a dedicated secret; fall back to the admin password so existing
  // setups keep working. Fail closed if neither is configured.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function adminUsername() {
  return process.env.ADMIN_USER || process.env.NEXT_PUBLIC_ADMIN_USER || "owner";
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function createSessionToken() {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, sig] = parts;
  if (role !== "admin") return false;
  if (!safeEqual(sig, sign(`${role}.${exp}`))) return false;
  return Number(exp) > Date.now();
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

/** Use inside route handlers: returns true when the request has a valid admin session. */
export function isAdminRequest(req: Request) {
  const header = req.headers.get("cookie") || "";
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  return verifySessionToken(match ? decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1)) : null);
}
