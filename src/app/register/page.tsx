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
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function captureGps() {
    setStatus("جاري تحديد موقعك...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("تم التقاط إحداثيات GPS بنجاح.");
      },
      () => setStatus("تعذر الوصول للموقع. اسمح للمتصفح بالـ GPS."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setStatus("ارفع صورة البطاقة الشخصية.");
    setLoading(true);
    setStatus("الذكاء الاصطناعي يتحقق من العنوان والبطاقة...");
    try {
      const addrRes = await fetch("/api/ai/verify-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, geo }),
      });
      const addr = await addrRes.json();
      if (!addr.ok) {
        setStatus(addr.message);
        setLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("idImage", file);
      const idRes = await fetch("/api/ai/verify-id", { method: "POST", body: fd });
      const id = await idRes.json();
      if (!id.ok) {
        setStatus(id.message);
        setLoading(false);
        return;
      }
      setUser({
        fullName,
        address,
        geo: geo!,
        verified: true,
        verifiedAt: new Date().toISOString(),
      });
      router.push("/");
    } catch {
      setStatus("حدث خطأ أثناء التحقق. حاول مجدداً.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-4xl">التسجيل والتحقق الذكي</h1>
      <p className="mt-2 text-sm text-[#7a6554]">
        لا يمكن تصفح القائمة قبل إكمال الاسم، العنوان الجغرافي، وصورة البطاقة.
      </p>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        <label className="block text-sm">
          الاسم بالكامل
          <input
            required
            className="mt-1 w-full rounded-2xl border border-[#e8d5b8] bg-white px-4 py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          العنوان بالتفصيل (شارع، حي، مبنى، علامة مميزة)
          <textarea
            required
            rows={3}
            className="mt-1 w-full rounded-2xl border border-[#e8d5b8] bg-white px-4 py-3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <button type="button" className="btn-ghost" onClick={captureGps}>
          التقاط الموقع عبر GPS
        </button>
        {geo ? (
          <p className="text-xs text-[#7a6554]">
            {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)} — دقة {Math.round(geo.accuracy || 0)}م
          </p>
        ) : null}
        <label className="block text-sm">
          صورة الهوية الشخصية
          <input
            type="file"
            accept="image/*"
            className="mt-1 w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        {status ? <p className="rounded-2xl bg-[#fff7ec] p-3 text-sm">{status}</p> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "جاري التحقق..." : "تحقق بالذكاء الاصطناعي وادخل"}
        </button>
      </form>
    </div>
  );
}
