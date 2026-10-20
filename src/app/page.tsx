"use client";

import Link from "next/link";
import { CUISINES } from "@/data/cuisines";
import { useApp } from "@/components/providers";

export default function HomePage() {
  const { user } = useApp();
  return (
    <div>
      <section className="overflow-hidden rounded-[2.2rem] border border-[#e8d5b8] bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=70')] bg-cover bg-center">
        <div className="bg-[#2b1c14]/55 px-8 py-16 text-white sm:px-12">
          <p className="text-sm tracking-[0.3em] text-[#c9a227]">TALABAK 3ANDENA</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">طلبك عندنا</h1>
          <p className="mt-4 max-w-xl text-lg text-[#f6ead8]">
            أهلاً {user?.fullName.split(" ")[0]}. اختر مطبخاً يعكس تراثه، وعدّل وجبتك بذكاء، أو اصنع سندوتشك كلعبة.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CUISINES.map((c) => (
          <Link
            key={c.id}
            href={`/menu/${c.id}`}
            className={`card ${c.theme} block overflow-hidden p-6 transition hover:-translate-y-1`}
          >
            <p className="text-xs tracking-widest text-[#7a6554]">HERITAGE</p>
            <h2 className="mt-2 font-display text-3xl">{c.name}</h2>
            <p className="mt-2 text-[#c45c4a]">{c.tagline}</p>
            <p className="mt-3 text-sm leading-7 text-[#5c4636]">{c.heritage}</p>
          </Link>
        ))}
        <Link href="/sandwich" className="card block bg-gradient-to-br from-[#fff7ec] to-[#f3d3b8] p-6 hover:-translate-y-1">
          <p className="text-xs tracking-widest text-[#7a6554]">PLAY</p>
          <h2 className="mt-2 font-display text-3xl">لعبة سندوتشي</h2>
          <p className="mt-3 text-sm leading-7">ابنِ طبقات سندوتشك، والشيف الذكي يحرس المذاق والصحة.</p>
        </Link>
      </div>
    </div>
  );
}
