import type { TGlassReflectionOptions } from "../interface";

const GLASS_REFLECTION_OPTION_KEYS: readonly (keyof TGlassReflectionOptions)[] = [
  "intensity",
  "glow",
  "refraction",
  "rimWidth",
  "distance",
  "gap",
  "falloff",
  "shine",
  "shineWidth",
  "tiltShine",
  "shimmer",
  "shimmerDuration",
  "shimmerInterval",
  "sheen",
  "innerShine",
  "innerShineSpread",
  "blur",
  "reflectBelow",
  "baseRimColor",
  "saturation",
  "brightness",
  "fps",
  "captureMode",
];

export { GLASS_REFLECTION_OPTION_KEYS };
