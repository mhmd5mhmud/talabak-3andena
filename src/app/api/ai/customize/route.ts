import { NextResponse } from "next/server";
import { localCustomize } from "@/lib/ai-local";
import { getOpenAI } from "@/lib/openai";
import type { Ingredient } from "@/types";

export async function POST(req: Request) {
  const { mealName, ingredient } = (await req.json()) as {
    mealName: string;
    ingredient: Ingredient;
  };

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json(localCustomize(ingredient));
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          'Decide if removing an ingredient ruins the dish. JSON {"allowed":boolean}. If the ingredient is the soul of the recipe (dough in pizza, pasta in koshari, rice in kabsa), allowed=false.',
      },
      {
        role: "user",
        content: `Meal: ${mealName}. Ingredient: ${ingredient.name}. Marked essential: ${ingredient.essential}`,
      },
    ],
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const allowed = Boolean(parsed.allowed);
  return NextResponse.json({
    allowed,
    message: allowed
      ? "تم السماح بإزالة المكون"
      : "عذراً، لا يمكن إزالة هذا المكون لأنه سوف يخل بالوجبة",
  });
}
