import type { FC } from "react";
import { StyleSheet } from "react-native";
import {
  GLASS_REFLECTION_CAPSULE_RADIUS,
  GLASS_REFLECTION_DEFAULT_RIM_COLOR,
  GLASS_REFLECTION_DEFAULT_RIM_WIDTH,
} from "../../constants/components/glass-reflection.const";
import { useGlassReflectionDefaults } from "../../hooks/use-glass-reflection-defaults";
import { NativeGlassReflectionView } from "../../native/native-glass-reflection";
import { getBorderRadius } from "../../utils/get-border-radius.util";
import { registerComponent } from "../../utils/register-component.util";
import { splitGlassReflectionOptions } from "../../utils/split-glass-reflection-options.util";
import { GlassReflectionFallback } from "./glass-reflection-fallback";
import type { IGlassReflection } from "./interface";
import { stripUndefined } from "./utils/strip-undefined.util";

const GlassReflectionBase: FC<IGlassReflection> = ({
  style,
  children,
  ref,
  ...props
}: IGlassReflection &
  React.ComponentProps<typeof GlassReflectionBase>): React.ReactNode &
  React.JSX.Element => {
  const defaults = useGlassReflectionDefaults();
  const { options: own, rest: viewProps } = splitGlassReflectionOptions(props);
  const options = { ...defaults, ...stripUndefined(own) };
  const radius = getBorderRadius(style) ?? GLASS_REFLECTION_CAPSULE_RADIUS;

  if (!NativeGlassReflectionView) {
    return (
      <GlassReflectionFallback
        {...viewProps}
        radius={radius}
        rimWidth={options.rimWidth ?? GLASS_REFLECTION_DEFAULT_RIM_WIDTH}
        rimColor={options.baseRimColor ?? GLASS_REFLECTION_DEFAULT_RIM_COLOR}
        style={style}
      >
        {children}
      </GlassReflectionFallback>
    );
  }

  return (
    <NativeGlassReflectionView
      {...viewProps}
      {...options}
      ref={ref}
      cornerRadius={radius}
      style={[styles.clip, { borderRadius: radius }, style]}
    >
      {children}
    </NativeGlassReflectionView>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
});

const GlassReflection = registerComponent(
  "GlassReflection",
  GlassReflectionBase,
);

export { GlassReflection };
