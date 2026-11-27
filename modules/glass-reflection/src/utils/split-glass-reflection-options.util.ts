import { GLASS_REFLECTION_OPTION_KEYS } from "../constants/glass-reflection.const";
import type { TGlassReflectionOptions } from "../interface";

const splitGlassReflectionOptions = <P extends TGlassReflectionOptions>(props: P) => {
  const optionKeys: readonly string[] = GLASS_REFLECTION_OPTION_KEYS;
  const options: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const key in props) {
    const target = optionKeys.includes(key) ? options : rest;
    target[key] = props[key];
  }
  return {
    options: options as TGlassReflectionOptions,
    rest: rest as Omit<P, keyof TGlassReflectionOptions>,
  };
};

export { splitGlassReflectionOptions };
