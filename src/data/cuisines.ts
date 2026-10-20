import type { CuisineId } from "@/types";

export const KITCHENS: Record<CuisineId | "sandwich", { lat: number; lng: number; name: string }> = {
  egyptian: { lat: 30.0444, lng: 31.2357, name: "مطبخ القاهرة الفاطمي" },
  syrian: { lat: 30.0566, lng: 31.2197, name: "مطبخ الشام الدمشقي" },
  italian: { lat: 30.0626, lng: 31.2497, name: "مطبخ روما الكلاسيكي" },
  saudi: { lat: 30.0384, lng: 31.2126, name: "مطبخ نجد" },
  american: { lat: 30.05, lng: 31.2333, name: "مطبخ الداينر الأمريكي" },
  sandwich: { lat: 30.048, lng: 31.24, name: "ورشة سندوتشي" },
};

export const CUISINES: {
  id: CuisineId;
  name: string;
  tagline: string;
  heritage: string;
  theme: string;
  accent: string;
}[] = [
  {
    id: "egyptian",
    name: "المطبخ المصري",
    tagline: "عراقة الفاطميين على المائدة",
    heritage: "زخارف إسلامية فاطمية، أقواس، ونقوش هندسية ذهبية على رمال النيل.",
    theme: "theme-egyptian",
    accent: "#C9A227",
  },
  {
    id: "syrian",
    name: "المطبخ السوري",
    tagline: "دمشق وأريج الياسمين",
    heritage: "فسيفساء أموية، بورغندي دمشقي، وأرابيسك شامي دافئ.",
    theme: "theme-syrian",
    accent: "#8B1E3F",
  },
  {
    id: "italian",
    name: "المطبخ الإيطالي",
    tagline: "روما بين الرخام والزيتون",
    heritage: "طابع كلاسيكي روماني: تراكوتا، رخام، أغصان زيتون وأعمدة.",
    theme: "theme-italian",
    accent: "#B8572A",
  },
  {
    id: "saudi",
    name: "المطبخ السعودي",
    tagline: "كرم نجد ودفء الصحراء",
    heritage: "طابع نجدي: طين، نخل، ذهب صحراوي ونقوش نجدية.",
    theme: "theme-saudi",
    accent: "#C4A35A",
  },
  {
    id: "american",
    name: "المطبخ الأمريكي",
    tagline: "داينر ريترو بنبض الخمسينات",
    heritage: "نيون، كروم، أحمر كلاسيكي وأزرق دينر على طراز Retro.",
    theme: "theme-american",
    accent: "#C0392B",
  },
];
