import {
  CLOTH_EDGE_MARGIN,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_SHADE_MAX,
  CLOTH_SHADE_MIN,
} from "@/constants/components/cloth-carousel.const";
import {
  BlendMode,
  Skia,
  VertexMode,
  type SkCanvas,
  type SkShader,
} from "react-native-skia";
import type { TClothCard, TClothLayout, TClothSim } from "../interface";

const writeClothShade = (sim: TClothSim, card: TClothCard, index: number, layout: TClothLayout) => {
  "worklet";
  const { mesh, light, shade } = sim;
  const { u, v } = mesh;
  const { off } = card;
  const cols = CLOTH_SEG_X + 1;
  const fullWidth = layout.cardWidth + CLOTH_EDGE_MARGIN * 2;
  const fullHeight = layout.cardHeight + CLOTH_EDGE_MARGIN * 2;
  const scale = 255 / (CLOTH_SHADE_MAX - CLOTH_SHADE_MIN);
  const offset = index * mesh.n * 4;
  const lx = light[0];
  const ly = light[1];
  const lz = light[2];

  for (let j = 0; j <= CLOTH_SEG_Y; j++) {
    for (let i = 0; i < cols; i++) {
      const p = j * cols + i;
      const left = i > 0 ? p - 1 : p;
      const right = i < CLOTH_SEG_X ? p + 1 : p;
      const up = j > 0 ? p - cols : p;
      const down = j < CLOTH_SEG_Y ? p + cols : p;
      const l3 = left * 3;
      const r3 = right * 3;
      const u3 = up * 3;
      const d3 = down * 3;
      const tux = (u[right] - u[left]) * fullWidth + off[r3] - off[l3];
      const tuy = off[r3 + 1] - off[l3 + 1];
      const tuz = off[r3 + 2] - off[l3 + 2];
      const tvx = off[u3] - off[d3];
      const tvy = (v[down] - v[up]) * fullHeight + off[u3 + 1] - off[d3 + 1];
      const tvz = off[u3 + 2] - off[d3 + 2];
      const nx = tuy * tvz - tuz * tvy;
      const ny = tuz * tvx - tux * tvz;
      const nz = tux * tvy - tuy * tvx;
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const lit = 0.3 + (0.7 * (nx * lx + ny * ly + nz * lz)) / length / lz;
      const value = Math.min(CLOTH_SHADE_MAX, Math.max(CLOTH_SHADE_MIN, lit));
      shade[offset + p * 4] = (value - CLOTH_SHADE_MIN) * scale + 0.5;
    }
  }
};

const drawFlatCard = (
  canvas: SkCanvas,
  sim: TClothSim,
  card: TClothCard,
  layout: TClothLayout,
  shader: SkShader,
  alpha: number,
  y: number,
) => {
  "worklet";
  const { paint } = sim;
  paint.setShader(shader);
  paint.setAlphaf(alpha);
  canvas.save();
  canvas.translate(card.x, y);
  canvas.rotate(card.tilt, 0, 0);
  canvas.translate(-layout.cardWidth / 2, -layout.cardHeight / 2);
  canvas.drawRect(sim.rect, paint);
  canvas.restore();
};

const drawFoldedCard = (
  canvas: SkCanvas,
  sim: TClothSim,
  card: TClothCard,
  layout: TClothLayout,
  shader: SkShader,
  alpha: number,
  y: number,
) => {
  "worklet";
  const { mesh, paint } = sim;
  const { n, u, v, grid, corners, positions } = mesh;
  const { off } = card;
  const fullWidth = layout.cardWidth + CLOTH_EDGE_MARGIN * 2;
  const fullHeight = layout.cardHeight + CLOTH_EDGE_MARGIN * 2;
  const angle = (card.tilt * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const midX = layout.width / 2;
  const midY = layout.height / 2;
  const depth = layout.depth;
  const originX = card.x - midX;
  const originY = y - midY;

  for (let p = 0; p < n; p++) {
    const x3 = p * 3;
    const lx = (u[p] - 0.5) * fullWidth + off[x3];
    const ly = (0.5 - v[p]) * fullHeight + off[x3 + 1];
    const k = depth / (depth - off[x3 + 2]);
    grid[p * 2] = midX + (originX + lx * cos + ly * sin) * k;
    grid[p * 2 + 1] = midY + (originY + lx * sin - ly * cos) * k;
  }

  const count = corners.length;
  for (let t = 0; t < count; t++) {
    const g = corners[t] * 2;
    positions[t * 2] = grid[g];
    positions[t * 2 + 1] = grid[g + 1];
  }

  paint.setShader(shader);
  paint.setAlphaf(alpha);
  canvas.drawVertices(
    Skia.MakeVertices(VertexMode.Triangles, positions, mesh.texCoords),
    BlendMode.Modulate,
    paint,
  );
};

export { drawFlatCard, drawFoldedCard, writeClothShade };
