import {
  CLOTH_APPEAR_DURATION,
  CLOTH_APPEAR_STAGGER,
  CLOTH_AWAKE_THRESHOLD,
  CLOTH_DRAG_SMOOTHING,
  CLOTH_HIGH_REFRESH,
  CLOTH_MAX_FRAME,
  CLOTH_MOVING_ACCEL,
  CLOTH_MOVING_SPEED,
  CLOTH_SETTLE_EPSILON,
  CLOTH_SPRING_FREE,
  CLOTH_STEP_DT,
  CLOTH_TOUCH_DECAY,
  CLOTH_TOUCH_MIN_SPEED,
  CLOTH_TOUCH_REACH,
  CLOTH_TOUCH_RIPPLE,
  CLOTH_VISIBLE_MARGIN,
} from "@/constants/components/cloth-carousel.const";
import type { TClothCard, TClothImages, TClothLayout, TClothSim } from "../interface";
import { getCardCenter } from "./get-card-center.util";
import { kickCloth } from "./kick-cloth.util";
import { settleCloth, stepCloth } from "./step-cloth.util";
import { updateClothShaders } from "./update-cloth-shaders.util";

const advanceScroll = (sim: TClothSim, frame: number) => {
  "worklet";
  const previous = sim.scrollV;
  const start = sim.scroll;
  if (sim.dragging) {
    sim.scroll = sim.target;
    const raw = frame > 0 ? (sim.scroll - start) / frame : 0;
    sim.scrollV += (raw - sim.scrollV) * Math.min(1, frame * CLOTH_DRAG_SMOOTHING);
  } else {
    const omega = CLOTH_SPRING_FREE;
    const steps = Math.max(1, Math.ceil(frame / (CLOTH_STEP_DT / 2)));
    const dt = frame / steps;
    for (let s = 0; s < steps; s++) {
      const accel = omega * omega * (sim.target - sim.scroll) - 2 * omega * sim.scrollV;
      sim.scrollV += accel * dt;
      sim.scroll += sim.scrollV * dt;
    }
    if (
      Math.abs(sim.target - sim.scroll) < CLOTH_SETTLE_EPSILON &&
      Math.abs(sim.scrollV) < CLOTH_SETTLE_EPSILON
    ) {
      sim.scroll = sim.target;
      sim.scrollV = 0;
    }
  }
  const ax = frame > 0 ? -(sim.scrollV - previous) / frame : 0;
  sim.vxSmooth += (-sim.scrollV - sim.vxSmooth) * Math.min(1, frame * 14);
  sim.axSmooth += (ax - sim.axSmooth) * Math.min(1, frame * 10);
  return sim.scroll !== start || previous !== 0;
};

const getClothStep = (sim: TClothSim, frame: number) => {
  "worklet";
  if (frame >= CLOTH_STEP_DT * CLOTH_HIGH_REFRESH) {
    sim.clock = 0;
    return frame;
  }
  sim.clock += frame;
  if (sim.clock < CLOTH_STEP_DT * CLOTH_HIGH_REFRESH) return 0;
  const dt = sim.clock;
  sim.clock = 0;
  return dt;
};

const setTouchForces = (sim: TClothSim, card: TClothCard, layout: TClothLayout) => {
  "worklet";
  const { touch, forces } = sim;
  forces.hf = 0;
  if (!touch.active || touch.speed <= CLOTH_TOUCH_MIN_SPEED) return;
  const angle = (card.tilt * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = touch.x - card.x;
  const dy = touch.y - card.y;
  const hx = dx * cos + dy * sin;
  const hy = dx * sin - dy * cos;
  if (
    Math.abs(hx) >= layout.cardWidth * CLOTH_TOUCH_REACH ||
    Math.abs(hy) >= layout.cardHeight * CLOTH_TOUCH_REACH
  ) {
    return;
  }
  forces.hx = hx;
  forces.hy = hy;
  forces.hf = touch.speed * CLOTH_TOUCH_RIPPLE;
  forces.hvx = touch.vx * cos + touch.vy * sin;
  forces.hvy = touch.vx * sin - touch.vy * cos;
};

const advanceCloth = (
  sim: TClothSim,
  layout: TClothLayout,
  images: TClothImages,
  now: number,
) => {
  "worklet";
  const frame =
    sim.last < 0 ? CLOTH_STEP_DT : Math.min(CLOTH_MAX_FRAME, Math.max(0, now - sim.last));
  sim.last = now;
  sim.t += frame;
  let dirty = !sim.drawn;

  if (images !== sim.images) {
    updateClothShaders(sim, images, layout);
    dirty = true;
  }
  if (advanceScroll(sim, frame)) dirty = true;

  const decay = Math.exp(-frame * CLOTH_TOUCH_DECAY);
  sim.touch.speed *= decay;
  sim.touch.vx *= decay;
  sim.touch.vy *= decay;

  const step = getClothStep(sim, frame);
  const steps = Math.max(1, Math.ceil(step / CLOTH_STEP_DT - 0.001));
  const dt = step / steps;
  const moving =
    Math.abs(sim.vxSmooth) > CLOTH_MOVING_SPEED || Math.abs(sim.axSmooth) > CLOTH_MOVING_ACCEL;
  const { forces, mesh } = sim;
  forces.width = layout.cardWidth;
  forces.height = layout.cardHeight;
  forces.vx = sim.vxSmooth;
  forces.ax = sim.axSmooth;
  forces.t = sim.t;
  const reach = layout.width / 2 + layout.cardWidth * CLOTH_VISIBLE_MARGIN;

  for (let index = 0; index < sim.cards.length; index++) {
    const card = sim.cards[index];
    card.x = getCardCenter(index, sim.scroll, layout);
    card.y = layout.height / 2 + card.drop * layout.cardHeight;
    const ready = !!sim.shaders[card.image];
    if (ready && card.readyAt < 0) {
      card.readyAt =
        sim.t + Math.min(1, Math.max(0, card.x / layout.width)) * CLOTH_APPEAR_STAGGER;
    }
    if (ready && sim.t >= card.readyAt && card.appear < 1) {
      if (card.appear === 0) kickCloth(mesh, card, layout.cardWidth);
      card.appear = Math.min(1, card.appear + frame / CLOTH_APPEAR_DURATION);
      dirty = true;
    }
    if (card.appear === 0) continue;
    if (Math.abs(card.x - layout.width / 2) >= reach) {
      if (card.awake > 0 && card.appear >= 1) settleCloth(card);
      continue;
    }
    if (step === 0) {
      if (card.awake > 0) dirty = true;
      continue;
    }
    setTouchForces(sim, card, layout);
    if (moving || forces.hf > 0 || card.awake > CLOTH_AWAKE_THRESHOLD) {
      forces.seed = card.seed;
      for (let s = 0; s < steps; s++) stepCloth(mesh, card, dt, forces);
      dirty = true;
    } else if (card.awake > 0) {
      settleCloth(card);
      dirty = true;
    }
  }
  return dirty;
};

export { advanceCloth };
