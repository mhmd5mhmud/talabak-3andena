import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("idImage") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, message: "يرجى رفع صورة البطاقة." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, message: "الملف يجب أن يكون صورة واضحة للبطاقة." }, { status: 400 });
  }
  if (file.size < 20_000) {
    return NextResponse.json({ ok: false, message: "الصورة صغيرة جداً وقد تكون غير حقيقية." }, { status: 400 });
  }

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({
      ok: true,
      engine: "heuristic",
      message: "تم قبول الصورة مبدئياً (وضع تجريبي بدون مفتاح OpenAI). للتحقق البصري الكامل أضف OPENAI_API_KEY.",
    });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const b64 = bytes.toString("base64");
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You verify if an image looks like a real government ID card (not a screenshot of text, not a drawing, not a meme). Reply JSON {authentic:boolean, reason:string} in Arabic reason.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Is this a real personal ID card photo?" },
          { type: "image_url", image_url: { url: `data:${file.type};base64,${b64}` } },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  if (!parsed.authentic) {
    return NextResponse.json({
      ok: false,
      engine: "gpt-4o",
      message: parsed.reason || "تعذر التأكد من صحة البطاقة.",
    });
  }
  return NextResponse.json({
    ok: true,
    engine: "gpt-4o",
    message: "تم التحقق من صورة البطاقة بنجاح.",
  });
}
