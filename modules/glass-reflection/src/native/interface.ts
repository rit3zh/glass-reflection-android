import type { ComponentType } from "react";
import type { ViewProps } from "react-native";
import type {
  TGlassReflectionOptions,
  TGlassReflectionRef,
} from "../interface";

interface INativeGlassReflection extends ViewProps, TGlassReflectionOptions {
  cornerRadius?: number;
  ref?: React.Ref<TGlassReflectionRef>;
}

type TNativeGlassReflectionModule = {
  setPaused: (paused: boolean) => void;
};

type TNativeGlassReflectionView = ComponentType<INativeGlassReflection> | null;

export {
  type INativeGlassReflection,
  type TNativeGlassReflectionModule,
  type TNativeGlassReflectionView,
};
