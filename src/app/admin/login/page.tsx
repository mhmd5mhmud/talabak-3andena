"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/components/providers";

export default function AdminLoginPage() {
  const { setAdmin } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("owner");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let data: { ok?: boolean; message?: string };
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      data = await res.json();
    } catch {
      return setMsg("تعذّر الاتصال بالخادم. حاول مجدداً.");
    }
    if (!data.ok) return setMsg(data.message || "فشل تسجيل الدخول.");
    setAdmin(true);
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl">لوحة المالك</h1>
      <form onSubmit={submit} className="card mt-6 space-y-3 p-6">
        <input
          className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="اسم المستخدم"
        />
        <input
          type="password"
          className="w-full rounded-2xl border border-[#e8d5b8] px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
        />
        {msg ? <p className="text-sm text-[#c45c4a]">{msg}</p> : null}
        <button className="btn-primary w-full">دخول المالك</button>
      </form>
    </div>
  );
}
