import type { TGalleryCard } from "./interface";

const GALLERY_CARDS: TGalleryCard[] = [
  {
    key: "unknown-key-value-1",
    uri: "https://i.pinimg.com/736x/5b/40/67/5b4067be796be67c77471a2c8d0c7033.jpg",
    label: "The North Face",
  },
  {
    key: "unknown-key-value-2",
    uri: "https://i.pinimg.com/1200x/d1/99/bc/d199bcc7c685768ede27d5a139fa3e18.jpg",
    label: "Tyler",
  },
  {
    key: "unknown-key-value-3",
    uri: "https://i.pinimg.com/736x/d2/8e/eb/d28eebeb1810fdf48ab962a2cbe4a26c.jpg",
    label: "",
  },
  {
    key: "unknown-key-value-4",
    label: "",
    uri: "https://i.pinimg.com/1200x/96/71/0e/96710e99137c40466640b06ad41f8a02.jpg",
  },
];

const GALLERY_GLASS_FPS = 60;
const GALLERY_GLASS_SHIMMER = 0;
const GALLERY_GLASS_INNER_SHINE = 0.9;
const GALLERY_GLASS_INNER_SHINE_SPREAD = 0.9;
const GALLERY_SCREEN_PADDING = 12;
const GALLERY_TABLET_BREAKPOINT = 600;

export {
  GALLERY_CARDS,
  GALLERY_GLASS_FPS,
  GALLERY_GLASS_INNER_SHINE,
  GALLERY_GLASS_INNER_SHINE_SPREAD,
  GALLERY_GLASS_SHIMMER,
  GALLERY_SCREEN_PADDING,
  GALLERY_TABLET_BREAKPOINT,
};
