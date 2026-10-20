const KEYS = {
  user: "talabak_user",
  cart: "talabak_cart",
  orders: "talabak_orders",
  meals: "talabak_meals_override",
  admin: "talabak_admin",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  keys: KEYS,
  read,
  write,
};
