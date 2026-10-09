import "server-only";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp, { type Sharp } from "sharp";
import { createWorker, PSM, type Worker } from "tesseract.js";
import { DATA_DIR } from "@/lib/paths";
import type { ScannedItem } from "@/lib/verdict";
import { parseTooltip, type TooltipText } from "./parse";

/**
 * Where the item card sits in a 16:9 PS5 capture (Tinkering/inventory screen),
 * as fractions of the frame. Header = name/brand box; body = everything below.
 */
const CARD = { left: 0.405, top: 0.16, width: 0.32, height: 0.65 };
const HEADER_TEXT = { left: 0.37, top: 0.01, width: 0.47, height: 0.09 };
const HEADER_STATS = { left: 0.31, top: 0.08, width: 0.5, height: 0.085 };
const HEADER_SWATCH = { left: 0.02, top: 0.02, width: 0.27, height: 0.13 };
const BODY_TOP = 0.165;

type Rect = { left: number; top: number; width: number; height: number };
type Raw = { data: Buffer; width: number; height: number; channels: number };

function scale(r: Rect, w: number, h: number): Rect {
  return {
    left: Math.round(r.left * w),
    top: Math.round(r.top * h),
    width: Math.round(r.width * w),
    height: Math.round(r.height * h),
  };
}

async function raw(img: Sharp): Promise<Raw> {
  const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

/**
 * Value text is a saturated orange (hue ~25°). A strict hue/saturation test keeps
 * it apart from the pinkish game glow behind the panel and the red/yellow icons.
 */
const isOrange = (r: number, g: number, b: number, minSat = 0.55) => {
  if (r < 150) return false;
  const { h, s } = hue(r, g, b);
  return h >= 15 && h <= 45 && s >= minSat;
};
/** Orange over the pink glow: hue drifts but the red-blue gap stays large. */
const isOrangeRB = (r: number, g: number, b: number) => r > 170 && r - b > 120 && g < r * 0.8;
const isWhite = (r: number, g: number, b: number) =>
  Math.min(r, g, b) > 165 && Math.max(r, g, b) - Math.min(r, g, b) < 70;

/**
 * Black-on-white text mask: keeps white and orange text, drops the see-through
 * background. Mostly-orange rows are a highlighted row (dark text on orange).
 */
function textMask({ data, width: w, height: h, channels: c }: Raw, forceHighlighted?: boolean, minSat?: number | "rb"): Buffer {
  const out = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    const highlighted = forceHighlighted ?? orangeFraction({ data, width: w, height: h, channels: c }, y, y + 1) > 0.5;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * c;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const orange = minSat === "rb" ? isOrangeRB(r, g, b) : isOrange(r, g, b, minSat);
      const text = highlighted ? Math.max(r, g, b) < 90 : orange || isWhite(r, g, b);
      out[y * w + x] = text ? 0 : 255;
    }
  }
  return out;
}

/** Share of orange pixels in rows [y0, y1). */
function orangeFraction({ data, width: w, channels: c }: Raw, y0: number, y1: number): number {
  let orange = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * c;
      if (isOrange(data[i], data[i + 1], data[i + 2])) orange++;
    }
  }
  return orange / Math.max(1, (y1 - y0) * w);
}

function hue(r: number, g: number, b: number): { h: number; s: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return { h: 0, s: 0 };
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s: d / max };
}

/** Header colour: red = exotic, teal = gear set, gold with yellow name text = named, else other. */
function headerRarity(swatch: Raw, nameText: Raw): TooltipText["colourRarity"] {
  const hues: number[] = [];
  for (let i = 0; i < swatch.data.length; i += swatch.channels) {
    const { h, s } = hue(swatch.data[i], swatch.data[i + 1], swatch.data[i + 2]);
    if (s > 0.35) hues.push(h);
  }
  if (hues.length === 0) return undefined;
  hues.sort((a, b) => a - b);
  const median = hues[Math.floor(hues.length / 2)];
  if (median < 18 || median > 340) return "exotic";
  if (median > 160 && median < 210) return "gear-set";

  // Named items print their name in yellow rather than white.
  let yellow = 0;
  let white = 0;
  for (let i = 0; i < nameText.data.length; i += nameText.channels) {
    const [r, g, b] = [nameText.data[i], nameText.data[i + 1], nameText.data[i + 2]];
    if (r > 200 && g > 160 && b < 110 && r - b > 110) yellow++;
    else if (isWhite(r, g, b) && Math.min(r, g, b) > 200) white++;
  }
  return yellow > white * 0.5 && yellow > 50 ? "named" : "other";
}

// One shared worker; tesseract jobs are serialised through `queue`.
const g = globalThis as unknown as { __ocr?: Promise<Worker>; __ocrQueue?: Promise<unknown> };

function worker(): Promise<Worker> {
  if (!g.__ocr) {
    const cachePath = join(DATA_DIR, "tesseract");
    mkdirSync(cachePath, { recursive: true });
    g.__ocr = createWorker("eng", undefined, { cachePath });
  }
  return g.__ocr;
}

function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = (g.__ocrQueue ?? Promise.resolve()).then(job, job);
  g.__ocrQueue = run.catch(() => undefined);
  return run;
}

function png(mask: Buffer, width: number, height: number, upscale = 1) {
  return sharp(mask, { raw: { width, height, channels: 1 } })
    .resize({ width: width * upscale, kernel: "lanczos3" })
    .extend({ top: 20, bottom: 20, left: 20, right: 20, background: "#fff" })
    .png()
    .toBuffer();
}

type Box = { x0: number; y0: number; x1: number; y1: number };
interface OcrLine {
  text: string;
  bbox: Box;
  words: { text: string; bbox: Box }[];
}

/**
 * Split the mask into text rows by horizontal ink bands. Tesseract's own layout
 * analysis treats the value and the stat name as separate columns (there's a
 * wide gap between them), so each row is found here and read as one line.
 */
function textBands(mask: Buffer, width: number, height: number): { y0: number; y1: number }[] {
  const minInk = 3;
  const inked = (y: number) => {
    let n = 0;
    for (let x = 0; x < width; x++) if (mask[y * width + x] === 0 && ++n >= minInk) return true;
    return false;
  };
  const bands: { y0: number; y1: number }[] = [];
  let y = 0;
  while (y < height) {
    if (!inked(y)) {
      y++;
      continue;
    }
    const y0 = y;
    let gap = 0;
    while (y < height && gap <= 2) {
      gap = inked(y) ? 0 : gap + 1;
      y++;
    }
    const y1 = y - gap;
    // Text rows are ~3% of the body tall; thinner slivers are bar remnants or noise.
    if (y1 - y0 >= height * 0.012) bands.push({ y0, y1 });
  }
  return bands;
}

/** Body lines, with each value re-read several ways using a digits-only whitelist. */
async function readBody(w: Worker, body: Raw): Promise<string[]> {
  const mask = textMask(body);
  // Bar lines under each stat are long horizontal runs; no glyph stroke is that long.
  blankBarRows(mask, body.width, body.height, body.height * 0.03);
  await w.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE, tessedit_char_whitelist: "" });

  // Coordinates below are kept in the padded image space png() produces (+20 each side),
  // which the value-box maths further down expects.
  const lines: OcrLine[] = [];
  for (const band of textBands(mask, body.width, body.height)) {
    const top = Math.max(0, band.y0 - 6);
    const bottom = Math.min(body.height, band.y1 + 6);
    const img = await png(mask.subarray(top * body.width, bottom * body.width), body.width, bottom - top);
    const { data } = await w.recognize(img, {}, { blocks: true, text: true });
    const words = (data.blocks ?? [])
      .flatMap((b) => b.paragraphs.flatMap((p) => p.lines.flatMap((l) => l.words)))
      .map((wd) => ({ text: wd.text, bbox: { ...wd.bbox, y0: wd.bbox.y0 + top, y1: wd.bbox.y1 + top } }));
    if (words.length === 0) continue;
    lines.push({
      text: words.map((wd) => wd.text).join(" "),
      words,
      bbox: { x0: words[0].bbox.x0, x1: words[words.length - 1].bbox.x1, y0: band.y0 + 20, y1: band.y1 + 20 },
    });
  }

  const out: string[] = [];
  for (const line of lines) {
    const words = line.words;
    const valueIdx = words.findIndex((wd) => /\d/.test(wd.text));
    const nameIdx = words.findIndex((wd, i) => i > valueIdx && /^[A-Za-z]{2,}/.test(wd.text));
    if (valueIdx < 0 || nameIdx < 0) {
      out.push(line.text.trim());
      continue;
    }
    // The value is the last number-ish word before the attribute name (plus a
    // detached "+"); anything further left is the stat icon. Re-read just that box.
    let start = nameIdx - 1;
    while (start > 0 && !/\d/.test(words[start].text)) start--;
    if (start > 0 && /^[+#4]$/.test(words[start - 1].text)) start--;
    const boxes = words.slice(start, nameIdx).map((wd) => wd.bbox);
    const pad = 6;
    const x0 = Math.max(0, Math.min(...boxes.map((b) => b.x0)) - 20 - pad);
    const x1 = Math.min(body.width, Math.max(...boxes.map((b) => b.x1)) - 20 + pad);
    const y0 = Math.max(0, line.bbox.y0 - 20 - pad);
    const y1 = Math.min(body.height, line.bbox.y1 - 20 + pad);
    if (x1 <= x0 || y1 <= y0) {
      out.push(line.text.trim());
      continue;
    }
    const highlighted = orangeFraction(body, line.bbox.y0 - 20, line.bbox.y1 - 20) > 0.5;
    const reads = await readValue(w, body, { left: x0, top: y0, width: x1 - x0, height: y1 - y0 }, highlighted, line.bbox.y1 - line.bbox.y0);
    const name = words.slice(nameIdx).map((wd) => wd.text).join(" ");
    // "{read1|read2|...} Name": every reading goes to the parser, which votes.
    out.push(reads.length ? `{${reads.join("|")}} ${name}` : line.text.trim());
  }

  // Talent names are dim grey, which the mask drops. Re-read the row under "Talents"
  // at a few vertical offsets; the parser keeps the best reading.
  const talentsHeader = lines.find((l) => /^talents?$/i.test(l.text.replace(/[^A-Za-z]/g, "")));
  if (talentsHeader) {
    const at = out.findIndex((l) => /^talents?$/i.test(l.replace(/[^A-Za-z]/g, "")));
    for (const offset of [0.005, 0.015, 0.03]) {
      const top = talentsHeader.bbox.y1 - 20 + Math.round(body.height * offset);
      const rowHeight = Math.min(Math.round(body.height * 0.1), body.height - top);
      if (rowHeight <= 10) continue;
      // Skip the talent icon on the left; talent names fit in the left ~55% of the row.
      const row = () =>
        sharp(body.data, { raw: { width: body.width, height: body.height, channels: body.channels as 3 } })
          .extract({ left: Math.round(body.width * 0.07), top, width: Math.round(body.width * 0.55), height: rowHeight })
          .greyscale()
          .resize({ width: 1200 });
      await w.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE, tessedit_char_whitelist: "" });
      // The row background is a gradient: try local contrast + threshold, and plain contrast.
      const variants = [
        await row().clahe({ width: 64, height: 64, maxSlope: 6 }).negate().threshold(110).png().toBuffer(),
        await row().normalise().negate().png().toBuffer(),
      ];
      for (const img of variants) {
        if (process.env.OCR_DEBUG_DIR) {
          await sharp(img).toFile(join(process.env.OCR_DEBUG_DIR, `talent-${Date.now()}-${offset}.png`));
        }
        out.splice(at + 1, 0, (await w.recognize(img)).data.text.trim());
      }
    }
  }
  return out;
}

/**
 * Read a value box several ways (scale x orange threshold x page mode). The parser
 * takes the most common plausible number, so a single misread digit gets outvoted.
 * The colour crop is upscaled before masking: smoother glyph edges than
 * upscaling a blocky mask.
 */
async function readValue(w: Worker, body: Raw, box: Rect, highlighted: boolean, textHeight: number): Promise<string[]> {
  await w.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE, tessedit_char_whitelist: "+0123456789.,%HP/s" });
  const reads: string[] = [];
  for (const factor of [3, 4]) {
    const up = await raw(
      sharp(body.data, { raw: { width: body.width, height: body.height, channels: body.channels as 3 } })
        .extract(box)
        .resize({ width: box.width * factor, kernel: "lanczos3" }),
    );
    for (const minSat of [0.45, 0.55, 0.65, "rb"] as const) {
      const crop = textMask(up, highlighted, minSat);
      blankBarRows(crop, up.width, up.height, textHeight * factor);
      blankLeadingIcon(crop, up.width, up.height, textHeight * factor);
      const img = await png(crop, up.width, up.height);
      if (process.env.OCR_DEBUG_DIR) {
        await sharp(img).toFile(join(process.env.OCR_DEBUG_DIR, `value-${Date.now()}-${factor}-${minSat}.png`));
      }
      // Single-line mode sometimes splits wide-spaced digits ("+15.0%" -> "+1 0%"); block mode doesn't.
      for (const psm of [PSM.SINGLE_LINE, PSM.SINGLE_BLOCK]) {
        await w.setParameters({ tessedit_pageseg_mode: psm });
        reads.push((await w.recognize(img)).data.text.trim().replace(/\s+/g, ""));
      }
    }
  }
  await w.setParameters({ tessedit_pageseg_mode: PSM.AUTO, tessedit_char_whitelist: "" });
  // The parser counts the votes, since it knows which values are possible for the stat.
  return reads.filter((r) => /\d/.test(r));
}

/** Highlighted rows have solid bar lines above/below the text; they confuse OCR. */
function blankBarRows(crop: Buffer, width: number, height: number, textHeight: number) {
  // No glyph has a horizontal stroke longer than ~1.2x the text height; bars do.
  const longest = textHeight * 1.2;
  for (let y = 0; y < height; y++) {
    let runStart = -1;
    for (let x = 0; x <= width; x++) {
      const black = x < width && crop[y * width + x] === 0;
      if (black && runStart < 0) runStart = x;
      if (!black && runStart >= 0) {
        if (x - runStart > longest) crop.fill(255, y * width + runStart, y * width + x);
        runStart = -1;
      }
    }
  }
}

/**
 * Each value is preceded by a small coloured icon that OCR reads as "0" or "4".
 * If the first blob of ink is followed by a clear gap, it's the icon: blank it.
 */
function blankLeadingIcon(crop: Buffer, width: number, height: number, textHeight: number) {
  const ink = (x: number) => {
    for (let y = 0; y < height; y++) if (crop[y * width + x] === 0) return true;
    return false;
  };
  let x = 0;
  while (x < width && !ink(x)) x++;
  const start = x;
  while (x < width && ink(x)) x++;
  const end = x;
  while (x < width && !ink(x)) x++;
  const gap = x - end;
  if (x < width && gap >= textHeight * 0.3 && end - start <= textHeight * 1.6) {
    for (let y = 0; y < height; y++) crop.fill(255, y * width + start, y * width + end);
  }
}

async function readGrey(w: Worker, region: Sharp): Promise<string[]> {
  await w.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK, tessedit_char_whitelist: "" });
  const img = await region.greyscale().normalise().negate().resize({ width: 1200 }).png().toBuffer();
  const { data } = await w.recognize(img);
  return data.text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export interface OcrResult {
  item: ScannedItem;
  text: TooltipText;
}

/** Read an item screenshot. Only 16:9 PS5-style captures are cropped; others are rejected. */
export async function readItemScreenshot(image: Buffer): Promise<OcrResult> {
  const meta = await sharp(image).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  if (!W || !H || Math.abs(W / H - 16 / 9) > 0.05) {
    throw new Error("Automatic reading needs a full-screen 16:9 capture from the console.");
  }
  const cardRect = scale(CARD, W, H);
  const card = await sharp(image).extract(cardRect).toBuffer();
  const cw = cardRect.width;
  const ch = cardRect.height;
  const region = (r: Rect) => sharp(card).extract(scale(r, cw, ch));
  const bodyRect = { left: 0, top: BODY_TOP, width: 1, height: 1 - BODY_TOP };

  return serial(async () => {
    const w = await worker();
    const header = await readGrey(w, region(HEADER_TEXT));
    const stats = (await readGrey(w, region(HEADER_STATS))).join(" ");
    const body = await readBody(w, await raw(region(bodyRect)));
    const colourRarity = headerRarity(await raw(region(HEADER_SWATCH)), await raw(region(HEADER_TEXT)));
    const text: TooltipText = { header, body, isWeapon: /\b(DMG|RPM|MAG)\b/.test(stats), colourRarity };
    return { item: parseTooltip(text), text };
  });
}
