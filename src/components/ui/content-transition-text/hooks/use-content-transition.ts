import { CONTENT_TRANSITION_ANCHORS } from "@/constants/components/content-transition-text.const";
import { useEffect, useRef } from "react";
import { Easing, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useFont } from "react-native-skia";
import type {
  TCanvasSize,
  TContentTransitionAlignment,
  TContentTransitionConfig,
  TContentTransitionDirection,
  TContentTransitionTypography,
  TLineLayout,
  TTransitionPlan,
} from "../interface";
import { buildStaticPlan, buildTransitionPlan } from "../utils/build-transition-plan.util";
import { layoutLine } from "../utils/layout-line.util";
import { recordTransition } from "../utils/record-transition.util";

const useContentTransition = (
  value: string,
  typography: TContentTransitionTypography,
  transition: TContentTransitionConfig,
  direction: TContentTransitionDirection,
  alignment: TContentTransitionAlignment,
) => {
  const font = useFont(typography.font, typography.fontSize);
  const plan = useSharedValue<TTransitionPlan | null>(null);
  const clock = useSharedValue(0);
  const size = useSharedValue<TCanvasSize>({ width: 0, height: 0 });
  const line = useRef<TLineLayout | null>(null);
  const { color, fontSize, letterSpacing = 0 } = typography;

  useEffect(() => {
    if (!font) return;
    const anchor = CONTENT_TRANSITION_ANCHORS[alignment];
    const context = { font, color, fontSize, anchor, config: transition };
    const next = layoutLine(font, value, letterSpacing, anchor);
    const previous = line.current;
    line.current = next;

    if (!previous || previous.text === next.text) {
      plan.set(buildStaticPlan(context, next));
      clock.set(0);
      return;
    }

    const upcoming = buildTransitionPlan(context, previous, next, direction);
    plan.set(upcoming);
    clock.set(0);
    clock.set(
      withTiming(upcoming.total, { duration: upcoming.total * 1000, easing: Easing.linear }),
    );
  }, [font, value, color, fontSize, letterSpacing, alignment, direction, transition, plan, clock]);

  const picture = useDerivedValue(() => recordTransition(plan.get(), clock.get(), size.get()));

  return { picture, size };
};

export { useContentTransition };
