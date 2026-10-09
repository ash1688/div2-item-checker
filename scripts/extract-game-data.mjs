// Pulls the fenced JSON seed blocks out of docs/*.md into src/data/*.json,
// so the research docs stay the single source of truth for game data.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function lastJsonBlock(mdPath) {
  const md = readFileSync(join(root, mdPath), "utf8");
  const blocks = [...md.matchAll(/```json\s*\n([\s\S]*?)```/g)];
  if (blocks.length === 0) throw new Error(`No JSON block in ${mdPath}`);
  return JSON.parse(blocks[blocks.length - 1][1]);
}

const outDir = join(root, "src", "data");
mkdirSync(outDir, { recursive: true });

const attributes = lastJsonBlock("docs/attributes.md").map((a) => ({
  name: a.name,
  category: a.category,
  color: a.color ?? null,
  appliesTo: a.appliesTo,
  max: a.max,
  unit: a.unit,
  aliases: a.aliases ?? [],
}));
const talents = lastJsonBlock("docs/talents.md").map((t) => ({
  name: t.name,
  slot: t.slot,
  restriction: t.restriction,
  tier: t.tier,
}));

writeFileSync(join(outDir, "attributes.json"), JSON.stringify(attributes, null, 2) + "\n");
writeFileSync(join(outDir, "talents.json"), JSON.stringify(talents, null, 2) + "\n");
console.log(`attributes: ${attributes.length}, talents: ${talents.length}`);
