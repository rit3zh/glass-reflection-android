import { CAROUSEL_RUBBER_BAND } from "@/constants/components/card-carousel.const";

const rubberBand = (distance: number, dimension: number) => {
  "worklet";
  return (1 - 1 / ((distance * CAROUSEL_RUBBER_BAND) / dimension + 1)) * dimension;
};

const applyRubberBand = (value: number, min: number, max: number, dimension: number) => {
  "worklet";
  if (value > max) return max + rubberBand(value - max, dimension);
  if (value < min) return min - rubberBand(min - value, dimension);
  return value;
};

export { applyRubberBand };
