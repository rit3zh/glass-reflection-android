import {
  CLOTH_ENTRY_KICK_Y,
  CLOTH_ENTRY_KICK_Z,
  CLOTH_SCALE_BASE,
} from "@/constants/components/cloth-carousel.const";
import type { TClothCard, TClothMesh } from "../interface";

const kickCloth = (mesh: TClothMesh, card: TClothCard, cardWidth: number) => {
  "worklet";
  const scale = cardWidth / CLOTH_SCALE_BASE;
  for (let p = 0; p < mesh.n; p++) {
    const ep = mesh.edge[p];
    card.vel[p * 3 + 1] = CLOTH_ENTRY_KICK_Y * scale * ep;
    card.vel[p * 3 + 2] =
      CLOTH_ENTRY_KICK_Z * scale * ep * Math.sin(mesh.u[p] * 5.4 + mesh.v[p] * 2.2 + card.seed);
  }
  card.awake = 1;
};

export { kickCloth };
