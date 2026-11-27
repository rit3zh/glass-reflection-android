import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import { registerComponent } from "../../utils/register-component.util";
import type { IGlassReflectionFallback } from "./interface";

const GlassReflectionFallbackBase: FC<IGlassReflectionFallback> = ({
  radius,
  rimWidth,
  rimColor,
  style,
  children,
  ...props
}: IGlassReflectionFallback &
  React.ComponentProps<typeof GlassReflectionFallbackBase>): React.ReactNode &
  React.JSX.Element => (
  <View
    {...props}
    style={[
      styles.clip,
      { borderRadius: radius, borderWidth: rimWidth, borderColor: rimColor },
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
});

const GlassReflectionFallback = registerComponent(
  "GlassReflectionFallback",
  GlassReflectionFallbackBase,
);

export { GlassReflectionFallback };
