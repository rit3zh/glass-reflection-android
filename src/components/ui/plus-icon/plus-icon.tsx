import {
  PLUS_ICON_INSET_RATIO,
  PLUS_ICON_STROKE_RATIO,
} from "@/constants/components/plus-icon.const";
import { registerComponent } from "@/utils/register-component.util";
import type { FC } from "react";
import { Canvas, Line, vec } from "react-native-skia";
import type { IPlusIcon } from "./interface";

const PlusIconBase: FC<IPlusIcon> = ({
  size,
  color,
}: IPlusIcon & React.ComponentProps<typeof PlusIconBase>): React.ReactNode &
  React.JSX.Element => {
  const inset = size * PLUS_ICON_INSET_RATIO;
  const center = size / 2;
  const strokeWidth = size * PLUS_ICON_STROKE_RATIO;

  return (
    <Canvas style={{ width: size, height: size }}>
      <Line
        p1={vec(inset, center)}
        p2={vec(size - inset, center)}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      />
      <Line
        p1={vec(center, inset)}
        p2={vec(center, size - inset)}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
      />
    </Canvas>
  );
};

const PlusIcon = registerComponent("PlusIcon", PlusIconBase);

export { PlusIcon };
