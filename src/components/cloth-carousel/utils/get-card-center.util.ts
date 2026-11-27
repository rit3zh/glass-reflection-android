import type { TClothLayout } from "../interface";

const getCardCenter = <T extends number>(
  index: T,
  scroll: number,
  layout: TClothLayout,
) => {
  "worklet";
  const span = layout.pitch * layout.total;
  const half = span / 2;
  const raw = index * layout.pitch - scroll + half;
  return layout.width / 2 + (((raw % span) + span) % span) - half;
};

export { getCardCenter };
