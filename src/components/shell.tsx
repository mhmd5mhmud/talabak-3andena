"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "./providers";

export function Header() {
  const { cart, user } = useApp();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8d5b8]/80 bg-[#fbf4ea]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#c45c4a] font-display text-lg text-white">ط</span>
          <div>
            <p className="font-display text-xl leading-none text-[#3d2b1f]">طلبك عندنا</p>
            <p className="text-xs text-[#7a6554]">توصيل دافئ على مهل الشهية</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link className="btn-ghost" href="/sandwich">
            سندوتشي
          </Link>
          <Link className="btn-ghost" href="/cart">
            السلة {count ? `(${count})` : ""}
          </Link>
          {user ? (
            <span className="hidden rounded-full bg-white/70 px-3 py-2 text-xs text-[#7a6554] sm:inline">
              {user.fullName.split(" ")[0]}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e8d5b8] bg-[#2b1c14] text-[#f6ead8]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="gold-line mb-6" />
        <p className="font-display text-2xl">طلبك عندنا</p>
        <p className="mt-2 max-w-xl text-sm text-[#e8d5b8]">
          منصة توصيل بهوية تراثية دافئة، وخدمة ذكية تحترم الوصفة ومكوناتك.
        </p>
        <p className="mt-8 text-center text-sm tracking-wide text-[#c9a227]">
          this website developed by Mohammed Mahmoud
        </p>
      </div>
    </footer>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const publicPath =
    pathname.startsWith("/register") || pathname.startsWith("/admin");
  const blocked = !user?.verified && !publicPath;

  useEffect(() => {
    if (blocked) router.replace("/register");
  }, [blocked, router]);

  if (blocked) {
    return (
      <div className="p-16 text-center text-[#7a6554]">
        يرجى التسجيل أولاً للدخول إلى طلبك عندنا...
      </div>
    );
  }
  return <>{children}</>;
}
