import {
  PAGE_TITLE_TRANSITION,
  PAGE_TITLE_TYPOGRAPHY,
} from "@/constants/components/page-title.const";
import { ContentTransitionText } from "@/components/ui/content-transition-text";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { StyleSheet } from "react-native";
import { useActivePage } from "./hooks/use-active-page";
import type { IPageTitle } from "./interface";

const PageTitleBase: FC<IPageTitle> = ({
  cards,
  page,
}: IPageTitle & React.ComponentProps<typeof PageTitleBase>): React.ReactNode &
  React.JSX.Element => {
  const { index, direction } = useActivePage(page, cards.length);

  return (
    <ContentTransitionText
      style={styles.slot}
      typography={PAGE_TITLE_TYPOGRAPHY}
      transition={PAGE_TITLE_TRANSITION}
      alignment="center"
      direction={direction}
      value={cards[index].label.toUpperCase()}
    />
  );
};

const styles = StyleSheet.create({
  slot: {
    height: 22,
    marginBottom: 16,
    alignSelf: "stretch",
  },
});

const PageTitle = registerComponent("PageTitle", PageTitleBase);

export { PageTitle };
