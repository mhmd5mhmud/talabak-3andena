export type CuisineId =
  | "egyptian"
  | "syrian"
  | "italian"
  | "saudi"
  | "american";

export type Ingredient = {
  id: string;
  name: string;
  essential: boolean;
};

export type Meal = {
  id: string;
  cuisineId: CuisineId;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: Ingredient[];
};

export type CartItem = {
  id: string;
  mealId: string | "sandwich";
  name: string;
  image: string;
  basePrice: number;
  qty: number;
  removedIngredients: string[];
  extras: string[];
  cuisineId?: CuisineId | "sandwich";
};

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type UserProfile = {
  fullName: string;
  address: string;
  geo: GeoPoint;
  verified: boolean;
  verifiedAt: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
  createdAt: string;
  etaSeconds: number;
  kitchen: GeoPoint & { name?: string };
  destination: GeoPoint;
  distanceKm: number;
};

export type SandwichLayer = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: "bread" | "protein" | "veg" | "sauce" | "extra";
};
