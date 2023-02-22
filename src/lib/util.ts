export const rnumber = (max: number) => Math.floor(Math.random() * max);

export const isNotVoid = (v: T): v is Exclude<typeof v, void> => {
  return !(v instanceof Object);
};
