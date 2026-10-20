import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  adminUsername,
  createSessionToken,
  safeEqual,
  sessionCookieOptions,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "لم يتم إعداد كلمة مرور المالك على الخادم (ADMIN_PASSWORD)." },
      { status: 503 },
    );
  }
  let body: { username?: unknown; password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "طلب غير صالح." }, { status: 400 });
  }
  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";
  const okUser = safeEqual(username, adminUsername());
  const okPass = safeEqual(password, process.env.ADMIN_PASSWORD as string);
  if (!(okUser && okPass)) {
    return NextResponse.json({ ok: false, message: "بيانات المالك غير صحيحة." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);
  return res;
}
