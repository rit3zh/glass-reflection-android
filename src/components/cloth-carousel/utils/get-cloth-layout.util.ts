import {
  CLOTH_BAND_RATIO,
  CLOTH_CARD_ASPECT,
  CLOTH_CARD_MAX_WIDTH,
  CLOTH_CARD_MIN_WIDTH,
  CLOTH_CARD_PITCH,
  CLOTH_CARD_WIDTH_RATIO,
  CLOTH_HALF_FOV,
  CLOTH_RESERVED_HEIGHT,
  CLOTH_TABLET_CARD_WIDTH_RATIO,
  CLOTH_TABLET_RESERVED_HEIGHT,
} from "@/constants/components/cloth-carousel.const";
import type { EdgeInsets } from "react-native-safe-area-context";
import type { TClothLayout } from "../interface";

const getClothLayout = (
  width: number,
  height: number,
  insets: EdgeInsets,
  isTablet: boolean,
  count: number,
) => {
  const reserved = isTablet ? CLOTH_TABLET_RESERVED_HEIGHT : CLOTH_RESERVED_HEIGHT;
  const widthRatio = isTablet ? CLOTH_TABLET_CARD_WIDTH_RATIO : CLOTH_CARD_WIDTH_RATIO;
  const available = height - insets.top - insets.bottom - reserved;
  const cardWidth = Math.round(
    Math.max(
      CLOTH_CARD_MIN_WIDTH,
      Math.min(
        width * widthRatio,
        (available / CLOTH_BAND_RATIO) * CLOTH_CARD_ASPECT,
        CLOTH_CARD_MAX_WIDTH,
      ),
    ),
  );
  const cardHeight = Math.round(cardWidth / CLOTH_CARD_ASPECT);
  const pitch = cardWidth * CLOTH_CARD_PITCH;
  const safeCount = Math.max(1, count);
  const copies = Math.max(1, Math.ceil((width + pitch * 4) / (pitch * safeCount)));
  const bandHeight = Math.round(cardHeight * CLOTH_BAND_RATIO);
  const layout: TClothLayout = {
    key: [width, bandHeight, cardWidth, safeCount].join(":"),
    width,
    height: bandHeight,
    cardWidth,
    cardHeight,
    pitch,
    depth: height / 2 / Math.tan(CLOTH_HALF_FOV),
    count: safeCount,
    total: safeCount * copies,
  };
  return layout;
};

export { getClothLayout };
