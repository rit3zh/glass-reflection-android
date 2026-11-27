import { PlusIcon } from "@/components/ui/plus-icon";
import {
  GALLERY_ACTIONS_ADD_ICON_SIZE,
  GALLERY_ACTIONS_PRIMARY_TITLE,
  GALLERY_ACTIONS_TABLET_ADD_ICON_SIZE,
} from "@/constants/components/gallery-actions.const";
import { FONT_SF_MEDIUM } from "@/constants/font.const";
import { PALETTE_FOREGROUND } from "@/constants/palette.const";
import { useIsTablet } from "@/hooks/use-is-tablet";
import { registerComponent } from "@/utils/register-component.util";
import { GlassReflectionButton } from "glass-reflection";
import type { FC } from "react";
import { StyleSheet, View } from "react-native";

const GalleryActionsBase: FC = (): React.ReactNode & React.JSX.Element => {
  const isTablet = useIsTablet();

  return (
    <View style={[styles.actions, isTablet && styles.actionsTablet]}>
      <GlassReflectionButton
        title={GALLERY_ACTIONS_PRIMARY_TITLE}
        style={[styles.primary, isTablet && styles.primaryTablet]}
        titleStyle={[styles.title, isTablet && styles.titleTablet]}
        intensity={2.5}
        glow={1.5}
        shine={0}
        onPress={() => {}}
      />
      <GlassReflectionButton
        style={[styles.round, isTablet && styles.roundTablet]}
        contentStyle={styles.roundContent}
        onPress={() => {}}
      >
        <PlusIcon
          size={
            isTablet
              ? GALLERY_ACTIONS_TABLET_ADD_ICON_SIZE
              : GALLERY_ACTIONS_ADD_ICON_SIZE
          }
          color={PALETTE_FOREGROUND}
        />
      </GlassReflectionButton>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  actionsTablet: {
    maxWidth: 420,
    gap: 14,
  },
  primary: {
    flex: 1,
    height: 52,
  },
  primaryTablet: {
    height: 56,
  },
  title: {
    fontFamily: FONT_SF_MEDIUM,
    fontWeight: "normal",
    fontSize: 17,
    letterSpacing: -0.2,
  },
  titleTablet: {
    fontSize: 18,
  },
  round: {
    width: 52,
    height: 52,
  },
  roundTablet: {
    width: 56,
    height: 56,
  },
  roundContent: {
    paddingHorizontal: 0,
  },
});

const GalleryActions = registerComponent("GalleryActions", GalleryActionsBase);

export { GalleryActions };
