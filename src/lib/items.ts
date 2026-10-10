import itemsJson from "@/data/items.json";
import { editDistance, type GearSlot, type Rarity, type WeaponClass } from "@/lib/game";

/** One entry from docs/items.md: a weapon, gear piece, brand or gear set. */
export interface ItemDef {
  name: string;
  kind: "weapon" | "gear" | "brand" | "gear-set";
  rarity?: Rarity;
  weaponClass?: WeaponClass;
  gearSlot?: GearSlot;
  /** Brand or gear set a gear piece belongs to. */
  set?: string;
  /** For named weapons: the model they're based on. */
  baseModel?: string;
}

export const ITEMS = itemsJson as ItemDef[];

// Characters OCR mixes up, folded to one form on both sides of a comparison.
const CONFUSABLE: Record<string, string> = { o: "0", d: "0", q: "0", l: "1", i: "1", j: "1", s: "5", e: "6", b: "8", z: "2" };

/**
 * Comparison key for item names: lowercase letters and digits only, with OCR
 * lookalikes folded together, so "SOCOM Mk1e" and "SOCOM Mk16" share a key
 * while "Mk16" and "Mk17" stay different.
 */
export function itemKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/./g, (ch) => CONFUSABLE[ch] ?? ch);
}

const plain = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Closest item to an OCR reading, or undefined if nothing is close enough
 * (about one slip per four characters). Ties go to the closer raw spelling.
 */
export function matchItem(raw: string, accept: (item: ItemDef) => boolean = () => true): ItemDef | undefined {
  const key = itemKey(raw);
  if (key.length < 3) return undefined;
  let best: ItemDef | undefined;
  let bestScore = Infinity;
  for (const item of ITEMS) {
    if (!accept(item)) continue;
    const score = editDistance(key, itemKey(item.name)) * 100 + editDistance(plain(raw), plain(item.name));
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best && Math.floor(bestScore / 100) <= Math.max(1, Math.floor(key.length / 4)) ? best : undefined;
}
