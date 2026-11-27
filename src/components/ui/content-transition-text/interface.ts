import type { StyleProp, ViewStyle } from "react-native";
import type { DataModule, SkFont } from "react-native-skia";

type TContentTransitionDirection = "up" | "down";

type TContentTransitionAlignment = "leading" | "center" | "trailing";

type TContentTransitionTypography = {
  color: string;
  font: DataModule;
  fontSize: number;
  letterSpacing?: number;
};

type TContentTransitionConfig = {
  duration: number;
  bounce: number;
  stagger: number;
  travel: number;
  enterScale: number;
  blur: number;
  blurPulse: number;
};

interface IContentTransitionText {
  value: string;
  typography: TContentTransitionTypography;
  transition: TContentTransitionConfig;
  direction?: TContentTransitionDirection;
  alignment?: TContentTransitionAlignment;
  style?: StyleProp<ViewStyle>;
}

type TGlyphLayout = {
  char: string;
  x: number;
  width: number;
};

type TLineLayout = {
  text: string;
  glyphs: TGlyphLayout[];
};

type TTransitionGlyphKind = "stay" | "enter" | "exit";

type TTransitionGlyph = {
  char: string;
  kind: TTransitionGlyphKind;
  x: number;
  width: number;
  delay: number;
};

type TTransitionPlan = {
  glyphs: TTransitionGlyph[];
  font: SkFont;
  color: string;
  anchor: number;
  centerToBaseline: number;
  sign: number;
  travel: number;
  enterScale: number;
  blur: number;
  pulse: number;
  pulseDuration: number;
  omega: number;
  zeta: number;
  total: number;
};

type TPlanContext = {
  font: SkFont;
  color: string;
  fontSize: number;
  anchor: number;
  config: TContentTransitionConfig;
};

type TCanvasSize = {
  width: number;
  height: number;
};

export {
  type IContentTransitionText,
  type TCanvasSize,
  type TContentTransitionAlignment,
  type TContentTransitionConfig,
  type TContentTransitionDirection,
  type TContentTransitionTypography,
  type TGlyphLayout,
  type TLineLayout,
  type TPlanContext,
  type TTransitionGlyph,
  type TTransitionGlyphKind,
  type TTransitionPlan,
};
