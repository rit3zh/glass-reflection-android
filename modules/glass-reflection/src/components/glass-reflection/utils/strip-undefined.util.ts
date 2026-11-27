const stripUndefined = <T extends object>(value: T) => {
  const out: Partial<T> = {};
  for (const key in value) {
    if (value[key] !== undefined) out[key] = value[key];
  }
  return out;
};

export { stripUndefined };
