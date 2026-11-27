import {
  CLOTH_CARD_RADIUS,
  CLOTH_EDGE_MARGIN,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_SHADE_MAX,
  CLOTH_SHADE_MIN,
} from "@/constants/components/cloth-carousel.const";
import { FilterMode, MipmapMode, TileMode, type SkShader } from "react-native-skia";
import type { TClothImages, TClothLayout, TClothSim } from "../interface";

const getCrop = (width: number, height: number, aspect: number) => {
  "worklet";
  const wide = width / height > aspect;
  const cropWidth = wide ? height * aspect : width;
  const cropHeight = wide ? height : width / aspect;
  return [(width - cropWidth) / 2, (height - cropHeight) / 2, cropWidth, cropHeight];
};

const updateClothShaders = (sim: TClothSim, images: TClothImages, layout: TClothLayout) => {
  "worklet";
  const { cardWidth, cardHeight } = layout;
  const crops = images.map((image) =>
    image ? getCrop(image.width(), image.height(), cardWidth / cardHeight) : null,
  );
  sim.images = images;
  sim.imageShaders = images.map((image): SkShader | null =>
    image
      ? image.makeShaderOptions(TileMode.Clamp, TileMode.Clamp, FilterMode.Linear, MipmapMode.Linear)
      : null,
  );
  sim.shaders = sim.imageShaders.map((child, index): SkShader | null => {
    const crop = crops[index];
    if (!sim.effect || !child || !crop) return null;
    return sim.effect.makeShaderWithChildren(
      [cardWidth, cardHeight, ...crop, CLOTH_CARD_RADIUS],
      [child],
    );
  });
  sim.foldUniforms = sim.cards.map((card, index) => [
    cardWidth,
    cardHeight,
    ...(crops[card.image] ?? [0, 0, 1, 1]),
    CLOTH_CARD_RADIUS,
    CLOTH_SEG_X,
    CLOTH_SEG_Y,
    cardWidth + CLOTH_EDGE_MARGIN * 2,
    cardHeight + CLOTH_EDGE_MARGIN * 2,
    CLOTH_EDGE_MARGIN,
    index * (CLOTH_SEG_Y + 1),
    CLOTH_SHADE_MIN,
    CLOTH_SHADE_MAX - CLOTH_SHADE_MIN,
  ]);
};

export { updateClothShaders };
