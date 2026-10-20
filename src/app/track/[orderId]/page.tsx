"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers";

export default function TrackPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === orderId);
  const [left, setLeft] = useState(order?.etaSeconds || 0);

  useEffect(() => {
    if (!order) return;
    const born = new Date(order.createdAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - born) / 1000);
      setLeft(Math.max(0, order.etaSeconds - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [order]);

  if (!order) return <p>الطلب غير موجود على هذا الجهاز.</p>;
  const m = Math.floor(left / 60);
  const s = left % 60;

  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-sm text-[#c9a227]">تم تأكيد طلبك</p>
      <h1 className="mt-2 font-display text-4xl">عداد الوصول الذكي</h1>
      <p className="mt-6 font-display text-6xl text-[#c45c4a]">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
      <p className="mt-4 text-sm leading-7 text-[#7a6554]">
        المسافة بين {order.kitchen.name} وعنوانك: {order.distanceKm} كم.
        النموذج حسب المسافة الجغرافية وحركة المدينة.
      </p>
      <ul className="mt-6 space-y-2 text-right text-sm">
        {order.items.map((i) => (
          <li key={i.id}>
            {i.qty} × {i.name}
          </li>
        ))}
      </ul>
      <p className="mt-6 font-semibold">الإجمالي {order.total} ج.م</p>
    </div>
  );
}
