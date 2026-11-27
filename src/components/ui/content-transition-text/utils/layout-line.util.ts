import type { SkFont } from "react-native-skia";
import type { TGlyphLayout, TLineLayout } from "../interface";

const layoutLine = (font: SkFont, text: string, letterSpacing: number, anchor: number) => {
  const chars = Array.from(text);
  const widths = font.getGlyphWidths(font.getGlyphIDs(text));
  const placed: TGlyphLayout[] = [];
  let cursor = 0;

  chars.forEach((char, index) => {
    const width = widths[index] ?? 0;
    if (char.trim().length > 0) placed.push({ char, x: cursor, width });
    cursor += width + letterSpacing;
  });

  const lineWidth = Math.max(0, cursor - letterSpacing);
  const start = -lineWidth * anchor;
  const glyphs = placed.map((glyph) => ({ ...glyph, x: glyph.x + start }));

  return { text, glyphs } satisfies TLineLayout;
};

export { layoutLine };
