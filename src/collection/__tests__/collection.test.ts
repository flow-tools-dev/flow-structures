import { describe, it, expect, vi } from 'vitest';
import { FlowCollection, isPlainObject } from '../index';

const mockEntries = [
  ['a', 1],
  ['b', 2],
] as const;

const mockObj = Object.fromEntries(mockEntries) as Record<'a' | 'b', 1 | 2>;
const mockSet = new Set(mockEntries);
const mockMap = new Map(mockEntries);

describe('FlowCollection', () => {
  describe('Constructor', () => {
    it('should create a collection with a Map', () => {
      const collection = new FlowCollection(mockMap);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create an empty collection', () => {
      const collection = new FlowCollection(new Map());
      expect(collection.size).toBe(0);
      expect(collection.isEmpty()).toBe(true);
    });
  });

  describe('of', () => {
    it('should create a collection from entries array', () => {
      const collection = FlowCollection.of(mockEntries);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create a collection from empty entries', () => {
      const collection = FlowCollection.of([]);
      expect(collection.isEmpty()).toBe(true);
    });

    it('should create a collection from an iterable', () => {
      const collection = FlowCollection.of(mockMap.entries());
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create a collection from an iterable Set', () => {
      const collection = FlowCollection.of(mockSet);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });
  });

  describe('isFlowCollection', () => {
    it('should return true for FlowCollection instances', () => {
      const collection = FlowCollection.of([]);
      expect(FlowCollection.isFlowCollection(collection)).toBe(true);
    });

    it('should return false for non-FlowCollection values', () => {
      expect(FlowCollection.isFlowCollection(new Map())).toBe(false);
      expect(FlowCollection.isFlowCollection([['a', 1]])).toBe(false);
      expect(FlowCollection.isFlowCollection({ a: 1 })).toBe(false);
      expect(FlowCollection.isFlowCollection(null)).toBe(false);
      expect(FlowCollection.isFlowCollection(undefined)).toBe(false);
      expect(FlowCollection.isFlowCollection('string')).toBe(false);
      expect(FlowCollection.isFlowCollection(123)).toBe(false);
    });
  });

  describe('from', () => {
    it('should create from an iterable of entries', () => {
      const collection = FlowCollection.from(mockEntries);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
    });

    it('should create from a plain object', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create from a Map', () => {
      const collection = FlowCollection.from(mockMap);
      expect(collection.get('a')).toBe(1);
    });

    it('should create from an empty object', () => {
      const collection = FlowCollection.from({} as Record<string, any>);
      expect(collection.isEmpty()).toBe(true);
    });
    it('should create from an empty array', () => {
      const collection = FlowCollection.from([]);
      expect(collection.isEmpty()).toBe(true);
    });
    it('should create from an empty Set', () => {
      const collection = FlowCollection.from(new Set());
      expect(collection.isEmpty()).toBe(true);
    });
  });

  describe('size', () => {
    it('should return the number of entries', () => {
      const collection = FlowCollection.from(mockEntries);
      expect(collection.size).toBe(2);
    });

    it('should return 0 for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.size).toBe(0);
    });

    it('should update size after set', () => {
      const collection = FlowCollection.of([['a', 1]]);
      expect(collection.size).toBe(1);
      collection.set('b', 2);
      expect(collection.size).toBe(2);
    });
  });

  describe('get', () => {
    it('should get a value by key', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should return undefined for missing keys', () => {
      const collection = FlowCollection.from<string, any>({});
      expect(collection.get('b')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should check if a key exists', () => {
      const collection = FlowCollection.from<string, number>(mockObj);
      expect(collection.has('a')).toBe(true);
      expect(collection.has('b')).toBe(true);
      expect(collection.has('c')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.isEmpty()).toBe(true);
    });

    it('should return false for non-empty collection', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const collection = FlowCollection.from(mockObj);
      collection.clear();
      expect(collection.isEmpty()).toBe(true);
    });
  });

  describe('set', () => {
    it('should set a value and return this for chaining', () => {
      const collection = FlowCollection.of([]);
      const result = collection.set('a', 1);
      expect(result).toBe(collection);
      expect(collection.get('a')).toBe(1);
    });

    it('should overwrite existing values', () => {
      const collection = FlowCollection.from<string, number>(mockObj);
      collection.set('a', 100);
      expect(collection.get('a')).toBe(100);
    });

    it('should allow chaining multiple sets', () => {
      const collection = FlowCollection.of([])
        .set('a', 1)
        .set('b', 2)
        .set('c', 3);
      expect(collection.size).toBe(3);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('c')).toBe(3);
    });
  });

  describe('delete', () => {
    it('should delete a key and return true if found', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.delete('a');
      expect(result).toBe(true);
      expect(collection.has('a')).toBe(false);
      expect(collection.size).toBe(1);
    });

    it('should return false for non-existent key', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 });
      const result = collection.delete('b');
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries and return this for chaining', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.clear();
      expect(result).toBe(collection);
      expect(collection.isEmpty()).toBe(true);
      expect(collection.size).toBe(0);
    });

    it('should be chainable', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 })
        .clear()
        .set('b', 2);
      expect(collection.size).toBe(1);
      expect(collection.get('b')).toBe(2);
    });
  });

  describe('with', () => {
    it('should return a new collection with the set value, and not modify the original', () => {
      const og = FlowCollection.from<string, number>(mockObj);
      const mod = og.with('c', 3);
      expect(mod).not.toBe(og);
      expect(og.size).toBe(2);
      expect(mod.size).toBe(3);
      expect(mod.get('c')).toBe(3);
      expect(og.get('c')).toBeUndefined();
    });
  });

  describe('without', () => {
    it('should return a new collection without the key, and not modify the original', () => {
      const og = FlowCollection.from({ ...mockObj, c: 3 });
      const mod = og.without('b');
      expect(mod).not.toBe(og);
      expect(og.size).toBe(3);
      expect(mod.size).toBe(2);
      expect(mod.has('b')).toBe(false);
      expect(og.has('b')).toBe(true);
    });

    it('should handle missing keys gracefully', () => {
      const original = FlowCollection.from<string, number>({ a: 1 });
      const modified = original.without('b');
      expect(modified.size).toBe(1);
      expect(modified.get('a')).toBe(1);
    });
  });

  describe('prepend', () => {
    it('should add entry at the beginning and return new collection', () => {
      const og = FlowCollection.from([
        ['b', 2],
        ['c', 3],
      ]);
      const modified = og.prepend('a', 1);
      expect(modified).not.toBe(og);
      const entries = [...modified.entries()];
      expect(entries[0]).toEqual(['a', 1]);
      expect(entries[1]).toEqual(['b', 2]);
    });

    it('should preserve insertion order when prepending', () => {
      const collection = FlowCollection.of([
        ['c', 3],
        ['d', 4],
      ])
        .prepend('b', 2)
        .prepend('a', 1);
      const keys = [...collection.keys()];
      expect(keys).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should move the prepended value to the front if it already exists', () => {
      const collection = FlowCollection.of([
        ['c', 3],
        ['d', 4],
      ])
        .prepend('b', 2)
        .prepend('d', 1);
      const keys = [...collection.keys()];
      expect(keys).toEqual(['d', 'b', 'c']);
    });

    it('should not modify the original', () => {
      const og = FlowCollection.from<string, number>({ a: 1 });
      og.prepend('b', 2);
      expect(og.size).toBe(1);
    });
  });

  describe('find', () => {
    it('should find first value matching predicate', () => {
      const collection = FlowCollection.from({ ...mockObj, c: 3, d: 4 });
      const result = collection.find((v) => v > 2);
      expect(result).toBe(3);
    });

    it('should return undefined if no match found', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.find((v) => v > 10)).toBeUndefined();
    });
  });

  describe('findLast', () => {
    it('should find last value matching predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 5 });
      const result = collection.findLast((v) => typeof v === 'number');
      expect(result).toBe(5);
    });

    it('should return undefined if no match found', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.findLast((v) => v > 10)).toBeUndefined();
    });
  });

  describe('filter', () => {
    it('should filter entries by predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.filter((v) => v > 2);
      expect(result.size).toBe(2);
      expect(result.get('c')).toBe(3);
      expect(result.get('d')).toBe(4);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1, b: 2 });
      const filtered = original.filter(() => true);
      expect(filtered).not.toBe(original);
    });

    it('should return empty collection if no matches', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.filter(() => false);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('reject', () => {
    it('should reject entries by predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.reject((v) => v > 2);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1, b: 2 });
      const rejected = original.reject(() => false);
      expect(rejected).not.toBe(original);
    });

    it('should return all entries if nothing is rejected', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.reject(() => false);
      expect(result.size).toBe(2);
    });
  });

  describe('includes', () => {
    it('should check if value is in collection', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      expect(collection.includes(2)).toBe(true);
      expect(collection.includes(5)).toBe(false);
    });

    it('should use strict equality', () => {
      const collection = FlowCollection.from({ a: '1', b: 2 });
      expect(collection.includes('1')).toBe(true);
      expect(collection.includes(1)).toBe(false);
    });

    it('should return false for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.includes(1)).toBe(false);
    });
  });

  describe('every', () => {
    it('should return true if all values match predicate', () => {
      const collection = FlowCollection.from({ a: 2, b: 4, c: 6 });
      expect(collection.every((v) => v % 2 === 0)).toBe(true);
    });

    it('should return false if any value does not match', () => {
      const collection = FlowCollection.from({ a: 2, b: 3, c: 4 });
      expect(collection.every((v) => v % 2 === 0)).toBe(false);
    });

    it('should return true for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.every(() => false)).toBe(true);
    });
  });

  describe('some', () => {
    it('should return true if any value matches predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      expect(collection.some((v) => v > 2)).toBe(true);
    });

    it('should return false if no value matches', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.some((v) => v > 10)).toBe(false);
    });

    it('should return false for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.some(() => true)).toBe(false);
    });
  });

  describe('map', () => {
    it('should map values to new collection', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.map((v) => v * 2);
      expect(result.get('a')).toBe(2);
      expect(result.get('b')).toBe(4);
      expect(result.get('c')).toBe(6);
    });

    it('should preserve keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.map((v) => v * 10);
      expect(result.has('a')).toBe(true);
      expect(result.has('b')).toBe(true);
    });

    it('should return new collection', () => {
      const og = FlowCollection.from(mockObj);
      const mapped = og.map((v) => v);
      expect(mapped).not.toBe(og);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.map((v: any) => v * 2);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('mapEntries', () => {
    it('should map entries to new key-value pairs', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.mapEntries((v, k) => [k.toUpperCase(), v * 10]);
      expect(result.get('A')).toBe(10);
      expect(result.get('B')).toBe(20);
    });

    it('should allow changing keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.mapEntries((v) => [`key${v}`, v * 2]);
      expect(result.get('key1')).toBe(2);
      expect(result.get('key2')).toBe(4);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const mapped = original.mapEntries((v, k) => [k, v]);
      expect(mapped).not.toBe(original);
    });
  });

  describe('mapKeys', () => {
    it('transforms keys while preserving values', () => {
      const col = FlowCollection.from(mockObj);
      expect(col.mapKeys((_, k) => String(k).toUpperCase()).toObject()).toEqual(
        { A: 1, B: 2 },
      );
    });

    it('does not mutate the original', () => {
      const col = FlowCollection.from({ a: 1, b: 2 });
      col.mapKeys((_, k) => String(k).toUpperCase());
      expect(col.toObject()).toEqual({ a: 1, b: 2 });
    });
  });

  describe('flatMap', () => {
    it('should flatten mapped results with an object source', () => {
      const collection = FlowCollection.from<string, number>(mockObj);
      const result = collection.flatMap<string, number>((v, k) => ({
        [k + k]: v + v,
      }));
      expect(result.toObject()).toEqual({
        aa: 2,
        bb: 4,
      });
    });

    it('should flatten mapped results with a map source', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.flatMap<string, number>(
        (v, k) => new Map([[k + k, v + v]]),
      );
      expect(result.toObject()).toEqual({
        aa: 2,
        bb: 4,
      });
    });

    it('should flatten mapped results with an array/iterable source', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.flatMap<string, number>((v, k) => [
        [k + k, v + v],
      ]);
      expect(result.toObject()).toEqual({
        aa: 2,
        bb: 4,
      });
    });

    it('should flatten mapped results with a Flow Collection source', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.flatMap<string, number>((v, k) =>
        FlowCollection.from([[k + k, v + v]]),
      );
      expect(result.toObject()).toEqual({
        aa: 2,
        bb: 4,
      });
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const flatMapped = original.flatMap((v) => [[`k`, v]]);
      expect(flatMapped).not.toBe(original);
    });
  });

  describe('partition', () => {
    it('should partition into truthy and falsy arrays', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.partition((v) => v > 2);
      const truthy = result.get(true);
      const falsy = result.get(false);
      expect(truthy).toEqual([3, 4]);
      expect(falsy).toEqual([1, 2]);
    });

    it('should return collection with boolean keys', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.partition((v) => v > 0);
      expect(result.size).toBe(2);
      expect(result.has(true)).toBe(true);
      expect(result.has(false)).toBe(true);
    });

    it('should handle all matching values', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.partition(() => true);
      expect(result.get(true)).toEqual([1, 2]);
      expect(result.get(false)).toEqual([]);
    });

    it('should handle no matching values', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.partition(() => false);
      expect(result.get(true)).toEqual([]);
      expect(result.get(false)).toEqual([1, 2]);
    });
  });

  describe('groupBy', () => {
    it('should group values by key', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 2 });
      const result = collection.groupBy((v) => (v % 2 === 0 ? 'even' : 'odd'));
      expect(result.get('odd')).toEqual([1, 3]);
      expect(result.get('even')).toEqual([2, 2]);
    });

    it('should work with numeric grouping keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.groupBy((v) => v * 10);
      expect(result.get(10)).toEqual([1]);
      expect(result.get(20)).toEqual([2]);
    });
  });

  describe('tally', () => {
    it('should count values matching predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      expect(collection.tally((v) => v > 2)).toBe(2);
    });

    it('should return 0 if no matches', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.tally((v) => v > 10)).toBe(0);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.tally(() => true)).toBe(0);
    });
  });

  describe('forEach', () => {
    it('should iterate over all entries', () => {
      const collection = FlowCollection.from(mockObj);
      const entries: Array<[string, number]> = [];
      collection.forEach((v, k) => {
        entries.push([k, v]);
      });
      expect(entries.length).toBe(2);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
    });

    it('should work on empty collection', () => {
      const mock = vi.fn();
      const collection = FlowCollection.of([]);
      collection.forEach(mock);
      expect(mock).not.toHaveBeenCalled();
    });
  });

  describe('forEachRight', () => {
    it('should iterate over all entries from right to left.', () => {
      const collection = FlowCollection.from(mockObj);
      const entries: Array<[string, number]> = [];
      collection.forEachRight((v, k) => {
        entries.push([k, v]);
      });
      expect(entries.length).toBe(2);
      expect(entries[0]).toEqual(['b', 2]);
      expect(entries[1]).toEqual(['a', 1]);
    });

    it('should work on empty collection', () => {
      const mock = vi.fn();
      const collection = FlowCollection.of([]);
      collection.forEachRight(mock);
      expect(mock).not.toHaveBeenCalled();
    });
  });

  describe('reduce', () => {
    it('iterates over the collection, and returns out the returns of the iteration', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.reduce((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [] as any[]);
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('reduceRight', () => {
    it('iterates over the collection, and returns out the returns of the iteration', () => {
      const collection = FlowCollection.from(mockObj);
      const result = collection.reduceRight((acc, curr) => {
        acc.push(curr);
        return acc;
      }, [] as any[]);
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([2, 1]);
    });
  });

  describe('keys', () => {
    it('should return an iterator of keys', () => {
      const collection = FlowCollection.from(mockObj);
      const keys = [...collection.keys()];
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys.length).toBe(2);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const keys = [...collection.keys()];
      expect(keys).toEqual([]);
    });
  });

  describe('values', () => {
    it('should return an iterator of values', () => {
      const collection = FlowCollection.from(mockObj);
      const values = [...collection.values()];
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values.length).toBe(2);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const values = Array.from(collection.values());
      expect(values).toEqual([]);
    });
  });

  describe('entries', () => {
    it('should return an iterator of entries', () => {
      const collection = FlowCollection.from(mockObj);
      const entries = [...collection.entries()];
      expect(entries).toEqual([
        ['a', 1],
        ['b', 2],
      ]);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const entries = Array.from(collection.entries());
      expect(entries).toEqual([]);
    });
  });

  describe('sortBy', () => {
    it('should sort by numeric value', () => {
      const collection = FlowCollection.from({ a: 3, b: 1, c: 2 });
      const result = collection.sortBy((v) => v);
      expect(result.toValues()).toEqual([1, 2, 3]);
    });

    it('should sort by string value', () => {
      const collection = FlowCollection.from({
        a: 'charlie',
        b: 'alice',
        c: 'bob',
      });
      const result = collection.sortBy((v) => v);
      expect(result.toValues()).toEqual(['alice', 'bob', 'charlie']);
    });

    it('should sort by boolean value', () => {
      const collection = FlowCollection.from({ a: true, b: false, c: true });
      const result = collection.sortBy((v) => v);
      expect(result.toValues()).toEqual([false, true, true]);
    });

    it('should maintain order of equal elements', () => {
      const collection = FlowCollection.of([
        ['a', 1],
        ['b', 2],
        ['c', 2],
        ['d', 1],
      ]);
      const result = collection.sortBy((v) => v);
      const keys = [...result.keys()];
      expect(keys[0]).toBe('a');
      expect(keys[1]).toBe('d');
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 3, b: 1 });
      const sorted = original.sortBy((v) => v);
      expect(sorted).not.toBe(original);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.sortBy(() => 0);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('sortWith', () => {
    it('should sort with custom comparator', () => {
      const collection = FlowCollection.from({ a: 3, b: 1, c: 2 });
      const result = collection.sortWith((a, b) => a[1] - b[1]);
      expect(result.toValues()).toEqual([1, 2, 3]);
    });

    it('should sort in reverse order with custom comparator', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.sortWith((a, b) => b[1] - a[1]);
      const values = Array.from(result.values());
      expect(values).toEqual([3, 2, 1]);
    });

    it('should allow sorting by key', () => {
      const collection = FlowCollection.of([
        ['c', 1],
        ['a', 2],
        ['b', 3],
      ]);
      const result = collection.sortWith((a, b) => a[0].localeCompare(b[0]));
      expect(result.toKeys()).toEqual(['a', 'b', 'c']);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 3, b: 1 });
      const sorted = original.sortWith(() => 0);
      expect(sorted).not.toBe(original);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.sortWith(() => 0);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('invert', () => {
    it('should swap keys and values', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.invert();
      expect(result.get(1)).toBe('a');
      expect(result.get(2)).toBe('b');
      expect(result.get(3)).toBe('c');
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const inverted = original.invert();
      expect(inverted).not.toBe(original);
    });

    it('should handle duplicate values by using last', () => {
      const collection = FlowCollection.of([
        ['a', 'same'],
        ['b', 'same'],
      ]);
      const result = collection.invert();
      expect(result.size).toBe(1);
      expect(result.get('same')).toBe('b');
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.invert();
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.pick(['a', 'c']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
      expect(result.get('c')).toBe(3);
      expect(result.has('b')).toBe(false);
    });

    it('should handle missing keys gracefully', () => {
      const collection = FlowCollection.from<string, number>({ a: 1, b: 2 });
      const result = collection.pick(['a', 'c', 'd']);
      expect(result.size).toBe(1);
      expect(result.get('a')).toBe(1);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const picked = original.pick(['a']);
      expect(picked).not.toBe(original);
    });

    it('should handle empty pick array', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.pick([]);
      expect(result.isEmpty()).toBe(true);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.pick(['a']);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.omit(['b', 'd']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
      expect(result.get('c')).toBe(3);
      expect(result.has('b')).toBe(false);
    });

    it('should handle non-existent keys gracefully', () => {
      const collection = FlowCollection.from<string, number>({ a: 1, b: 2 });
      const result = collection.omit(['c', 'd']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
    });

    it('should return new collection', () => {
      const og = FlowCollection.from<string, number>({ a: 1 });
      const omitted = og.omit(['b']);
      expect(omitted).not.toBe(og);
    });

    it('should handle empty omit array', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.omit([]);
      expect(result.size).toBe(2);
    });

    it('should omit all entries if array matches all keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.omit(['a', 'b']);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('merge', () => {
    it('should merge with iterable source', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 });
      const result = collection.merge([
        ['b', 2],
        ['c', 3],
      ]);
      expect(result.size).toBe(3);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should merge with object source', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 });
      const result = collection.merge({ b: 2, c: 3 });
      expect(result.size).toBe(3);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should merge multiple sources', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 });
      const result = collection.merge(
        { b: 2 },
        [['c', 3]],
        new Map([['d', 4]]),
      );
      expect(result.size).toBe(4);
      expect(result.get('a')).toBe(1);
      expect(result.get('d')).toBe(4);
    });

    it('should overwrite existing keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.merge({ b: 20, c: 3 });
      expect(result.get('b')).toBe(20);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const merged = original.merge({ b: 2 });
      expect(merged).not.toBe(original);
      expect(original.size).toBe(1);
    });

    it('should work with no merge sources', () => {
      const original = FlowCollection.from({ a: 1 });
      const merged = original.merge();
      expect(merged.size).toBe(1);
      expect(merged.get('a')).toBe(1);
    });

    it('should handle empty merge sources', () => {
      const collection = FlowCollection.from<string, number>({ a: 1 });
      const result = collection.merge({}, []);
      expect(result.size).toBe(1);
      expect(result.get('a')).toBe(1);
    });

    it('should merge source overwrites in order', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.merge({ a: 10 }, [['a', 100]]);
      expect(result.get('a')).toBe(100);
    });
  });

  describe('tap', () => {
    it('should iterate, and call the callback on each element, then return out the collection unchanged.', () => {
      const collection = FlowCollection.from(mockObj);
      const mock = vi.fn();
      const newColl = collection.tap(mock);
      expect(mock).toHaveBeenCalled();
      expect(collection).toBe(newColl);
    });
  });

  describe('peek', () => {
    it('calls a function passing in the collection', () => {
      const collection = FlowCollection.from(mockObj);
      const mock = vi.fn();
      collection.peek(mock);
      expect(mock).toHaveBeenCalled();
    });
  });

  describe('thru', () => {
    it('calls a function passing in the collection, and returns whatever that function returns', () => {
      const collection = FlowCollection.from(mockObj);
      const toArr = () => [];
      const newColl = collection.thru(toArr);
      expect(newColl).toEqual([]);
    });
  });

  describe('inspect', () => {
    it('logs the current collecion', () => {
      const mockLog = vi.spyOn(console, 'log');
      const collection = FlowCollection.from(mockObj);
      collection.inspect();
      expect(mockLog).toHaveBeenCalled();
    });
  });

  describe('toMap', () => {
    it('returns out a Map', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.toMap()).toBeInstanceOf(Map);
    });
  });

  describe('toObject', () => {
    it('returns out an Object', () => {
      const collection = FlowCollection.from({});
      expect(collection.toObject()).toEqual({});
    });
  });

  describe('toEntries', () => {
    it('returns out an entries array', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.toEntries()).toBeInstanceOf(Array);
      expect(collection.toEntries()[0]).toEqual(['a', 1]);
    });
  });

  describe('toValues', () => {
    it('returns out an array of values', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.toValues()).toEqual([1, 2]);
    });
  });

  describe('toKeys', () => {
    it('returns out an array of the keys', () => {
      const collection = FlowCollection.from(mockObj);
      expect(collection.toKeys()).toEqual(['a', 'b']);
    });
  });
});

describe('utils', () => {
  describe('isPlainObject', () => {
    it('is true for object', () => {
      expect(isPlainObject({})).toBeTruthy();
    });
    it('is false for everything else', () => {
      [
        '',
        0,
        [],
        new Map(),
        new Set(),
        Infinity,
        null,
        undefined,
        true,
        false,
        new FlowCollection(),
      ].forEach((v) => expect(isPlainObject(v)).toBeFalsy());
    });
  });
});
