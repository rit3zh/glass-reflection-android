import {
  CAROUSEL_DECELERATION_RATE,
  CAROUSEL_FLICK_VELOCITY,
} from "@/constants/components/card-carousel.const";

const getSnapPage = (
  offset: number,
  velocity: number,
  startPage: number,
  interval: number,
  count: number,
) => {
  "worklet";
  const projected =
    offset + ((velocity / 1000) * CAROUSEL_DECELERATION_RATE) / (1 - CAROUSEL_DECELERATION_RATE);
  let target = Math.round(-projected / interval);
  if (target === startPage && Math.abs(velocity) > CAROUSEL_FLICK_VELOCITY) {
    target = startPage - Math.sign(velocity);
  }
  const limited = Math.min(startPage + 1, Math.max(startPage - 1, target));
  return Math.min(count - 1, Math.max(0, limited));
};

export { getSnapPage };
