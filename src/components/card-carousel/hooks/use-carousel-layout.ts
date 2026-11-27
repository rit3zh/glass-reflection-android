import { useIsTablet } from "@/hooks/use-is-tablet";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCarouselLayout } from "../utils/get-carousel-layout.util";

const useCarouselLayout = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  return getCarouselLayout(width, height, insets, isTablet);
};

export { useCarouselLayout };
