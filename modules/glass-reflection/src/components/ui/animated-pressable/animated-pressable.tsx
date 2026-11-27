import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { registerComponent } from "../../../utils/register-component.util";

const AnimatedPressable = registerComponent(
  "AnimatedPressable",
  Animated.createAnimatedComponent(Pressable),
);

export { AnimatedPressable };
