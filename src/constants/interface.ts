import type { Stack } from "expo-router";
import type { ComponentProps } from "react";

type TGalleryCard = {
  key: string;
  uri: string;
  label: string;
};

type TStackScreenOptions = Extract<
  NonNullable<ComponentProps<typeof Stack>["screenOptions"]>,
  object
>;

export { type TGalleryCard, type TStackScreenOptions };
