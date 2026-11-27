import type { ColorValue } from "react-native";
type TGlassCaptureMode = "layer" | "hierarchy";

type TGlassReflectionOptions = {
  intensity?: number;
  glow?: number;
  refraction?: number;
  rimWidth?: number;
  distance?: number;
  gap?: number;
  falloff?: number;
  shine?: number;
  shineWidth?: number;
  tiltShine?: boolean;
  shimmer?: number;
  shimmerDuration?: number;
  shimmerInterval?: number;
  sheen?: number;
  innerShine?: number;
  innerShineSpread?: number;
  blur?: number;
  reflectBelow?: boolean;
  baseRimColor?: ColorValue;
  saturation?: number;
  brightness?: number;
  fps?: number;
  captureMode?: TGlassCaptureMode;
};

type TGlassReflectionRef = {
  refresh: () => Promise<void>;
};

export {
  type TGlassCaptureMode,
  type TGlassReflectionOptions,
  type TGlassReflectionRef,
};
