import type { SharedValue } from "react-native-reanimated";

interface IPageDots {
  count: number;
  page: SharedValue<number>;
}

interface IPageDot {
  index: number;
  page: SharedValue<number>;
}

export { type IPageDot, type IPageDots };
