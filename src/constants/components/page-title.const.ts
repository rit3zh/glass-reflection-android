import type {
  TContentTransitionConfig,
  TContentTransitionTypography,
} from "@/components/ui/content-transition-text";
import { FONT_SF_BOLD, FONT_SF_SOURCES } from "../font.const";

const PAGE_TITLE_SWITCH_THRESHOLD = 0.55;

const PAGE_TITLE_TRANSITION: TContentTransitionConfig = {
  blur: 4,
  blurPulse: 1.6,
  bounce: 0.22,
  duration: 420,
  enterScale: 0.72,
  stagger: 22,
  travel: 0.75,
};

const PAGE_TITLE_TYPOGRAPHY: TContentTransitionTypography = {
  color: "#FFFFFF",
  font: FONT_SF_SOURCES[FONT_SF_BOLD],
  fontSize: 15,
  letterSpacing: 2,
};

export {
  PAGE_TITLE_SWITCH_THRESHOLD,
  PAGE_TITLE_TRANSITION,
  PAGE_TITLE_TYPOGRAPHY,
};
