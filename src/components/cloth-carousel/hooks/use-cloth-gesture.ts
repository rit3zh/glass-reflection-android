import {
  CLOTH_ACTIVE_OFFSET,
  CLOTH_FAIL_OFFSET,
  CLOTH_FLING,
  CLOTH_MAX_FLING_VELOCITY,
  CLOTH_TOUCH_MAX_SPEED,
  CLOTH_TOUCH_POKE,
} from "@/constants/components/cloth-carousel.const";
import { usePanGesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import type { TClothSim } from "../interface";
import { snapClothTarget } from "../utils/get-cloth-page.util";

const useClothGesture = <T extends number>(
  sim: SharedValue<TClothSim | null>,
  pitch: T,
) =>
  usePanGesture({
    activeOffsetX: [-CLOTH_ACTIVE_OFFSET, CLOTH_ACTIVE_OFFSET],
    failOffsetY: [-CLOTH_FAIL_OFFSET, CLOTH_FAIL_OFFSET],
    onBegin: (event) => {
      "worklet";
      const current = sim.get();
      if (!current) return;
      const { touch } = current;
      touch.active = true;
      touch.x = event.x;
      touch.y = event.y;
      touch.vx = 0;
      touch.vy = 0;
      touch.speed = Math.max(touch.speed, CLOTH_TOUCH_POKE);
    },
    onActivate: (event) => {
      "worklet";
      const current = sim.get();
      if (!current) return;
      current.dragging = true;
      current.target = current.scroll;
      current.dragStart = current.scroll + event.translationX;
    },
    onUpdate: (event) => {
      "worklet";
      const current = sim.get();
      if (!current) return;
      const { touch } = current;
      const speed = Math.hypot(event.velocityX, event.velocityY);
      const limit =
        speed > CLOTH_TOUCH_MAX_SPEED ? CLOTH_TOUCH_MAX_SPEED / speed : 1;
      touch.x = event.x;
      touch.y = event.y;
      touch.vx = event.velocityX * limit;
      touch.vy = event.velocityY * limit;
      touch.speed = Math.max(touch.speed, speed * limit);
      if (current.dragging)
        current.target = current.dragStart - event.translationX;
    },
    onDeactivate: (event) => {
      "worklet";
      const current = sim.get();
      if (!current) return;
      const velocity = Math.max(
        -CLOTH_MAX_FLING_VELOCITY,
        Math.min(CLOTH_MAX_FLING_VELOCITY, event.velocityX),
      );
      current.dragging = false;
      current.target = snapClothTarget(
        current.target - velocity * CLOTH_FLING,
        pitch,
      );
    },
    onFinalize: () => {
      "worklet";
      const current = sim.get();
      if (!current) return;
      current.touch.active = false;
      if (!current.dragging) return;
      current.dragging = false;
      current.target = snapClothTarget(current.target, pitch);
    },
  });

export { useClothGesture };
