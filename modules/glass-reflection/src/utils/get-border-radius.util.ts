import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

const getBorderRadius = (style: StyleProp<ViewStyle>) => {
  const flat: ViewStyle = StyleSheet.flatten(style) ?? {};
  return typeof flat.borderRadius === "number" ? flat.borderRadius : undefined;
};

export { getBorderRadius };
