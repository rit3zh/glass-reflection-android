import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { Canvas, Picture } from "react-native-skia";
import { useClothFrame } from "./hooks/use-cloth-frame";
import { useClothGesture } from "./hooks/use-cloth-gesture";
import { useClothImages } from "./hooks/use-cloth-images";
import { useClothLayout } from "./hooks/use-cloth-layout";
import type { IClothCarousel } from "./interface";

const ClothCarouselBase: FC<IClothCarousel> = ({
  cards,
  page,
}: IClothCarousel & React.ComponentProps<typeof ClothCarouselBase>): React.ReactNode &
  React.JSX.Element => {
  const layout = useClothLayout(cards.length);
  const images = useClothImages(cards);
  const { picture, sim } = useClothFrame(layout, images, page);
  const gesture = useClothGesture(sim, layout.pitch);

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.band, { width: layout.width, height: layout.height }]}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Picture picture={picture} />
        </Canvas>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  band: {
    alignSelf: "center",
  },
});

const ClothCarousel = registerComponent("ClothCarousel", ClothCarouselBase);

export { ClothCarousel };
