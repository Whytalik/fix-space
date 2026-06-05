export function hsvToRgb(hue: number, saturation: number, value: number): [number, number, number] {
  const getComponent = (n: number) => {
    const k = (n + hue / 60) % 6;
    return value - value * saturation * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [Math.round(getComponent(5) * 255), Math.round(getComponent(3) * 255), Math.round(getComponent(1) * 255)];
}

export function rgbToHex(red: number, green: number, blue: number): string {
  return "#" + [red, green, blue].map((component) => component.toString(16).padStart(2, "0")).join("");
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match || !match[1]) return null;
  const hexValue = parseInt(match[1], 16);
  return [(hexValue >> 16) & 255, (hexValue >> 8) & 255, hexValue & 255];
}

export function rgbToHsv(red: number, green: number, blue: number): [number, number, number] {
  const normalizedRed = red / 255,
    normalizedGreen = green / 255,
    normalizedBlue = blue / 255;
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue),
    min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);
  const value = max;
  const saturation = max === 0 ? 0 : (max - min) / max;
  let hue = 0;
  if (max !== min) {
    const delta = max - min;
    if (max === normalizedRed) hue = ((normalizedGreen - normalizedBlue) / delta + (normalizedGreen < normalizedBlue ? 6 : 0)) / 6;
    else if (max === normalizedGreen) hue = ((normalizedBlue - normalizedRed) / delta + 2) / 6;
    else hue = ((normalizedRed - normalizedGreen) / delta + 4) / 6;
  }
  return [hue * 360, saturation, value];
}

export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function hexFromHsv(hue: number, saturation: number, value: number): string {
  return rgbToHex(...hsvToRgb(hue, saturation, value));
}
