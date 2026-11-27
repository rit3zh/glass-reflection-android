import type { FC } from "react";
import { StyleSheet, Text, type GestureResponderEvent } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  GLASS_REFLECTION_BUTTON_PRESSED_SCALE,
  GLASS_REFLECTION_BUTTON_RESTING_SCALE,
  GLASS_REFLECTION_BUTTON_SPRING,
} from "../../constants/components/glass-reflection-button.const";
import { getBorderRadius } from "../../utils/get-border-radius.util";
import { registerComponent } from "../../utils/register-component.util";
import { splitGlassReflectionOptions } from "../../utils/split-glass-reflection-options.util";
import { GlassReflection } from "../glass-reflection";
import { AnimatedPressable } from "../ui/animated-pressable";
import type { IGlassReflectionButton } from "./interface";

const GlassReflectionButtonBase: FC<IGlassReflectionButton> = ({
  title,
  children,
  style,
  contentStyle,
  titleStyle,
  pressedScale = GLASS_REFLECTION_BUTTON_PRESSED_SCALE,
  ref,
  onPressIn,
  onPressOut,
  ...props
}: IGlassReflectionButton &
  React.ComponentProps<typeof GlassReflectionButtonBase>): React.ReactNode &
  React.JSX.Element => {
  const { options, rest: pressableProps } = splitGlassReflectionOptions(props);
  const scale = useSharedValue(GLASS_REFLECTION_BUTTON_RESTING_SCALE);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  const radius = getBorderRadius(style);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...pressableProps}
      onPressIn={(event: GestureResponderEvent) => {
        scale.set(withSpring(pressedScale, GLASS_REFLECTION_BUTTON_SPRING));
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        scale.set(
          withSpring(
            GLASS_REFLECTION_BUTTON_RESTING_SCALE,
            GLASS_REFLECTION_BUTTON_SPRING,
          ),
        );
        onPressOut?.(event);
      }}
      style={[styles.button, style, animatedStyle]}
    >
      <GlassReflection
        {...options}
        ref={ref}
        style={[
          styles.surface,
          radius !== undefined && { borderRadius: radius },
          contentStyle,
        ]}
      >
        {children ??
          (title != null ? (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          ) : null)}
      </GlassReflection>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    boxShadow:
      "0px 10px 28px rgba(0, 0, 0, 0.45), 0px 2px 6px rgba(0, 0, 0, 0.35)",
  },
  surface: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#161618",
  },
  title: {
    color: "white",
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});

const GlassReflectionButton = registerComponent(
  "GlassReflectionButton",
  GlassReflectionButtonBase,
);

export { GlassReflectionButton };
