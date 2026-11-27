import type { TClothLayout } from "../interface";

const getClothPage = (scroll: number, layout: TClothLayout) => {
  "worklet";
  const raw = scroll / layout.pitch;
  const nearest = Math.round(raw);
  const index = ((nearest % layout.count) + layout.count) % layout.count;
  return index + raw - nearest;
};

const snapClothTarget = (target: number, pitch: number) => {
  "worklet";
  return Math.round(target / pitch) * pitch;
};

export { getClothPage, snapClothTarget };
