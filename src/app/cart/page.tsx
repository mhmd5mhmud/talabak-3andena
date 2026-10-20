"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";
import type { CuisineId } from "@/types";
import { SafeImage } from "@/components/safe-image";

export default function CartPage() {
  const { cart, updateQty, removeItem, clearCart, user, placeOrder } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.basePrice * i.qty, 0);
  const delivery = cart.length ? 25 : 0;
  const total = subtotal + delivery;

 
  async function checkout() {
    if (!user || !cart.length) return;

    if (!user.geo) {
      router.push("/register");
      return;
    }

    setBusy(true);

    try {
      const cuisineId = (cart[0].cuisineId || "egyptian") as CuisineId | "sandwich";

      const etaRes = await fetch("/api/ai/eta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuisineId,
          geo: user.geo,
        }),
      });

      if (!etaRes.ok) {
        throw new Error("تعذر حساب وقت التوصيل.");
      }

      const eta = await etaRes.json();

      if (
        !Number.isFinite(user.geo.lat) ||
        !Number.isFinite(user.geo.lng) ||
        !Number.isFinite(eta.etaSeconds) ||
        !eta.kitchen ||
        !Number.isFinite(eta.distanceKm)
      ) {
        throw new Error("بيانات التوصيل غير مكتملة. حاول تحديد موقعك مرة أخرى.");
      }

      const order = {
        id: crypto.randomUUID(),
        items: cart,
        subtotal,
        delivery,
        total,
        createdAt: new Date().toISOString(),
        etaSeconds: eta.etaSeconds,
        kitchen: eta.kitchen,
        destination: user.geo,
        distanceKm: eta.distanceKm,
      };

      placeOrder(order);
      clearCart();
      router.push(`/track/${order.id}`);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء تأكيد الطلب. حاول مرة أخرى."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl">السلة والدفع</h1>
      {!cart.length ? (
        <p className="mt-6 text-[#7a6554]">سلتك فارغة. اختر وجبة من المطابخ.</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-3">
            {cart.map((item) => (
              <article key={item.id} className="card flex items-start gap-4 p-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <SafeImage src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  {item.removedIngredients.length ? (
                    <p className="text-xs text-[#c45c4a]">بدون: {item.removedIngredients.join("، ")}</p>
                  ) : null}
                  <p className="mt-1 text-sm">{item.basePrice} ج.م</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="btn-ghost" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button className="btn-ghost" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    <button className="text-xs text-[#c45c4a]" onClick={() => removeItem(item.id)}>حذف</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="card h-fit p-5">
            <p>المجموع: {subtotal} ج.م</p>
            <p className="mt-1">التوصيل: {delivery} ج.م</p>
            <p className="mt-3 font-display text-2xl">الإجمالي {total} ج.م</p>
            <p className="mt-2 text-xs text-[#7a6554]">التوصيل إلى: {user?.address}</p>
            <button className="btn-primary mt-4 w-full" disabled={busy} onClick={checkout}>
              {busy ? "جارٍ حساب وقت الوصول..." : "تأكيد الطلب"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
