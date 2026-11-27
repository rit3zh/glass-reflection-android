import {
  CLOTH_EDGE_MARGIN,
  CLOTH_EDGE_SOFTNESS,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_STIFFNESS,
} from "@/constants/components/cloth-carousel.const";
import type { TClothMesh } from "../interface";
import { getEdgeWeight } from "./get-edge-weight.util";

const createClothMesh = (cardWidth: number, cardHeight: number) => {
  "worklet";
  const cols = CLOTH_SEG_X + 1;
  const rows = CLOTH_SEG_Y + 1;
  const n = cols * rows;
  const fullWidth = cardWidth + CLOTH_EDGE_MARGIN * 2;
  const fullHeight = cardHeight + CLOTH_EDGE_MARGIN * 2;
  const u = new Float32Array(n);
  const v = new Float32Array(n);
  const edge = new Float32Array(n);
  const stiffness = new Float32Array(n);
  const rowSin = new Float32Array(rows);
  const rowCos = new Float32Array(rows);
  const corners = new Uint16Array(CLOTH_SEG_X * CLOTH_SEG_Y * 6);
  const texCoords = new Float32Array(corners.length * 2);

  for (let j = 0; j < rows; j++) {
    rowSin[j] = Math.sin((2.2 * j) / CLOTH_SEG_Y);
    rowCos[j] = Math.cos((2.2 * j) / CLOTH_SEG_Y);
    for (let i = 0; i < cols; i++) {
      const p = j * cols + i;
      u[p] = i / CLOTH_SEG_X;
      v[p] = j / CLOTH_SEG_Y;
      edge[p] = getEdgeWeight(u[p], v[p]);
      stiffness[p] = CLOTH_STIFFNESS * (1 - CLOTH_EDGE_SOFTNESS * edge[p]);
    }
  }

  let t = 0;
  for (let j = 0; j < CLOTH_SEG_Y; j++) {
    for (let i = 0; i < CLOTH_SEG_X; i++) {
      const a = j * cols + i;
      const c = a + cols;
      corners[t++] = a;
      corners[t++] = a + 1;
      corners[t++] = c;
      corners[t++] = a + 1;
      corners[t++] = c + 1;
      corners[t++] = c;
    }
  }

  for (let k = 0; k < corners.length; k++) {
    const p = corners[k];
    texCoords[k * 2] = u[p] * fullWidth - CLOTH_EDGE_MARGIN;
    texCoords[k * 2 + 1] = v[p] * fullHeight - CLOTH_EDGE_MARGIN;
  }

  const mesh: TClothMesh = {
    n,
    u,
    v,
    edge,
    stiffness,
    rowSin,
    rowCos,
    colSin: new Float32Array(cols),
    colCos: new Float32Array(cols),
    colLift: new Float32Array(cols),
    corners,
    grid: new Float32Array(n * 2),
    positions: new Float32Array(corners.length * 2),
    texCoords,
  };
  return mesh;
};

export { createClothMesh };
