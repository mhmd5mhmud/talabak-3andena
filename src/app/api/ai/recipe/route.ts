import { NextResponse } from "next/server";
import { RECIPE_BANK } from "@/lib/ai-local";
import { getOpenAI } from "@/lib/openai";
import { isAdminRequest } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, ingredients: [], message: "غير مصرح." }, { status: 401 });
  }
  const { name } = (await req.json()) as { name?: string };
  const query = (name || "").trim();
  if (!query) {
    return NextResponse.json({ ok: false, ingredients: [], message: "أدخل اسم الوجبة." }, { status: 400 });
  }

  const bankHit = Object.entries(RECIPE_BANK).find(([k]) => query.includes(k) || k.includes(query));

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    const meal = data?.meals?.[0];
    if (meal) {
      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && String(ing).trim()) ingredients.push(String(ing).trim());
      }
      return NextResponse.json({
        ok: true,
        source: "TheMealDB",
        ingredients,
        message: "تم استخراج المكونات الأصلية من مصادر الوصفات.",
      });
    }
  } catch {
    /* fall through */
  }

  const openai = getOpenAI();
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 'Return authentic ingredients for a dish. JSON {"ingredients": string[] Arabic}',
        },
        { role: "user", content: query },
      ],
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    return NextResponse.json({
      ok: true,
      source: "gpt-4o",
      ingredients: parsed.ingredients || [],
      message: "تم تعبئة المكونات بواسطة الذكاء الاصطناعي.",
    });
  }

  if (bankHit) {
    return NextResponse.json({
      ok: true,
      source: "local-bank",
      ingredients: bankHit[1],
      message: "تم تعبئة المكونات من قاعدة الوصفات المحلية.",
    });
  }

  return NextResponse.json({
    ok: false,
    ingredients: [],
    message: "تعذر العثور على الوصفة. أدخل المكونات يدوياً أو أضف OPENAI_API_KEY.",
  });
}
