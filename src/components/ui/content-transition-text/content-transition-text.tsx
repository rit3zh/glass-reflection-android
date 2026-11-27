import {
  CONTENT_TRANSITION_BLUR_SPREAD,
  CONTENT_TRANSITION_LINE_HEIGHT,
} from "@/constants/components/content-transition-text.const";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, Picture } from "react-native-skia";
import { useContentTransition } from "./hooks/use-content-transition";
import type { IContentTransitionText } from "./interface";

const ContentTransitionTextBase: FC<IContentTransitionText> = ({
  value,
  typography,
  transition,
  direction = "up",
  alignment = "center",
  style,
}: IContentTransitionText &
  React.ComponentProps<typeof ContentTransitionTextBase>): React.ReactNode &
  React.JSX.Element => {
  const { picture, size } = useContentTransition(
    value,
    typography,
    transition,
    direction,
    alignment,
  );
  const bleed = Math.ceil(
    typography.fontSize * transition.travel +
      (transition.blur + transition.blurPulse) * CONTENT_TRANSITION_BLUR_SPREAD,
  );

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={value}
      pointerEvents="none"
      style={[{ height: Math.ceil(typography.fontSize * CONTENT_TRANSITION_LINE_HEIGHT) }, style]}
      onLayout={({ nativeEvent }) =>
        size.set({ width: nativeEvent.layout.width, height: nativeEvent.layout.height + bleed * 2 })
      }
    >
      <View style={[styles.canvas, { top: -bleed, bottom: -bleed }]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={picture} />
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});

const ContentTransitionText = registerComponent(
  "ContentTransitionText",
  ContentTransitionTextBase,
);

export { ContentTransitionText };
