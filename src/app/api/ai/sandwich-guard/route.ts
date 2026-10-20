import { NextResponse } from "next/server";
import { localSandwichGuard } from "@/lib/ai-local";
import { SANDWICH_LAYERS } from "@/data/sandwich";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const { existingIds, nextId } = (await req.json()) as {
    existingIds: string[];
    nextId: string;
  };
  const local = localSandwichGuard(existingIds, nextId);
  if (!local.allowed) return NextResponse.json(local);

  const openai = getOpenAI();
  if (!openai) return NextResponse.json(local);

  const names = (ids: string[]) =>
    ids
      .map((id) => SANDWICH_LAYERS.find((l) => l.id === id)?.name)
      .filter(Boolean)
      .join("، ");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          'You are a chef guardian. Reject combinations that are unhealthy or taste catastrophic. JSON {"allowed":boolean,"reason":string Arabic}',
      },
      {
        role: "user",
        content: `Current: ${names(existingIds) || "فارغ"}. Adding: ${names([nextId])}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  if (!parsed.allowed) {
    return NextResponse.json({
      allowed: false,
      message: `الشيف الذكي رفض الإضافة: ${parsed.reason}`,
    });
  }
  return NextResponse.json({ allowed: true, message: "إضافة موفقة حسب الشيف الذكي" });
}
