import type { TGalleryCard } from "@/constants/interface";
import type { TContentTransitionDirection } from "@/components/ui/content-transition-text";
import type { SharedValue } from "react-native-reanimated";

interface IPageTitle {
  cards: readonly TGalleryCard[];
  page: SharedValue<number>;
}

type TActivePage = {
  index: number;
  direction: TContentTransitionDirection;
};

export { type IPageTitle, type TActivePage };
