import type { FC } from "react";
import { GlassReflectionContext } from "../../context/glass-reflection.context";
import { useGlassReflectionDefaults } from "../../hooks/use-glass-reflection-defaults";
import { registerComponent } from "../../utils/register-component.util";
import type { IGlassReflectionProvider } from "./interface";

const GlassReflectionProviderBase: FC<IGlassReflectionProvider> = ({
  children,
  ...options
}: IGlassReflectionProvider &
  React.ComponentProps<typeof GlassReflectionProviderBase>): React.ReactNode &
  React.JSX.Element => {
  const parent = useGlassReflectionDefaults();
  return (
    <GlassReflectionContext value={{ ...parent, ...options }}>
      {children}
    </GlassReflectionContext>
  );
};

const GlassReflectionProvider = registerComponent(
  "GlassReflectionProvider",
  GlassReflectionProviderBase,
);

export { GlassReflectionProvider };
