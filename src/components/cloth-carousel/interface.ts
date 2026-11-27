import type { TGalleryCard } from "@/constants/interface";
import type { SharedValue } from "react-native-reanimated";
import type {
  SkImage,
  SkPaint,
  SkRect,
  SkRuntimeEffect,
  SkShader,
} from "react-native-skia";

interface IClothCarousel {
  cards: TGalleryCard[];
  page: SharedValue<number>;
}

type TClothLayout = {
  key: string;
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  pitch: number;
  depth: number;
  count: number;
  total: number;
};

type TClothMesh = {
  n: number;
  u: Float32Array;
  v: Float32Array;
  edge: Float32Array;
  stiffness: Float32Array;
  rowSin: Float32Array;
  rowCos: Float32Array;
  colSin: Float32Array;
  colCos: Float32Array;
  colLift: Float32Array;
  corners: Uint16Array;
  grid: Float32Array;
  positions: Float32Array;
  texCoords: Float32Array;
};

type TClothCard = {
  off: Float32Array;
  vel: Float32Array;
  awake: number;
  folded: boolean;
  appear: number;
  readyAt: number;
  tilt: number;
  drop: number;
  seed: number;
  image: number;
  x: number;
  y: number;
};

type TClothTouch = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
};

type TClothForces = {
  width: number;
  height: number;
  vx: number;
  ax: number;
  t: number;
  seed: number;
  hx: number;
  hy: number;
  hf: number;
  hvx: number;
  hvy: number;
};

type TClothImages = (SkImage | null)[];

type TClothSim = {
  key: string;
  mesh: TClothMesh;
  cards: TClothCard[];
  scroll: number;
  scrollV: number;
  dragV: number;
  target: number;
  dragStart: number;
  dragging: boolean;
  vxSmooth: number;
  axSmooth: number;
  t: number;
  last: number;
  touch: TClothTouch;
  forces: TClothForces;
  images: TClothImages | null;
  imageShaders: (SkShader | null)[];
  shaders: (SkShader | null)[];
  foldUniforms: number[][];
  effect: SkRuntimeEffect | null;
  foldEffect: SkRuntimeEffect | null;
  shade: Uint8Array;
  light: number[];
  paint: SkPaint;
  rect: SkRect;
  clock: number;
  drawn: boolean;
};

export {
  type IClothCarousel,
  type TClothCard,
  type TClothForces,
  type TClothImages,
  type TClothLayout,
  type TClothMesh,
  type TClothSim,
  type TClothTouch,
};
