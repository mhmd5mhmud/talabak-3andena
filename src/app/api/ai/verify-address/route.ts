
import { NextResponse } from "next/server";
import { isLikelyReachableAddress } from "@/lib/geo";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const address = String(body.address || "").trim();
    const geo = body.geo as {
      lat: number;
      lng: number;
      accuracy?: number;
    } | null;

    const heuristic = isLikelyReachableAddress(address, geo);

    if (!heuristic) {
      return NextResponse.json(
        {
          ok: false,
          engine: "gps-heuristic",
          message:
            "العنوان غير كافٍ. اكتب الشارع والحي، وتأكد من السماح باستخدام الموقع.",
        },
        { status: 400 },
      );
    }

    const openai = getOpenAI();

    // لا نعتمد على OpenAI إذا لم يكن المفتاح متاحًا.
    if (!openai) {
      return NextResponse.json({
        ok: true,
        engine: "gps-heuristic",
        message:
          "اجتاز العنوان الفحص الأولي. يلزم التأكد من إمكانية التوصيل عند مراجعة الطلب.",
      });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              'Assess whether an Arabic delivery address is sufficiently detailed. Do not claim to verify real-world GPS reachability. Return JSON: {"ok":boolean,"reason":string}.',
          },
          {
            role: "user",
            content: `Address: ${address}. GPS: ${geo?.lat},${geo?.lng} accuracy=${geo?.accuracy}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(
        completion.choices[0]?.message?.content || "{}",
      );

      if (typeof parsed.ok !== "boolean") {
        throw new Error("Invalid address verification response");
      }

      return NextResponse.json({
        ok: parsed.ok,
        engine: "gpt-4o",
        message:
          typeof parsed.reason === "string"
            ? parsed.reason
            : parsed.ok
              ? "العنوان اجتاز الفحص الأولي."
              : "يرجى مراجعة تفاصيل العنوان.",
      });
    } catch (error) {
      // في حالة نفاد الرصيد أو تعطل الخدمة،
      // نرجع للفحص المحلي بدل إسقاط الطلب بخطأ 500.
      console.error(
        "OpenAI address verification failed:",
        error instanceof Error ? error.message : "Unknown error",
      );

      return NextResponse.json({
        ok: true,
        engine: "gps-heuristic",
        message:
          "اجتاز العنوان الفحص الأولي. خدمة الذكاء الاصطناعي غير متاحة حاليًا، وسيتم التأكد من إمكانية التوصيل عند مراجعة الطلب.",
      });
    }
  } catch (error) {
    console.error("Address verification request failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "تعذر معالجة بيانات العنوان. حاول مرة أخرى.",
      },
      { status: 400 },
    );
  }
}
