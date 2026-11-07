import { DataTexture, RepeatWrapping, RGBAFormat, SRGBColorSpace } from "three";

/** Deterministic original micrograin. No photos, external textures, or model downloads. */
export function createPencilSurface(wood = false) {
  const width = 128,
    height = 256,
    data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const grain =
        Math.sin(x * 0.8 + Math.sin(y * 0.045) * 0.8) * 0.5 +
        Math.sin(x * 2.7 + y * 0.009) * 0.25;
      const noise =
        (((Math.imul(x + 19, y + 71) * 15485863) >>> 0) % 101) / 100 - 0.5;
      const offset = (y * width + x) * 4;
      if (wood) {
        data[offset] = 194 + grain * 13 + noise * 3;
        data[offset + 1] = 145 + grain * 12 + noise * 3;
        data[offset + 2] = 94 + grain * 9 + noise * 2;
      } else {
        const value = 210 + grain * 9 + noise * 4;
        data[offset] = value;
        data[offset + 1] = value;
        data[offset + 2] = value;
      }
      data[offset + 3] = 255;
    }
  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  if (wood) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
