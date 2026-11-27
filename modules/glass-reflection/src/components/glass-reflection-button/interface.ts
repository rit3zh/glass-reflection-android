import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";
import type {
  TGlassReflectionOptions,
  TGlassReflectionRef,
} from "../../interface";

interface IGlassReflectionButton
  extends
    Omit<PressableProps, "children" | "style" | "ref">,
    TGlassReflectionOptions {
  title?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  pressedScale?: number;
  ref?: React.Ref<TGlassReflectionRef>;
}

export { type IGlassReflectionButton };
