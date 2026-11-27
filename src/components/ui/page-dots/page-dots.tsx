import { PAGE_DOTS_GAP, PAGE_DOTS_SIZE } from "@/constants/components/page-dots.const";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet, View } from "react-native";
import type { IPageDots } from "./interface";
import { PageDot } from "./page-dot";
import { getPageDotIndexes } from "./utils/get-page-dot-indexes.util";

const PageDotsBase: FC<IPageDots> = ({
  count,
  page,
}: IPageDots & React.ComponentProps<typeof PageDotsBase>): React.ReactNode &
  React.JSX.Element => (
  <View style={styles.dots}>
    <View style={styles.capsule}>
      {getPageDotIndexes(count).map((index) => (
        <PageDot key={index} index={index} page={page} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  dots: {
    alignItems: "center",
    marginVertical: 18,
  },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: PAGE_DOTS_GAP,
    paddingHorizontal: PAGE_DOTS_SIZE * 1.5,
    paddingVertical: PAGE_DOTS_SIZE,
    borderRadius: PAGE_DOTS_SIZE * 2,
    borderCurve: "continuous",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

const PageDots = registerComponent("PageDots", PageDotsBase);

export { PageDots };
