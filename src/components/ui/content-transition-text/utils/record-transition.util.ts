import {
  CONTENT_TRANSITION_BLUR_EPSILON,
  CONTENT_TRANSITION_EXIT_SPEED,
  CONTENT_TRANSITION_MIN_ALPHA,
} from "@/constants/components/content-transition-text.const";
import { BlurStyle, Skia, TileMode } from "react-native-skia";
import type { TCanvasSize, TTransitionPlan } from "../interface";
import { springProgress } from "./spring-progress.util";

const recordTransition = (plan: TTransitionPlan | null, clock: number, size: TCanvasSize) => {
  "worklet";
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(
    Skia.XYWHRect(0, 0, Math.max(1, size.width), Math.max(1, size.height)),
  );
  if (!plan || size.width <= 0) return recorder.finishRecordingAsPicture();

  const settled = clock >= plan.total;
  const originX = size.width * plan.anchor;
  const centerY = size.height / 2;
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(plan.color));

  const pulseProgress = Math.min(1, Math.max(0, clock / plan.pulseDuration));
  const pulse = settled ? 0 : Math.sin(Math.PI * pulseProgress) * plan.pulse;
  const pulsing = pulse > CONTENT_TRANSITION_BLUR_EPSILON;
  if (pulsing) {
    const layer = Skia.Paint();
    layer.setImageFilter(Skia.ImageFilter.MakeBlur(pulse, pulse, TileMode.Decal, null));
    canvas.saveLayer(layer);
  }

  for (const glyph of plan.glyphs) {
    if (glyph.kind === "stay") {
      paint.setAlphaf(1);
      paint.setMaskFilter(null);
      canvas.drawText(
        glyph.char,
        originX + glyph.x,
        centerY + plan.centerToBaseline,
        paint,
        plan.font,
      );
      continue;
    }

    const exiting = glyph.kind === "exit";
    if (settled && exiting) continue;
    const speed = exiting ? CONTENT_TRANSITION_EXIT_SPEED : 1;
    const spring = settled
      ? 1
      : springProgress((clock - glyph.delay) * speed, plan.omega, plan.zeta);

    const presence = exiting ? 1 - spring : spring;
    const visible = Math.min(1, Math.max(0, presence));
    const alpha = exiting ? visible * visible : visible;
    if (alpha <= CONTENT_TRANSITION_MIN_ALPHA) continue;

    const offset = (1 - presence) * plan.travel * plan.sign * (exiting ? -1 : 1);
    const scale = plan.enterScale + (1 - plan.enterScale) * presence;
    const blur = (1 - visible) * plan.blur;

    canvas.save();
    canvas.translate(originX + glyph.x + glyph.width / 2, centerY + offset);
    canvas.scale(scale, scale);
    paint.setAlphaf(alpha);
    paint.setMaskFilter(
      blur > CONTENT_TRANSITION_BLUR_EPSILON
        ? Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, false)
        : null,
    );
    canvas.drawText(glyph.char, -glyph.width / 2, plan.centerToBaseline, paint, plan.font);
    canvas.restore();
  }

  if (pulsing) canvas.restore();
  return recorder.finishRecordingAsPicture();
};

export { recordTransition };
