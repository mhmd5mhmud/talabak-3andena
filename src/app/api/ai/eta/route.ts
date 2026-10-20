import { NextResponse } from "next/server";
import { estimateEtaSeconds, haversineKm } from "@/lib/geo";
import { KITCHENS } from "@/data/cuisines";
import type { CuisineId } from "@/types";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json();
  const cuisineId = (body.cuisineId || "egyptian") as CuisineId | "sandwich";
  const dest = body.geo as { lat: number; lng: number };
  const kitchen = KITCHENS[cuisineId] || KITCHENS.egyptian;
  const distanceKm = haversineKm(kitchen, dest);
  const prep = 18 + Math.round(Math.random() * 8);
  let seconds = estimateEtaSeconds(distanceKm, prep);

  const openai = getOpenAI();
  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'Estimate food delivery minutes given distance km and prep minutes in a dense city. JSON {"minutes":number}',
        },
        {
          role: "user",
          content: `distanceKm=${distanceKm.toFixed(2)} prep=${prep} city traffic evening`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    if (parsed.minutes) seconds = Math.round(Number(parsed.minutes) * 60);
  }

  return NextResponse.json({
    distanceKm: Number(distanceKm.toFixed(2)),
    etaSeconds: seconds,
    kitchen,
  });
}
