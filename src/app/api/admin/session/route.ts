import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(req: Request) {
  return NextResponse.json({ ok: isAdminRequest(req) });
}
