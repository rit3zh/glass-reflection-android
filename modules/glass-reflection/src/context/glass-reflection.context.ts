import { createContext } from "react";
import type { TGlassReflectionOptions } from "../interface";

const GlassReflectionContext = createContext<TGlassReflectionOptions>({});

export { GlassReflectionContext };
