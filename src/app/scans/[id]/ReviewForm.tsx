"use client";
import { useState, useTransition } from "react";
import { GEAR_SLOTS, WEAPON_CLASSES } from "@/lib/game";
import type { ItemAttribute, ScannedItem } from "@/lib/verdict";
import { judgeScan } from "./actions";

interface Names {
  weaponCore: string[];
  weaponMinor: string[];
  gearCore: string[];
  gearMinor: string[];
  talents: string[];
  weapons: string[];
  gear: string[];
  sets: string[];
}

interface Row {
  name: string;
  value: string;
  /** OCR wasn't sure about this value; cleared once the user edits it. */
  uncertain?: boolean;
}

const WEAPON_RARITIES = [
  ["high-end", "High-end"],
  ["named", "Named"],
  ["exotic", "Exotic"],
] as const;
const GEAR_RARITIES = [
  ["brand", "Brand set"],
  ["gear-set", "Gear set"],
  ["named", "Named"],
  ["exotic", "Exotic"],
] as const;

const toRows = (attrs: ItemAttribute[] | undefined, count: number): Row[] => {
  const rows: Row[] = (attrs ?? []).map((a) => ({
    name: a.name,
    value: a.uncertain && !a.value ? "" : String(a.value),
    uncertain: a.uncertain,
  }));
  while (rows.length < count) rows.push({ name: "", value: "" });
  return rows;
};

/** "+3,445HP/s" -> 3445, "+9.6%" -> 9.6 */
const parseValue = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

export function ReviewForm({
  scanId,
  initial,
  names,
}: {
  scanId: number;
  initial: ScannedItem | null;
  names: Names;
}) {
  const [kind, setKind] = useState<ScannedItem["kind"]>(initial?.kind ?? "weapon");
  const [rarity, setRarity] = useState<string>(initial?.rarity ?? "high-end");
  const [name, setName] = useState(initial?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [weaponClass, setWeaponClass] = useState<string>(initial?.weaponClass ?? "Assault Rifle");
  const [gearSlot, setGearSlot] = useState<string>(initial?.gearSlot ?? "Mask");
  const [core, setCore] = useState<Row[]>(toRows(initial?.core, initial?.kind === "gear" ? 1 : 2));
  const [attrs, setAttrs] = useState<Row[]>(toRows(initial?.attributes, 1));
  const [talent, setTalent] = useState(initial?.talent ?? "");
  const [prototype, setPrototype] = useState(initial?.prototype ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const switchKind = (k: ScannedItem["kind"]) => {
    setKind(k);
    setRarity(k === "weapon" ? "high-end" : "brand");
    setCore(toRows([], k === "gear" ? 1 : 2));
    setAttrs(toRows([], 1));
  };

  const coreNames = kind === "weapon" ? names.weaponCore : names.gearCore;
  const minorNames = kind === "weapon" ? names.weaponMinor : names.gearMinor;
  const maxAttrs = kind === "weapon" ? 1 : 2;

  const submit = () => {
    const rows = (rs: Row[]) =>
      rs.filter((r) => r.name.trim() && r.value.trim()).map((r) => ({ name: r.name, value: parseValue(r.value) }));
    const item = {
      kind,
      rarity,
      name,
      brand: kind === "gear" ? brand : undefined,
      weaponClass: kind === "weapon" ? weaponClass : undefined,
      gearSlot: kind === "gear" ? gearSlot : undefined,
      core: rows(core),
      attributes: rows(attrs),
      talent,
      prototype,
    };
    startTransition(async () => setError(await judgeScan(scanId, item)));
  };

  const rowEditor = (rows: Row[], set: (r: Row[]) => void, listId: string) =>
    rows.map((r, i) => (
      <div key={i} className="flex gap-2">
        <input
          className={`w-24 shrink-0 ${r.uncertain ? "!border-expertise !bg-expertise/15" : ""}`}
          title={r.uncertain ? "Not sure this was read correctly: please check it" : undefined}
          inputMode="decimal"
          placeholder="Value"
          value={r.value}
          onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, value: e.target.value, uncertain: false } : x)))}
        />
        <input
          className="flex-1"
          list={listId}
          placeholder="Attribute"
          value={r.name}
          onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
        />
      </div>
    ));

  return (
    <form
      className="card flex flex-col gap-3 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <h2 className="text-base font-semibold">Check what was read</h2>

      <div className="grid grid-cols-2 gap-2">
        <select value={kind} onChange={(e) => switchKind(e.target.value as ScannedItem["kind"])}>
          <option value="weapon">Weapon</option>
          <option value="gear">Gear</option>
        </select>
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          {(kind === "weapon" ? WEAPON_RARITIES : GEAR_RARITIES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <input
        list={kind === "weapon" ? "weapon-names" : "gear-names"}
        placeholder="Item name, e.g. SOCOM Mk16"
        value={name} onChange={(e) => setName(e.target.value)} />

      {kind === "weapon" ? (
        <select value={weaponClass} onChange={(e) => setWeaponClass(e.target.value)}>
          {WEAPON_CLASSES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <select value={gearSlot} onChange={(e) => setGearSlot(e.target.value)}>
            {GEAR_SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input list="set-names" placeholder="Brand or gear set" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-muted">Core attribute{kind === "weapon" ? "s" : ""}</legend>
        {rowEditor(core, setCore, "core-names")}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-muted">Attributes</legend>
        {rowEditor(attrs, setAttrs, "minor-names")}
        {attrs.length < maxAttrs && (
          <button type="button" className="self-start text-shd" onClick={() => setAttrs([...attrs, { name: "", value: "" }])}>
            + Add attribute
          </button>
        )}
      </fieldset>

      <input list="talent-names" placeholder="Talent (if any)" value={talent} onChange={(e) => setTalent(e.target.value)} />

      <label className="flex items-center gap-2 text-muted">
        <input type="checkbox" checked={prototype} onChange={(e) => setPrototype(e.target.checked)} />
        Prototype item
      </label>

      {error && <p className="text-deconstruct">{error}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Checking…" : "Get verdict"}
      </button>

      <datalist id="core-names">{coreNames.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="minor-names">{minorNames.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="talent-names">{names.talents.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="weapon-names">{names.weapons.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="gear-names">{names.gear.map((n) => <option key={n} value={n} />)}</datalist>
      <datalist id="set-names">{names.sets.map((n) => <option key={n} value={n} />)}</datalist>
    </form>
  );
}
