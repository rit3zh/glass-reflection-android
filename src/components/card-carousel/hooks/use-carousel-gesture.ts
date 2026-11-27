import { CAROUSEL_ACTIVE_OFFSET, CAROUSEL_FAIL_OFFSET, CAROUSEL_SPRING } from "@/constants/components/card-carousel.const";
import { usePanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { applyRubberBand } from "../utils/apply-rubber-band.util";
import { getSnapPage } from "../utils/get-snap-page.util";

const useCarouselGesture = (page: SharedValue<number>, count: number, interval: number) => {
  const offset = useSharedValue(0);
  const start = useSharedValue(0);
  const startPage = useSharedValue(0);
  const settled = useSharedValue(true);
  const lastOffset = -(count - 1) * interval;

  useAnimatedReaction(
    () => offset.get(),
    (value) => page.set(-value / interval),
  );

  const gesture = usePanGesture({
    activeOffsetX: [-CAROUSEL_ACTIVE_OFFSET, CAROUSEL_ACTIVE_OFFSET],
    failOffsetY: [-CAROUSEL_FAIL_OFFSET, CAROUSEL_FAIL_OFFSET],
    onBegin: () => {
      "worklet";
      cancelAnimation(offset);
      settled.set(false);
    },
    onActivate: (event) => {
      "worklet";
      start.set(offset.get() - event.translationX);
      startPage.set(Math.round(-offset.get() / interval));
    },
    onUpdate: (event) => {
      "worklet";
      offset.set(applyRubberBand(start.get() + event.translationX, lastOffset, 0, interval));
    },
    onDeactivate: (event) => {
      "worklet";
      const target = getSnapPage(offset.get(), event.velocityX, startPage.get(), interval, count);
      settled.set(true);
      offset.set(withSpring(-target * interval, { ...CAROUSEL_SPRING, velocity: event.velocityX }));
    },
    onFinalize: () => {
      "worklet";
      if (settled.get()) return;
      settled.set(true);
      const nearest = Math.min(count - 1, Math.max(0, Math.round(-offset.get() / interval)));
      offset.set(withSpring(-nearest * interval, CAROUSEL_SPRING));
    },
  });

  return { gesture, offset };
};

export { useCarouselGesture };
