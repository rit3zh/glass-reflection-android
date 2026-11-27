const getEdgeWeight = (u: number, v: number) => {
  "worklet";
  const x = Math.abs(u - 0.5) * 2;
  const y = Math.abs(v - 0.5) * 2;
  return Math.min(1, 0.78 * Math.pow(x, 1.4) + 0.32 * y * y);
};

export { getEdgeWeight };
