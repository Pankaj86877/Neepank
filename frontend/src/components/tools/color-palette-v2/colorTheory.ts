export function hexToHsl(hex: string): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    h /= 360;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function generateComplementary(baseHex: string, count: number): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const compH = (h + 180) % 360;
  const colors = [baseHex];
  for (let i = 1; i < count; i++) {
    // Generate variations between base and complementary
    const blendH = i % 2 === 0 ? h : compH;
    const lVariation = Math.max(10, Math.min(90, l + (i * 15 * (i % 2 === 0 ? 1 : -1))));
    colors.push(hslToHex(blendH, s, lVariation));
  }
  return colors;
}

export function generateAnalogous(baseHex: string, count: number): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const colors = [baseHex];
  for (let i = 1; i < count; i++) {
    const newH = (h + (i * 30)) % 360;
    colors.push(hslToHex(newH, s, l));
  }
  return colors;
}

export function generateMonochromatic(baseHex: string, count: number): string[] {
  const [h, s, l] = hexToHsl(baseHex);
  const colors = [];
  const step = 80 / count;
  for (let i = 0; i < count; i++) {
    colors.push(hslToHex(h, s, 10 + (i * step)));
  }
  return colors;
}
