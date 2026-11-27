const CLOTH_ACTIVE_OFFSET = 10;
const CLOTH_FAIL_OFFSET = 15;
const CLOTH_SEG_X = 14;
const CLOTH_SEG_Y = 16;
const CLOTH_CARD_ASPECT = 0.7;
const CLOTH_CARD_WIDTH_RATIO = 0.6;
const CLOTH_TABLET_CARD_WIDTH_RATIO = 0.34;
const CLOTH_CARD_MAX_WIDTH = 380;
const CLOTH_CARD_MIN_WIDTH = 120;
const CLOTH_CARD_RADIUS = 26;
const CLOTH_CARD_PITCH = 1.1;
const CLOTH_BAND_RATIO = 1.32;
const CLOTH_EDGE_MARGIN = 1.5;
const CLOTH_RESERVED_HEIGHT = 250;
const CLOTH_TABLET_RESERVED_HEIGHT = 270;
const CLOTH_HALF_FOV = (9.5 * Math.PI) / 180;

const CLOTH_REST_TILT: number[] = [-3, 4, -2.5, 5.5, -4, 3, -5, 2.5];
const CLOTH_REST_DROP: number[] = [
  0.04, -0.04, 0.06, -0.05, 0.02, 0.05, -0.04, 0.02,
];

const CLOTH_STIFFNESS = 150;
const CLOTH_EDGE_SOFTNESS = 0.88;
const CLOTH_COUPLING = 560;
const CLOTH_DAMPING = 4.4;
const CLOTH_FOLD_LIMIT = 0.42;
const CLOTH_SCALE_BASE = 260;

const CLOTH_ROW_TRAIL = 1.3;
const CLOTH_ROW_ACCEL_TRAIL = 0.12;
const CLOTH_ROW_LIFT = 0.35;
const CLOTH_ROW_FLUTTER = 6.5;
const CLOTH_ROW_YAW = 1.1;
const CLOTH_ROW_MAX_SPEED = 4200;

const CLOTH_TOUCH_RADIUS = 0.32;
const CLOTH_TOUCH_BRUSH = 4.5;
const CLOTH_TOUCH_RIPPLE = 26;
const CLOTH_TOUCH_MAX_SPEED = 2600;
const CLOTH_TOUCH_POKE = 1400;
const CLOTH_TOUCH_DECAY = 7;
const CLOTH_TOUCH_MIN_SPEED = 20;
const CLOTH_TOUCH_REACH = 0.75;

const CLOTH_SPRING_FREE = 8;
const CLOTH_DRAG_SMOOTHING = 30;
const CLOTH_FLING = 0.22;
const CLOTH_MAX_FLING_VELOCITY = 3000;
const CLOTH_SETTLE_EPSILON = 0.05;

const CLOTH_STEP_DT = 1 / 60;
const CLOTH_MAX_FRAME = 0.05;
const CLOTH_AWAKE_THRESHOLD = 0.02;
const CLOTH_MOVING_SPEED = 4;
const CLOTH_MOVING_ACCEL = 40;
const CLOTH_VISIBLE_MARGIN = 0.8;
const CLOTH_HIGH_REFRESH = 0.8;

const CLOTH_SHADE_MIN = 0.38;
const CLOTH_SHADE_MAX = 1.12;
const CLOTH_LIGHT: number[] = [0.35, 0.55, 1];

const CLOTH_APPEAR_DURATION = 0.6;
const CLOTH_APPEAR_STAGGER = 0.28;
const CLOTH_APPEAR_RISE = 0.12;
const CLOTH_ENTRY_KICK_Y = 260;
const CLOTH_ENTRY_KICK_Z = 520;

const CLOTH_SHADER_SOURCE = /*glsl*/ `
uniform shader image;
uniform float2 size;
uniform float4 crop;
uniform float radius;

half4 main(float2 p) {
  float2 q = abs(p - size * 0.5) - (size * 0.5 - radius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  float a = clamp(0.5 - d, 0.0, 1.0);
  return image.eval(crop.xy + clamp(p, float2(0.0), size) * crop.zw / size) * a;
}
`;

const CLOTH_FOLD_SHADER_SOURCE = /*glsl*/ `
uniform shader image;
uniform shader shade;
uniform float2 size;
uniform float4 crop;
uniform float radius;
uniform float2 grid;
uniform float2 full;
uniform float margin;
uniform float row;
uniform float base;
uniform float range;

half4 main(float2 p) {
  float2 q = abs(p - size * 0.5) - (size * 0.5 - radius);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  float a = clamp(0.5 - d, 0.0, 1.0);
  half4 c = image.eval(crop.xy + clamp(p, float2(0.0), size) * crop.zw / size) * a;
  float2 g = clamp((p + margin) / full, 0.0, 1.0) * grid + 0.5;
  float s = base + range * shade.eval(float2(g.x, g.y + row)).r;
  return half4(min(c.rgb * s, half3(c.a)), c.a);
}
`;

export {
  CLOTH_ACTIVE_OFFSET,
  CLOTH_APPEAR_DURATION,
  CLOTH_APPEAR_RISE,
  CLOTH_APPEAR_STAGGER,
  CLOTH_AWAKE_THRESHOLD,
  CLOTH_BAND_RATIO,
  CLOTH_CARD_ASPECT,
  CLOTH_CARD_MAX_WIDTH,
  CLOTH_CARD_MIN_WIDTH,
  CLOTH_CARD_PITCH,
  CLOTH_CARD_RADIUS,
  CLOTH_CARD_WIDTH_RATIO,
  CLOTH_COUPLING,
  CLOTH_DAMPING,
  CLOTH_DRAG_SMOOTHING,
  CLOTH_EDGE_MARGIN,
  CLOTH_EDGE_SOFTNESS,
  CLOTH_ENTRY_KICK_Y,
  CLOTH_ENTRY_KICK_Z,
  CLOTH_FAIL_OFFSET,
  CLOTH_FLING,
  CLOTH_FOLD_LIMIT,
  CLOTH_FOLD_SHADER_SOURCE,
  CLOTH_HALF_FOV,
  CLOTH_HIGH_REFRESH,
  CLOTH_LIGHT,
  CLOTH_MAX_FLING_VELOCITY,
  CLOTH_MAX_FRAME,
  CLOTH_MOVING_ACCEL,
  CLOTH_MOVING_SPEED,
  CLOTH_RESERVED_HEIGHT,
  CLOTH_REST_DROP,
  CLOTH_REST_TILT,
  CLOTH_ROW_ACCEL_TRAIL,
  CLOTH_ROW_FLUTTER,
  CLOTH_ROW_LIFT,
  CLOTH_ROW_MAX_SPEED,
  CLOTH_ROW_TRAIL,
  CLOTH_ROW_YAW,
  CLOTH_SCALE_BASE,
  CLOTH_SEG_X,
  CLOTH_SEG_Y,
  CLOTH_SETTLE_EPSILON,
  CLOTH_SHADE_MAX,
  CLOTH_SHADE_MIN,
  CLOTH_SHADER_SOURCE,
  CLOTH_SPRING_FREE,
  CLOTH_STEP_DT,
  CLOTH_STIFFNESS,
  CLOTH_TABLET_CARD_WIDTH_RATIO,
  CLOTH_TABLET_RESERVED_HEIGHT,
  CLOTH_TOUCH_BRUSH,
  CLOTH_TOUCH_DECAY,
  CLOTH_TOUCH_MAX_SPEED,
  CLOTH_TOUCH_MIN_SPEED,
  CLOTH_TOUCH_POKE,
  CLOTH_TOUCH_RADIUS,
  CLOTH_TOUCH_REACH,
  CLOTH_TOUCH_RIPPLE,
  CLOTH_VISIBLE_MARGIN,
};
