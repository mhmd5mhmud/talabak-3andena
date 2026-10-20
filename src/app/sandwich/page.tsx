"use client";

import { useMemo, useState } from "react";
import { SANDWICH_LAYERS } from "@/data/sandwich";
import { useApp } from "@/components/providers";

export default function SandwichPage() {
  const { addToCart } = useApp();
  const [stack, setStack] = useState<string[]>(["bread-white"]);
  const [msg, setMsg] = useState("ابدأ بإضافة الطبقات. الشيف الذكي يراقب.");
  const [busy, setBusy] = useState(false);

  const layers = useMemo(
    () => stack.map((id) => SANDWICH_LAYERS.find((l) => l.id === id)!).filter(Boolean),
    [stack],
  );
  const price = 40 + Math.max(0, stack.length - 1) * 8;

  async function add(id: string) {
    setBusy(true);
    const res = await fetch("/api/ai/sandwich-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ existingIds: stack, nextId: id }),
    });
    const data = await res.json();
    setMsg(data.message);
    if (data.allowed) setStack((s) => [...s, id]);
    setBusy(false);
  }

  return (
    <div className="theme-american rounded-[2rem] p-4 sm:p-8">
      <h1 className="neon-diner font-display text-4xl text-[#c0392b]">لعبة سندوتشي</h1>
      <p className="mt-2 max-w-xl text-sm">ابنِ سندوتشك طبقة طبقة كأنه لعبة مطبخ. أي مزيج ضار أو كارثي يوقفه الشيف الذكي.</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="card p-4">
          <p className="text-sm font-semibold">المكونات</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SANDWICH_LAYERS.map((l) => (
              <button
                key={l.id}
                disabled={busy}
                onClick={() => add(l.id)}
                className="rounded-2xl bg-white p-3 text-right shadow-sm hover:shadow"
              >
                <span className="text-2xl">{l.emoji}</span>
                <p className="mt-1 text-sm">{l.name}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="relative mx-auto flex min-h-[420px] w-full max-w-md flex-col-reverse items-center justify-start rounded-[2rem] bg-[#1f140e] p-8">
            {layers.map((l, i) => (
              <div
                key={`${l.id}-${i}`}
                className="w-[78%] rounded-full border border-black/10 px-4 py-3 text-center text-sm font-semibold shadow-lg"
                style={{
                  background: l.color,
                  marginTop: -8,
                  transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                }}
              >
                {l.emoji} {l.name}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-white/80 p-3 text-sm">{msg}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-ghost" onClick={() => setStack(["bread-white"])}>
              إعادة
            </button>
            <button
              className="btn-primary"
              onClick={() =>
                addToCart({
                  mealId: "sandwich",
                  name: `سندوتشي (${layers.map((l) => l.name).join(" + ")})`,
                  image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
                  basePrice: price,
                  removedIngredients: [],
                  extras: layers.map((l) => l.name),
                  cuisineId: "sandwich",
                })
              }
            >
              أضف للسلة — {price} ج.م
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
