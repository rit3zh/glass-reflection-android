const springProgress = (time: number, omega: number, zeta: number) => {
  "worklet";
  if (time <= 0) return 0;
  if (zeta >= 1) return 1 - Math.exp(-omega * time) * (1 + omega * time);
  const damped = omega * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * omega * time);
  return (
    1 - decay * (Math.cos(damped * time) + ((zeta * omega) / damped) * Math.sin(damped * time))
  );
};

export { springProgress };
