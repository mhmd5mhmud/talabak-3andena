"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Meal, Order, UserProfile } from "@/types";
import { store } from "@/lib/storage";
import { DEFAULT_MEALS } from "@/data/meals";

type AppCtx = {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (order: Order) => void;
  meals: Meal[];
  saveMeals: (meals: Meal[]) => void;
  admin: boolean;
  adminReady: boolean;
  setAdmin: (v: boolean) => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [admin, setAdminState] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserState(store.read(store.keys.user, null));
    setCart(store.read(store.keys.cart, []));
    setOrders(store.read(store.keys.orders, []));
    setMeals(store.read(store.keys.meals, DEFAULT_MEALS));
    setReady(true);
    // Admin status is decided by the server (signed httpOnly cookie), never by localStorage.
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAdminState(Boolean(d.ok)))
      .catch(() => setAdminState(false))
      .finally(() => setAdminReady(true));
    localStorage.removeItem(store.keys.admin); // drop the old insecure flag
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      user,
      setUser: (u) => {
        setUserState(u);
        if (u) store.write(store.keys.user, u);
        else localStorage.removeItem(store.keys.user);
      },
      cart,
      addToCart: (item) => {
        setCart((prev) => {
          const next = [
            ...prev,
            { ...item, id: crypto.randomUUID(), qty: item.qty || 1 },
          ];
          store.write(store.keys.cart, next);
          return next;
        });
      },
      updateQty: (id, qty) => {
        setCart((prev) => {
          const next = prev
            .map((i) => (i.id === id ? { ...i, qty } : i))
            .filter((i) => i.qty > 0);
          store.write(store.keys.cart, next);
          return next;
        });
      },
      removeItem: (id) => {
        setCart((prev) => {
          const next = prev.filter((i) => i.id !== id);
          store.write(store.keys.cart, next);
          return next;
        });
      },
      clearCart: () => {
        setCart([]);
        store.write(store.keys.cart, []);
      },
      orders,
      placeOrder: (order) => {
        setOrders((prev) => {
          const next = [order, ...prev];
          store.write(store.keys.orders, next);
          return next;
        });
      },
      meals,
      saveMeals: (m) => {
        setMeals(m);
        store.write(store.keys.meals, m);
      },
      admin,
      adminReady,
      setAdmin: (v) => {
        setAdminState(v);
        if (!v) fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
      },
    }),
    [user, cart, orders, meals, admin, adminReady],
  );

  if (!ready) return <div className="p-10 text-center text-[#7a6554]">جاري التحميل...</div>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside Providers");
  return ctx;
}
