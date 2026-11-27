import type { TGalleryCard } from "@/constants/interface";
import { useEffect } from "react";
import { useSharedValue } from "react-native-reanimated";
import { loadImage } from "react-native-skia";
import type { TClothImages } from "../interface";

const useClothImages = (cards: TGalleryCard[]) => {
  const images = useSharedValue<TClothImages>([]);

  useEffect(() => {
    let cancelled = false;
    const loaded: TClothImages = cards.map(() => null);
    images.set([...loaded]);
    cards.forEach((card, index) => {
      loadImage(card.uri)
        .then((image) => {
          if (cancelled) return;
          loaded[index] = image;
          images.set([...loaded]);
        })
        .catch(() => undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [cards, images]);

  return images;
};

export { useClothImages };
