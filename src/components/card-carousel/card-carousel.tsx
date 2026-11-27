import { CAROUSEL_SPACING } from "@/constants/components/card-carousel.const";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { CarouselCard } from "./carousel-card";
import { useCarouselGesture } from "./hooks/use-carousel-gesture";
import { useCarouselLayout } from "./hooks/use-carousel-layout";
import type { ICardCarousel } from "./interface";

const CardCarouselBase: FC<ICardCarousel> = ({
  cards,
  page,
}: ICardCarousel &
  React.ComponentProps<typeof CardCarouselBase>): React.ReactNode &
  React.JSX.Element => {
  const { cardWidth, cardHeight, interval, sideInset } = useCarouselLayout();
  const { gesture, offset } = useCarouselGesture(page, cards.length, interval);
  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.carousel, { height: cardHeight }]}>
        <Animated.View
          style={[styles.track, { paddingHorizontal: sideInset }, trackStyle]}
        >
          {cards.map((item) => (
            <CarouselCard
              key={item.key}
              item={item}
              width={cardWidth}
              height={cardHeight}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  carousel: {
    justifyContent: "center",
  },
  track: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: CAROUSEL_SPACING,
  },
});

const CardCarousel = registerComponent("CardCarousel", CardCarouselBase);

export { CardCarousel };
