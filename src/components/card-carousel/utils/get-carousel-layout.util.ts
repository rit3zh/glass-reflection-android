import {
  CAROUSEL_CARD_HEIGHT_RATIO,
  CAROUSEL_CARD_MAX_WIDTH,
  CAROUSEL_CARD_WIDTH_RATIO,
  CAROUSEL_RESERVED_HEIGHT,
  CAROUSEL_SPACING,
  CAROUSEL_TABLET_CARD_HEIGHT_RATIO,
  CAROUSEL_TABLET_CARD_MAX_WIDTH,
  CAROUSEL_TABLET_RESERVED_HEIGHT,
} from "@/constants/components/card-carousel.const";
import type { EdgeInsets } from "react-native-safe-area-context";

const getCarouselLayout = (
  width: number,
  height: number,
  insets: EdgeInsets,
  isTablet: boolean,
) => {
  const heightRatio = isTablet ? CAROUSEL_TABLET_CARD_HEIGHT_RATIO : CAROUSEL_CARD_HEIGHT_RATIO;
  const maxWidth = isTablet ? CAROUSEL_TABLET_CARD_MAX_WIDTH : CAROUSEL_CARD_MAX_WIDTH;
  const reserved = isTablet ? CAROUSEL_TABLET_RESERVED_HEIGHT : CAROUSEL_RESERVED_HEIGHT;
  const availableHeight = height - insets.top - insets.bottom - reserved;
  const cardWidth = Math.round(
    Math.min(width * CAROUSEL_CARD_WIDTH_RATIO, maxWidth, availableHeight / heightRatio),
  );
  const cardHeight = Math.round(cardWidth * heightRatio);
  return {
    cardWidth,
    cardHeight,
    interval: cardWidth + CAROUSEL_SPACING,
    sideInset: (width - cardWidth) / 2,
  };
};

export { getCarouselLayout };
