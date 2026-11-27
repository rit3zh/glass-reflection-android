import {
  CONTENT_TRANSITION_ENTER_DELAY,
  CONTENT_TRANSITION_EXIT_SPEED,
  CONTENT_TRANSITION_MAX_STAGGER_SPREAD,
  CONTENT_TRANSITION_SETTLE_FACTOR,
} from "@/constants/components/content-transition-text.const";
import type {
  TContentTransitionDirection,
  TLineLayout,
  TPlanContext,
  TTransitionGlyph,
  TTransitionGlyphKind,
  TTransitionPlan,
} from "../interface";

const staggerStep = (stagger: number, count: number) =>
  count > 1 ? Math.min(stagger, CONTENT_TRANSITION_MAX_STAGGER_SPREAD / (count - 1)) : 0;

const orderOf = (index: number, count: number, direction: TContentTransitionDirection) =>
  direction === "up" ? index : count - 1 - index;

const createPlan = (
  context: TPlanContext,
  glyphs: TTransitionGlyph[],
  direction: TContentTransitionDirection,
  animated: boolean,
): TTransitionPlan => {
  const { font, color, fontSize, anchor, config } = context;
  const { ascent, descent } = font.getMetrics();
  const duration = config.duration / 1000;
  const settle = duration * CONTENT_TRANSITION_SETTLE_FACTOR;
  const lastDelay = glyphs.reduce((latest, glyph) => Math.max(latest, glyph.delay), 0);

  return {
    glyphs,
    font,
    color,
    anchor,
    centerToBaseline: -(ascent + descent) / 2,
    sign: direction === "up" ? 1 : -1,
    travel: config.travel * fontSize,
    enterScale: config.enterScale,
    blur: config.blur,
    pulse: animated ? config.blurPulse : 0,
    pulseDuration: duration + lastDelay,
    omega: (2 * Math.PI) / duration,
    zeta: Math.min(1, Math.max(0.05, 1 - config.bounce)),
    total: animated ? lastDelay + settle : 0,
  };
};

const buildStaticPlan = (context: TPlanContext, line: TLineLayout) =>
  createPlan(
    context,
    line.glyphs.map((glyph) => ({
      char: glyph.char,
      kind: "stay",
      x: glyph.x,
      width: glyph.width,
      delay: 0,
    })),
    "up",
    false,
  );

const placeGlyphs = (
  line: TLineLayout,
  kind: TTransitionGlyphKind,
  step: number,
  offset: number,
  direction: TContentTransitionDirection,
): TTransitionGlyph[] =>
  line.glyphs.map((glyph, index) => ({
    char: glyph.char,
    kind,
    x: glyph.x,
    width: glyph.width,
    delay: offset + step * orderOf(index, line.glyphs.length, direction),
  }));

const buildTransitionPlan = (
  context: TPlanContext,
  from: TLineLayout,
  to: TLineLayout,
  direction: TContentTransitionDirection,
) => {
  const stagger = context.config.stagger / 1000;
  const exitStep = staggerStep(stagger, from.glyphs.length) / CONTENT_TRANSITION_EXIT_SPEED;
  const enterStep = staggerStep(stagger, to.glyphs.length);
  const exits = placeGlyphs(from, "exit", exitStep, 0, direction);
  const arrivals = placeGlyphs(to, "enter", enterStep, CONTENT_TRANSITION_ENTER_DELAY, direction);

  return createPlan(context, [...exits, ...arrivals], direction, true);
};

export { buildStaticPlan, buildTransitionPlan };
