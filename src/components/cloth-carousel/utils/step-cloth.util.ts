import {
  CLOTH_COUPLING,
  CLOTH_DAMPING,
  CLOTH_FOLD_LIMIT,
  CLOTH_ROW_ACCEL_TRAIL,
  CLOTH_ROW_FLUTTER,
  CLOTH_ROW_LIFT,
  CLOTH_ROW_MAX_SPEED,
  CLOTH_ROW_TRAIL,
  CLOTH_ROW_YAW,
  CLOTH_SCALE_BASE,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_TOUCH_BRUSH,
  CLOTH_TOUCH_RADIUS,
} from "@/constants/components/cloth-carousel.const";
import type { TClothCard, TClothForces, TClothMesh } from "../interface";

const stepCloth = (mesh: TClothMesh, card: TClothCard, dt: number, f: TClothForces) => {
  "worklet";
  const { n, u, v, edge, stiffness, rowSin, rowCos, colSin, colCos, colLift } = mesh;
  const { off, vel } = card;
  const cols = CLOTH_SEG_X + 1;
  const row = cols * 3;
  const speed = Math.min(Math.abs(f.vx), CLOTH_ROW_MAX_SPEED);
  const dir = f.vx < 0 ? -1 : 1;
  const flutter = CLOTH_ROW_FLUTTER * speed * (f.width / CLOTH_SCALE_BASE);
  const lift = CLOTH_ROW_LIFT * speed;
  const trailX = -CLOTH_ROW_TRAIL * f.vx - CLOTH_ROW_ACCEL_TRAIL * f.ax;
  const yaw = CLOTH_ROW_YAW * f.vx * 2;
  const radius = f.width * CLOTH_TOUCH_RADIUS;
  const inverseRadius2 = 1 / (radius * radius);
  const touching = f.hf > 0;

  for (let i = 0; i < cols; i++) {
    const phase = (5.4 * i * dir) / CLOTH_SEG_X - f.t * 9.5 + f.seed;
    colSin[i] = Math.sin(phase);
    colCos[i] = Math.cos(phase);
    colLift[i] = lift * Math.sin((5.2 * i) / CLOTH_SEG_X + f.t * 7 + f.seed);
  }

  let energy = 0;
  for (let j = 0; j <= CLOTH_SEG_Y; j++) {
    const sinB = rowSin[j];
    const cosB = rowCos[j];
    for (let i = 0; i < cols; i++) {
      const p = j * cols + i;
      const x3 = p * 3;
      const ox = off[x3];
      const oy = off[x3 + 1];
      const oz = off[x3 + 2];
      let sx = 0;
      let sy = 0;
      let sz = 0;
      let degree = 0;
      if (i > 0) {
        sx += off[x3 - 3];
        sy += off[x3 - 2];
        sz += off[x3 - 1];
        degree++;
      }
      if (i < CLOTH_SEG_X) {
        sx += off[x3 + 3];
        sy += off[x3 + 4];
        sz += off[x3 + 5];
        degree++;
      }
      if (j > 0) {
        sx += off[x3 - row];
        sy += off[x3 - row + 1];
        sz += off[x3 - row + 2];
        degree++;
      }
      if (j < CLOTH_SEG_Y) {
        sx += off[x3 + row];
        sy += off[x3 + row + 1];
        sz += off[x3 + row + 2];
        degree++;
      }
      const ep = edge[p];
      const kp = stiffness[p];
      const vx = vel[x3];
      const vy = vel[x3 + 1];
      const vz = vel[x3 + 2];
      let ax = -kp * ox + CLOTH_COUPLING * (sx - degree * ox) - CLOTH_DAMPING * vx + trailX * ep;
      let ay =
        -kp * oy + CLOTH_COUPLING * (sy - degree * oy) - CLOTH_DAMPING * vy + colLift[i] * ep;
      let az =
        -kp * oz +
        CLOTH_COUPLING * (sz - degree * oz) -
        CLOTH_DAMPING * vz +
        flutter * ep * (colSin[i] * cosB + colCos[i] * sinB) +
        yaw * (u[p] - 0.5);
      if (touching) {
        const dx = (u[p] - 0.5) * f.width - f.hx;
        const dy = (0.5 - v[p]) * f.height - f.hy;
        const d2 = (dx * dx + dy * dy) * inverseRadius2;
        if (d2 < 6) {
          const g = Math.exp(-d2) * (0.35 + ep);
          ax += f.hvx * CLOTH_TOUCH_BRUSH * g;
          ay += f.hvy * CLOTH_TOUCH_BRUSH * g;
          az += f.hf * g * Math.sin(Math.sqrt(d2) * 5 - f.t * 13);
        }
      }
      const nx = vx + ax * dt;
      const ny = vy + ay * dt;
      const nz = vz + az * dt;
      vel[x3] = nx;
      vel[x3 + 1] = ny;
      vel[x3 + 2] = nz;
      energy += nx * nx + ny * ny + nz * nz;
    }
  }

  const limit = f.width * CLOTH_FOLD_LIMIT;
  const length = n * 3;
  for (let q = 0; q < length; q++) {
    let o = off[q] + vel[q] * dt;
    if (o > limit) {
      o = limit;
      vel[q] *= 0.5;
    } else if (o < -limit) {
      o = -limit;
      vel[q] *= 0.5;
    }
    off[q] = o;
    energy += o * o * 0.5;
  }
  card.awake = energy / n;
};

const settleCloth = (card: TClothCard) => {
  "worklet";
  card.off.fill(0);
  card.vel.fill(0);
  card.awake = 0;
};

export { settleCloth, stepCloth };
