import { requireNativeModule, requireNativeView } from "expo";
import type {
  INativeGlassReflection,
  TNativeGlassReflectionModule,
  TNativeGlassReflectionView,
} from "./interface";

const NativeGlassReflectionView: TNativeGlassReflectionView =
  requireNativeView<INativeGlassReflection>("GlassReflection");

const NativeGlassReflectionModule: TNativeGlassReflectionModule =
  requireNativeModule<TNativeGlassReflectionModule>("GlassReflection");

const setReflectionsPaused = (paused: boolean) => {
  NativeGlassReflectionModule.setPaused(paused);
};

export { NativeGlassReflectionView, setReflectionsPaused };
