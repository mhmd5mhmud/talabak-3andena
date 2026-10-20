"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers";
import { CUISINES } from "@/data/cuisines";
import type { CuisineId, Meal } from "@/types";

export default function AdminPage() {
  const { admin, adminReady, meals, saveMeals, setAdmin } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [cuisineId, setCuisineId] = useState<CuisineId>("egyptian");
  const [price, setPrice] = useState(90);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80");
  const [ingredientsText, setIngredientsText] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (adminReady && !admin) router.replace("/admin/login");
  }, [adminReady, admin, router]);

  if (!adminReady || !admin) {
    return <p>لوحة المالك محمية...</p>;
  }

  async function aiFill() {
    const res = await fetch("/api/ai/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.status === 401) {
      setAdmin(false);
      setMsg("انتهت الجلسة، سجّل الدخول من جديد.");
      return;
    }
    const data = await res.json();
    setMsg(data.message);
    if (data.ok) setIngredientsText(data.ingredients.join("، "));
  }

  function addMeal() {
    const ingredients = ingredientsText
      .split(/[،,]/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n, i) => ({ id: `${n}-${i}`, name: n, essential: i === 0 }));
    const meal: Meal = {
      id: crypto.randomUUID(),
      cuisineId,
      name,
      description,
      price,
      image,
      ingredients,
    };
    saveMeals([meal, ...meals]);
    setName("");
    setDescription("");
    setIngredientsText("");
    setMsg("تمت إضافة الوجبة.");
  }

  function removeMeal(id: string) {
    saveMeals(meals.filter((m) => m.id !== id));
  }

  function updatePrice(id: string, next: number) {
    saveMeals(meals.map((m) => (m.id === id ? { ...m, price: next } : m)));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">إدارة المأكولات</h1>
        <button
          className="btn-ghost"
          onClick={() => {
            setAdmin(false);
            router.push("/");
          }}
        >
          خروج المالك
        </button>
      </div>
      <div className="card mt-6 space-y-3 p-5">
        <p className="font-semibold">إضافة وجبة جديدة</p>
        <input className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" placeholder="اسم الوجبة" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" value={cuisineId} onChange={(e) => setCuisineId(e.target.value as CuisineId)}>
          {CUISINES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="number" className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        <textarea className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" placeholder="وصف" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" placeholder="رابط الصورة" value={image} onChange={(e) => setImage(e.target.value)} />
        <textarea className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3" placeholder="المكونات يدوياً مفصولة بفاصلة" value={ingredientsText} onChange={(e) => setIngredientsText(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-ghost" type="button" onClick={aiFill}>بحث آلي بالمكونات عبر AI</button>
          <button className="btn-primary" type="button" onClick={addMeal}>حفظ الوجبة</button>
        </div>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </div>
      <div className="mt-6 space-y-2">
        {meals.map((m) => (
          <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-[#7a6554]">{m.cuisineId} — {m.ingredients.map((i) => i.name).join("، ")}</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="number" className="w-24 rounded-xl border border-[#e8d5b8] px-2 py-1" value={m.price} onChange={(e) => updatePrice(m.id, Number(e.target.value))} />
              <button className="text-sm text-[#c45c4a]" onClick={() => removeMeal(m.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
