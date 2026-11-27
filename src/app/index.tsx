import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClothCarousel } from "@/components/cloth-carousel";
import { GalleryActions } from "@/components/gallery-actions";
import { PageDots } from "@/components/ui/page-dots";
import {
  GALLERY_CARDS,
  GALLERY_SCREEN_PADDING,
} from "@/constants/gallery.const";

const Index: FC = (): React.ReactNode & React.JSX.Element => {
  const insets = useSafeAreaInsets();
  const page = useSharedValue(0);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + GALLERY_SCREEN_PADDING,
          paddingBottom: insets.bottom + GALLERY_SCREEN_PADDING,
        },
      ]}
    >
      <ClothCarousel cards={GALLERY_CARDS} page={page} />
      <PageDots count={GALLERY_CARDS.length} page={page} />
      <GalleryActions />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
});

export default Index;
