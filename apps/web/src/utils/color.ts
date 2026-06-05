export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match || !match[1]) return null;
  const hexValue = parseInt(match[1], 16);
  return [(hexValue >> 16) & 255, (hexValue >> 8) & 255, hexValue & 255];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255,
    gg = g / 255,
    bb = b / 255;
  const max = Math.max(rr, gg, bb),
    min = Math.min(rr, gg, bb);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const delta = max - min;
    if (max === rr) h = ((gg - bb) / delta + (gg < bb ? 6 : 0)) / 6;
    else if (max === gg) h = ((bb - rr) / delta + 2) / 6;
    else h = ((rr - gg) / delta + 4) / 6;
  }
  return [h * 360, s, v];
}

export function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

export function hexFromHsv(h: number, s: number, v: number): string {
  return rgbToHex(...hsvToRgb(h, s, v));
}
