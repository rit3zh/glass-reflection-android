import { CAROUSEL_CARD_IMAGE_TRANSITION_MS } from "@/constants/components/card-carousel.const";
import { registerComponent } from "@/utils/register-component.util";
import { Image } from "expo-image";
import { memo, type FC } from "react";
import { StyleSheet, View } from "react-native";
import type { ICarouselCard } from "./interface";

const CarouselCardBase: FC<ICarouselCard> = ({
  item,
  width,
  height,
}: ICarouselCard &
  React.ComponentProps<typeof CarouselCardBase>): React.ReactNode &
  React.JSX.Element => (
  <View style={[styles.card, { width, height }]}>
    <Image
      source={item.uri}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={CAROUSEL_CARD_IMAGE_TRANSITION_MS}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 44,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
});

const CarouselCard = registerComponent("CarouselCard", memo(CarouselCardBase));

export { CarouselCard };
