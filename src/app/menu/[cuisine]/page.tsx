"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CUISINES } from "@/data/cuisines";
import { useApp } from "@/components/providers";
import type { CuisineId, Ingredient, Meal } from "@/types";
import { SafeImage } from "@/components/safe-image";

export default function CuisineMenuPage() {
  const params = useParams<{ cuisine: CuisineId }>();
  const { meals, addToCart } = useApp();
  const cuisine = CUISINES.find((c) => c.id === params.cuisine);
  const list = useMemo(
    () => meals.filter((m) => m.cuisineId === params.cuisine),
    [meals, params.cuisine],
  );
  const [open, setOpen] = useState<Meal | null>(null);

  if (!cuisine) return <p>المطبخ غير موجود.</p>;

  return (
    <div className={`rounded-[2rem] p-4 sm:p-8 ${cuisine.theme}`}>
      <p className="text-xs tracking-[0.25em] text-[#7a6554]">CUISINE</p>
      <h1 className="font-display text-4xl">{cuisine.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7">{cuisine.heritage}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((meal) => (
          <article key={meal.id} className="card overflow-hidden">
            <div className="relative h-44 w-full">
              <SafeImage src={meal.image} alt={meal.name} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h2 className="font-display text-2xl">{meal.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-[#7a6554]">{meal.description}</p>
              <p className="mt-3 font-semibold text-[#c45c4a]">{meal.price} ج.م</p>
              <button className="btn-primary mt-3 w-full" onClick={() => setOpen(meal)}>
                التفاصيل والتعديل الذكي
              </button>
            </div>
          </article>
        ))}
      </div>
      {open ? (
        <MealModal
          meal={open}
          onClose={() => setOpen(null)}
          onAdd={(removed) => {
            addToCart({
              mealId: open.id,
              name: open.name,
              image: open.image,
              basePrice: open.price,
              removedIngredients: removed,
              extras: [],
              cuisineId: open.cuisineId,
            });
            setOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}

function MealModal({
  meal,
  onClose,
  onAdd,
}: {
  meal: Meal;
  onClose: () => void;
  onAdd: (removed: string[]) => void;
}) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggle(ing: Ingredient) {
    if (removed.includes(ing.name)) {
      setRemoved((r) => r.filter((n) => n !== ing.name));
      setMsg("");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/ai/customize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealName: meal.name, ingredient: ing }),
    });
    const data = await res.json();
    setMsg(data.message);
    if (data.allowed) setRemoved((r) => [...r, ing.name]);
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-auto p-5">
        <h3 className="font-display text-3xl">{meal.name}</h3>
        <p className="mt-2 text-sm text-[#7a6554]">{meal.description}</p>
        <p className="mt-3 text-sm font-semibold">المكونات — اضغط للإزالة عبر الذكاء الاصطناعي</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meal.ingredients.map((ing) => (
            <button
              key={ing.id}
              disabled={busy}
              onClick={() => toggle(ing)}
              className={`rounded-full px-3 py-1 text-sm ${
                removed.includes(ing.name)
                  ? "bg-[#c45c4a] text-white line-through"
                  : "bg-[#fff7ec] text-[#3d2b1f]"
              }`}
            >
              {ing.name}
              {ing.essential ? " • أساسي" : ""}
            </button>
          ))}
        </div>
        {msg ? <p className="mt-4 rounded-2xl bg-[#fff7ec] p-3 text-sm">{msg}</p> : null}
        <div className="mt-5 flex gap-2">
          <button className="btn-primary flex-1" onClick={() => onAdd(removed)}>
            أضف للسلة — {meal.price} ج.م
          </button>
          <button className="btn-ghost" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
