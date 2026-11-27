import { PAGE_TITLE_SWITCH_THRESHOLD } from "@/constants/components/page-title.const";
import { useState } from "react";
import { useAnimatedReaction, useSharedValue, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { TActivePage } from "../interface";

const useActivePage = (page: SharedValue<number>, count: number) => {
  const [active, setActive] = useState<TActivePage>({ index: 0, direction: "up" });
  const current = useSharedValue(0);

  const select = (next: number) =>
    setActive((previous) =>
      previous.index === next
        ? previous
        : { index: next, direction: next > previous.index ? "up" : "down" },
    );

  useAnimatedReaction(
    () => page.get(),
    (value) => {
      if (Math.abs(value - current.get()) < PAGE_TITLE_SWITCH_THRESHOLD) return;
      const next = Math.min(count - 1, Math.max(0, Math.round(value)));
      if (next === current.get()) return;
      current.set(next);
      scheduleOnRN(select, next);
    },
  );

  return active;
};

export { useActivePage };
