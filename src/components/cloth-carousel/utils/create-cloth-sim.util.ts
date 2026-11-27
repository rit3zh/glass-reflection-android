import {
  CLOTH_EDGE_MARGIN,
  CLOTH_FOLD_SHADER_SOURCE,
  CLOTH_LIGHT,
  CLOTH_REST_DROP,
  CLOTH_REST_TILT,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_SHADER_SOURCE,
} from "@/constants/components/cloth-carousel.const";
import { Skia } from "react-native-skia";
import type { TClothCard, TClothLayout, TClothSim } from "../interface";
import { createClothMesh } from "./create-cloth-mesh.util";

const createClothSim = (layout: TClothLayout) => {
  "worklet";
  const mesh = createClothMesh(layout.cardWidth, layout.cardHeight);
  const cards: TClothCard[] = [];
  for (let i = 0; i < layout.total; i++) {
    cards.push({
      off: new Float32Array(mesh.n * 3),
      vel: new Float32Array(mesh.n * 3),
      awake: 0,
      folded: false,
      appear: 0,
      readyAt: -1,
      tilt: CLOTH_REST_TILT[i % CLOTH_REST_TILT.length],
      drop: CLOTH_REST_DROP[i % CLOTH_REST_DROP.length],
      seed: i * 1.7,
      image: i % layout.count,
      x: 0,
      y: 0,
    });
  }

  const shade = new Uint8Array((CLOTH_SEG_X + 1) * (CLOTH_SEG_Y + 1) * layout.total * 4);
  shade.fill(255);
  const lightLength = Math.hypot(CLOTH_LIGHT[0], CLOTH_LIGHT[1], CLOTH_LIGHT[2]);

  const sim: TClothSim = {
    key: layout.key,
    mesh,
    cards,
    scroll: 0,
    scrollV: 0,
    dragV: 0,
    target: 0,
    dragStart: 0,
    dragging: false,
    vxSmooth: 0,
    axSmooth: 0,
    t: 0,
    last: -1,
    touch: { active: false, x: 0, y: 0, vx: 0, vy: 0, speed: 0 },
    forces: { width: 0, height: 0, vx: 0, ax: 0, t: 0, seed: 0, hx: 0, hy: 0, hf: 0, hvx: 0, hvy: 0 },
    images: null,
    imageShaders: [],
    shaders: [],
    foldUniforms: [],
    effect: Skia.RuntimeEffect.Make(CLOTH_SHADER_SOURCE),
    foldEffect: Skia.RuntimeEffect.Make(CLOTH_FOLD_SHADER_SOURCE),
    shade,
    light: [
      CLOTH_LIGHT[0] / lightLength,
      CLOTH_LIGHT[1] / lightLength,
      CLOTH_LIGHT[2] / lightLength,
    ],
    paint: Skia.Paint(),
    rect: Skia.XYWHRect(
      -CLOTH_EDGE_MARGIN,
      -CLOTH_EDGE_MARGIN,
      layout.cardWidth + CLOTH_EDGE_MARGIN * 2,
      layout.cardHeight + CLOTH_EDGE_MARGIN * 2,
    ),
    clock: 0,
    drawn: false,
  };
  return sim;
};

export { createClothSim };
