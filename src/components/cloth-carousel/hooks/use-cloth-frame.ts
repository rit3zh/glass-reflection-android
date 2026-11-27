import { useState } from "react";
import {
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { SkPicture } from "react-native-skia";
import type { TClothImages, TClothLayout, TClothSim } from "../interface";
import { advanceCloth } from "../utils/advance-cloth.util";
import { createClothSim } from "../utils/create-cloth-sim.util";
import { getClothPage } from "../utils/get-cloth-page.util";
import { createEmptyPicture, recordCloth } from "../utils/record-cloth.util";

const useClothFrame = (
  layout: TClothLayout,
  images: SharedValue<TClothImages>,
  page: SharedValue<number>,
) => {
  const [empty] = useState<SkPicture>(createEmptyPicture);
  const picture = useSharedValue(empty);
  const sim = useSharedValue<TClothSim | null>(null);

  useFrameCallback((info) => {
    "worklet";
    let current = sim.get();
    if (!current || current.key !== layout.key) {
      current = createClothSim(layout);
      sim.set(current);
    }
    if (!advanceCloth(current, layout, images.get(), info.timestamp / 1000))
      return;
    picture.set(recordCloth(current, layout));
    const nextPage = getClothPage(current.scroll, layout);
    if (nextPage !== page.get()) page.set(nextPage);
  });

  return { picture, sim };
};

export { useClothFrame };
