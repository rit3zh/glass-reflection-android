import { GALLERY_TABLET_BREAKPOINT } from "@/constants/gallery.const";
import { useWindowDimensions } from "react-native";

const useIsTablet = () => useWindowDimensions().width >= GALLERY_TABLET_BREAKPOINT;

export { useIsTablet };
