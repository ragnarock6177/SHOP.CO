export function normalizeHex(hex: string): string {
  const raw = hex.trim().replace(/^#/, "");
  if (raw.length === 3) {
    return raw.split("").map((char) => char + char).join("");
  }
  return raw.slice(0, 6);
}

/** True for white, cream, and other pale swatches that need a visible edge on light backgrounds. */
export function isLightColor(hex: string): boolean {
  const normalized = normalizeHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    const lower = hex.toLowerCase();
    return lower.includes("white") || lower === "#fff" || lower === "#ffffff";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.72;
}
