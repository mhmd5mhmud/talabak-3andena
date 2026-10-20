import { BAD_COMBOS } from "@/data/sandwich";
import type { Ingredient } from "@/types";

export function localCustomize(ingredient: Ingredient) {
  if (ingredient.essential) {
    return {
      allowed: false,
      message: "عذراً، لا يمكن إزالة هذا المكون لأنه سوف يخل بالوجبة",
    };
  }
  return {
    allowed: true,
    message: "تم السماح بإزالة المكون",
  };
}

export function localSandwichGuard(existingIds: string[], nextId: string) {
  for (const [a, b, reason] of BAD_COMBOS) {
    const hit =
      (nextId === a && existingIds.includes(b)) ||
      (nextId === b && existingIds.includes(a));
    if (hit) {
      return { allowed: false, message: `الشيف الذكي رفض الإضافة: ${reason}` };
    }
  }
  if (existingIds.filter((id) => id === nextId).length >= 3) {
    return {
      allowed: false,
      message: "الشيف الذكي رفض الإضافة: الإفراط في نفس المكون يفسد التوازن",
    };
  }
  return { allowed: true, message: "إضافة موفقة حسب الشيف الذكي" };
}

export const RECIPE_BANK: Record<string, string[]> = {
  كشري: ["أرز", "مكرونة", "عدس", "حمص", "بصل مقلي", "صلصة طماطم", "دقة"],
  بيتزا: ["عجينة بيتزا", "صلصة طماطم", "موزاريلا", "زيت زيتون", "ريحان"],
  كبسة: ["أرز بسمتي", "لحم أو دجاج", "بهارات كبسة", "طماطم", "بصل", "لوز"],
  برغر: ["خبز برغر", "لحم", "خس", "طماطم", "جبنة", "صلصة"],
  كبّة: ["برغل", "لحم", "بصل", "صنوبر", "بهارات"],
  لازانيا: ["باستا لازانيا", "صلصة لحم", "بشاميل", "موزاريلا", "بارميزان"],
};
