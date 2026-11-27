import type { TGalleryCard } from "@/constants/interface";
import type { SharedValue } from "react-native-reanimated";

interface ICardCarousel {
  cards: TGalleryCard[];
  page: SharedValue<number>;
}

interface ICarouselCard {
  item: TGalleryCard;
  width: number;
  height: number;
}

export { type ICardCarousel, type ICarouselCard };
