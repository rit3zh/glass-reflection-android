import type { ColorValue, ViewProps } from "react-native";

import type { TGlassReflectionOptions, TGlassReflectionRef } from "../../interface";

interface IGlassReflection extends ViewProps, TGlassReflectionOptions {
  ref?: React.Ref<TGlassReflectionRef>;
}

interface IGlassReflectionFallback extends ViewProps {
  radius: number;
  rimWidth: number;
  rimColor: ColorValue;
}

export { type IGlassReflection, type IGlassReflectionFallback };
