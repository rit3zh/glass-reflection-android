import { useIsTablet } from "@/hooks/use-is-tablet";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getClothLayout } from "../utils/get-cloth-layout.util";

const useClothLayout = <T extends number>(count: T) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = useIsTablet();
  return getClothLayout(width, height, insets, isTablet, count);
};

export { useClothLayout };
