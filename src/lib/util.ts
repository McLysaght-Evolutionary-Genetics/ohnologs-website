export const isNotVoid = (v: T): v is Exclude<typeof v, void> => {
  return !(v instanceof Object);
};
