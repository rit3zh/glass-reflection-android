import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GlassReflectionProvider } from "glass-reflection";
import type { FC } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { FONT_SF_SOURCES } from "@/constants/font.const";
import {
  GALLERY_GLASS_FPS,
  GALLERY_GLASS_INNER_SHINE,
  GALLERY_GLASS_INNER_SHINE_SPREAD,
  GALLERY_GLASS_SHIMMER,
} from "@/constants/gallery.const";
import { NAVIGATION_STACK_OPTIONS } from "@/constants/navigation.const";

const RootLayout: FC = (): React.ReactNode & React.JSX.Element => {
  const [fontsLoaded] = useFonts(FONT_SF_SOURCES);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GlassReflectionProvider
        fps={GALLERY_GLASS_FPS}
        shimmer={GALLERY_GLASS_SHIMMER}
        innerShine={GALLERY_GLASS_INNER_SHINE}
        innerShineSpread={GALLERY_GLASS_INNER_SHINE_SPREAD}
      >
        <StatusBar style="light" />
        {fontsLoaded ? <Stack screenOptions={NAVIGATION_STACK_OPTIONS} /> : null}
      </GlassReflectionProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
});

export default RootLayout;
