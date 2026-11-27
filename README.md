# glass-reflection

A cloth-physics image carousel for Android with glass buttons that reflect and refract the content behind them.

---

<!-- demo video -->

## ⚙️ Installation

```bash
git clone https://github.com/rit3zh/glass-reflection
cd glass-reflection
bun install
bunx expo run:android
```

This uses a local native module ([`modules/glass-reflection`](modules/glass-reflection)), so it needs a development build and won't run in Expo Go. The glass module is Android only and doens't work on iOS (just use glass effect).

---

## 🚀 Usage

Wrap the app in `GlassReflectionProvider`, then use `GlassReflectionButton` anywhere inside it:

```tsx
import {
  GlassReflectionProvider,
  GlassReflectionButton,
} from "glass-reflection";

export default function Layout() {
  return (
    <GlassReflectionProvider fps={60} innerShine={0.5} innerShineSpread={0.9}>
      <GlassReflectionButton
        title="Create"
        style={{ height: 52 }}
        intensity={2.5}
        glow={1.5}
        onPress={() => {}}
      />
    </GlassReflectionProvider>
  );
}
```

The carousel takes a list of cards and a shared value for the current page:

```tsx
const page = useSharedValue(0);

<ClothCarousel cards={GALLERY_CARDS} page={page} />
<PageDots count={GALLERY_CARDS.length} page={page} />
```

Swipe to scroll the cards and drag across one to push the cloth around.

---

## 🧩 Customizing

| What                     | Where                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Cards (images, labels)   | `GALLERY_CARDS` in [`src/constants/gallery.const.ts`](src/constants/gallery.const.ts)                                 |
| Glass defaults           | `GALLERY_GLASS_*` in [`src/constants/gallery.const.ts`](src/constants/gallery.const.ts)                               |
| Glass options            | `TGlassReflectionOptions` in [`modules/glass-reflection/src/interface.ts`](modules/glass-reflection/src/interface.ts) |
| Cloth physics and layout | [`src/constants/components/cloth-carousel.const.ts`](src/constants/components/cloth-carousel.const.ts)                |
| Buttons                  | [`src/components/gallery-actions/gallery-actions.tsx`](src/components/gallery-actions/gallery-actions.tsx)            |
| Colours                  | [`src/constants/palette.const.ts`](src/constants/palette.const.ts)                                                    |

---

## 🧱 Stack

[Expo SDK 58](https://expo.dev/changelog) · [React Native 0.88](https://reactnative.dev/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [Expo Modules](https://docs.expo.dev/modules/overview/) · [Reanimated](https://docs.swmansion.com/react-native-reanimated/) · [Skia](https://shopify.github.io/react-native-skia/)
