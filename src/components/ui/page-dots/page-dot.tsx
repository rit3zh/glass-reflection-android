import {
  PAGE_DOTS_ACTIVE_OPACITY,
  PAGE_DOTS_INACTIVE_OPACITY,
  PAGE_DOTS_SIZE,
} from "@/constants/components/page-dots.const";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { IPageDot } from "./interface";

const PageDotBase: FC<IPageDot> = ({
  index,
  page,
}: IPageDot & React.ComponentProps<typeof PageDotBase>): React.ReactNode &
  React.JSX.Element => {
  const style = useAnimatedStyle(() => {
    const active = Math.max(0, 1 - Math.abs(page.get() - index));
    return {
      opacity:
        PAGE_DOTS_INACTIVE_OPACITY +
        (PAGE_DOTS_ACTIVE_OPACITY - PAGE_DOTS_INACTIVE_OPACITY) * active,
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: PAGE_DOTS_SIZE,
    height: PAGE_DOTS_SIZE,
    borderRadius: PAGE_DOTS_SIZE / 2,
    backgroundColor: "white",
  },
});

const PageDot = registerComponent("PageDot", PageDotBase);

export { PageDot };
