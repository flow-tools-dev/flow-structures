export const isFunction = (fn: unknown): fn is Function =>
  typeof fn === 'function';

export const resolveIfFn =
  <T, K>(pOrF: keyof T | ((item: T) => K)) =>
  (v: T): K =>
    isFunction(pOrF) ? pOrF(v) : (v[pOrF] as unknown as K);

export const isPlainObject = (
  value: unknown,
): value is Record<PropertyKey, any> => {
  if (typeof value !== 'object' || value === null) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};
