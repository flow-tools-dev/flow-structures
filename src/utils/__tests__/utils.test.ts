import { describe, it, expect } from 'vitest';
import { isFunction, resolveIfFn, isPlainObject } from '../index';

describe('utils', () => {
  describe('isFunction', () => {
    it('returns true for functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(async () => {})).toBe(true);
      expect(isFunction(function named() {})).toBe(true);
    });

    it('returns false for non-function values', () => {
      expect(isFunction(123)).toBe(false);
      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
      expect(isFunction('fn')).toBe(false);
    });
  });

  describe('resolveIfFn', () => {
    it('resolves a property key', () => {
      const item = { foo: 5 };
      expect(resolveIfFn('foo')(item)).toBe(5);
    });

    it('resolves a callback function', () => {
      const item = { foo: 5 };
      expect(resolveIfFn((x: { foo: number }) => x.foo * 2)(item)).toBe(10);
    });
  });

  describe('isPlainObject', () => {
    it('returns true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it('returns false for arrays, maps, and non-objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Map())).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(() => {})).toBe(false);
    });
  });
});
