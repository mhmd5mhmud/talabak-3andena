import { NextResponse } from "next/server";
import { isLikelyReachableAddress } from "@/lib/geo";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();
  const address = String(body.address || "");
  const geo = body.geo as { lat: number; lng: number; accuracy?: number } | null;
  const heuristic = isLikelyReachableAddress(address, geo);

  if (!heuristic) {
    return NextResponse.json({
      ok: false,
      message: "العنوان غير كافٍ أو إحداثيات GPS غير قابلة للوصول. حدّد الشارع والحي واسمح بالموقع.",
    });
  }

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({
      ok: true,
      engine: "gps-heuristic",
      message: "تم التحقق من قابلية الوصول عبر GPS.",
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Validate if an Arabic street address looks deliverable. JSON {ok:boolean, reason:string}",
      },
      {
        role: "user",
        content: `Address: ${address}. GPS: ${geo?.lat},${geo?.lng} accuracy=${geo?.accuracy}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return NextResponse.json({
    ok: Boolean(parsed.ok),
    engine: "gpt-4o",
    message: parsed.reason || (parsed.ok ? "العنوان صالح للتوصيل." : "تعذر اعتماد العنوان."),
  });
}
