// Usage: node scripts/check-images.mjs   (needs internet access)
// Lists every image URL used by the default meals and reports the ones that do not load.
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/data/meals.ts", import.meta.url), "utf8");
const ids = [...src.matchAll(/U\("([^"]+)"\)/g)].map((m) => m[1]);
const unique = [...new Set(ids)];
console.log(`${ids.length} references, ${unique.length} unique Unsplash photos`);

let bad = 0;
for (const id of unique) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) throw new Error(`${res.status} ${type}`);
  } catch (e) {
    bad++;
    const meals = [...src.matchAll(new RegExp(`meal\\("[^"]+", "([^"]+)", "([^"]+)"[^\\n]*${id}`, "g"))].map((m) => `${m[1]} (${m[2]})`);
    console.log(`BROKEN  ${id}  -> ${e.message}\n        used by: ${meals.join(", ") || "?"}`);
  }
}
console.log(bad ? `\n${bad} broken photo(s).` : "\nAll photos load.");
process.exit(bad ? 1 : 0);
