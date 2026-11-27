import {
  CLOTH_APPEAR_RISE,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_VISIBLE_MARGIN,
} from "@/constants/components/cloth-carousel.const";
import {
  AlphaType,
  ColorType,
  FilterMode,
  MipmapMode,
  Skia,
  TileMode,
  type SkShader,
} from "react-native-skia";
import type { TClothLayout, TClothSim } from "../interface";
import { drawFlatCard, drawFoldedCard, writeClothShade } from "./draw-cloth-card.util";

const createShadeShader = (sim: TClothSim, total: number) => {
  "worklet";
  const width = CLOTH_SEG_X + 1;
  const image = Skia.Image.MakeRaster(
    {
      width,
      height: (CLOTH_SEG_Y + 1) * total,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Opaque,
    },
    Skia.Data.fromBytes(sim.shade),
    width * 4,
  );
  return image
    ? image.makeShaderOptions(TileMode.Clamp, TileMode.Clamp, FilterMode.Linear, MipmapMode.None)
    : null;
};

const recordCloth = (sim: TClothSim, layout: TClothLayout) => {
  "worklet";
  const { cards } = sim;
  const reach = layout.width / 2 + layout.cardWidth * CLOTH_VISIBLE_MARGIN;
  let folds = false;
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];
    card.folded =
      card.awake > 0 &&
      card.appear > 0 &&
      !!sim.shaders[card.image] &&
      Math.abs(card.x - layout.width / 2) < reach;
    if (!card.folded) continue;
    writeClothShade(sim, card, index, layout);
    folds = true;
  }
  const shade: SkShader | null = folds ? createShadeShader(sim, cards.length) : null;

  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, layout.width, layout.height));
  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];
    const flat = sim.shaders[card.image];
    if (!flat || card.appear <= 0 || Math.abs(card.x - layout.width / 2) >= reach) continue;
    const ease = 1 - Math.pow(1 - card.appear, 3);
    const y = card.y - (1 - ease) * layout.cardHeight * CLOTH_APPEAR_RISE;
    const child = sim.imageShaders[card.image];
    if (card.folded && shade && child && sim.foldEffect) {
      const folded = sim.foldEffect.makeShaderWithChildren(sim.foldUniforms[index], [child, shade]);
      drawFoldedCard(canvas, sim, card, layout, folded, ease, y);
    } else {
      drawFlatCard(canvas, sim, card, layout, flat, ease, y);
    }
  }
  sim.drawn = true;
  return recorder.finishRecordingAsPicture();
};

const createEmptyPicture = () => {
  const recorder = Skia.PictureRecorder();
  recorder.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
  return recorder.finishRecordingAsPicture();
};

export { createEmptyPicture, recordCloth };
