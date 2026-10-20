
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";

export default function RegisterPage() {
  const { setUser, user } = useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [address, setAddress] = useState(user?.address || "");
  const [geo, setGeo] = useState(user?.geo || null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function captureGps() {
    if (!navigator.geolocation) {
      setStatus("المتصفح لا يدعم تحديد الموقع. يمكنك المتابعة بكتابة العنوان.");
      return;
    }

    setStatus("جاري تحديد موقعك...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("تم تحديد الموقع بنجاح.");
      },
      () => {
        setStatus("تعذر تحديد الموقع. يمكنك المتابعة بكتابة العنوان.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const name = fullName.trim();
    const deliveryAddress = address.trim();

    if (!name || !deliveryAddress) {
      setStatus("اكتب الاسم والعنوان بالتفصيل للمتابعة.");
      return;
    }

    setLoading(true);
    setStatus("");

       try {
      setUser({
        fullName: name,
        address: deliveryAddress,
        ...(geo ? { geo } : {}),
        verified: false,
      });

      router.push("/");
    } catch {
      setStatus("تعذر إكمال التسجيل. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-4xl">التسجيل</h1>

      <p className="mt-2 text-sm text-[#7a6554]">
        اكتب اسمك وعنوان التوصيل للبدء. تحديد الموقع اختياري،
        ولا تحتاج إلى رفع صورة بطاقة لتصفح قائمة الطعام.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <label className="block text-sm">
          الاسم بالكامل
          <input
            required
            maxLength={120}
            className="mt-1 w-full rounded-2xl border border-[#e8d5b8] bg-white px-4 py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <label className="block text-sm">
          العنوان بالتفصيل (شارع، حي، مبنى، علامة مميزة)
          <textarea
            required
            maxLength={500}
            rows={3}
            className="mt-1 w-full rounded-2xl border border-[#e8d5b8] bg-white px-4 py-3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>

        <button
          type="button"
          className="btn-ghost"
          onClick={captureGps}
        >
          تحديد الموقع عبر GPS (اختياري)
        </button>

        {geo ? (
          <p className="text-xs text-[#7a6554]">
            تم تحديد الموقع بدقة تقارب{" "}
            {Math.round(geo.accuracy || 0)} متر.
          </p>
        ) : null}

        {status ? (
          <p role="status" className="rounded-2xl bg-[#fff7ec] p-3 text-sm">
            {status}
          </p>
        ) : null}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "جاري التسجيل..." : "متابعة إلى قائمة الطعام"}
        </button>
      </form>
    </div>
  );
}
