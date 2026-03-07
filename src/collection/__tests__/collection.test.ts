import { describe, it, expect } from 'vitest';
import { FlowCollection, type Entry, type Source } from '../index';

describe('FlowCollection', () => {
  // ==================== Constructor & Static Methods ====================
  describe('Constructor', () => {
    it('should create a collection with a Map', () => {
      const map = new Map([
        ['a', 1],
        ['b', 2],
      ]);
      const collection = new FlowCollection(map);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
    });

    it('should create an empty collection', () => {
      const map = new Map();
      const collection = new FlowCollection(map);
      expect(collection.size).toBe(0);
      expect(collection.isEmpty()).toBe(true);
    });
  });

  describe('static of()', () => {
    it('should create a collection from entries array', () => {
      const entries: [string, number][] = [
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ];
      const collection = FlowCollection.of(entries);
      expect(collection.size).toBe(3);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create a collection from empty entries', () => {
      const collection = FlowCollection.of([]);
      expect(collection.isEmpty()).toBe(true);
    });

    it('should create a collection from an iterable', () => {
      const map = new Map([
        ['x', 10],
        ['y', 20],
      ]);
      const collection = FlowCollection.of(map.entries());
      expect(collection.get('x')).toBe(10);
      expect(collection.get('y')).toBe(20);
    });

    it('should create a collection from an iterable Set', () => {
      const set = new Set<[string, number]>([
        ['x', 10],
        ['y', 20],
      ]);
      const collection = FlowCollection.of(set);
      expect(collection.get('x')).toBe(10);
      expect(collection.get('y')).toBe(20);
    });
  });

  describe('static isFlowCollection()', () => {
    it('should return true for FlowCollection instances', () => {
      const collection = FlowCollection.of([['a', 1]]);
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

  describe('static from()', () => {
    it('should create from an iterable of entries', () => {
      const entries: Entry<string, number>[] = [
        ['a', 1],
        ['b', 2],
      ];
      const collection = FlowCollection.from(entries);
      expect(collection.size).toBe(2);
      expect(collection.get('a')).toBe(1);
    });

    it('should create from a plain object', () => {
      const obj: Record<string, number> = { a: 1, b: 2, c: 3 };
      const collection = FlowCollection.from(obj);
      expect(collection.size).toBe(3);
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should create from a Map', () => {
      const map = new Map([
        ['a', 10],
        ['b', 20],
      ]);
      const collection = FlowCollection.from(map);
      expect(collection.get('a')).toBe(10);
    });

    it('should create from an empty object', () => {
      const collection = FlowCollection.from({} as Record<string, any>);
      expect(collection.isEmpty()).toBe(true);
    });

    it('should handle numeric and other property keys from objects', () => {
      const obj = { 1: 'one', 2: 'two' } as Record<any, string>;
      const collection = FlowCollection.from(obj);
      expect(collection.get('1')).toBe('one');
      expect(collection.get('2')).toBe('two');
    });
  });

  // ==================== Basic Properties & Accessors ====================
  describe('size', () => {
    it('should return the number of entries', () => {
      const collection = FlowCollection.from([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]);
      expect(collection.size).toBe(3);
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

  describe('get()', () => {
    it('should get a value by key', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2);
    });

    it('should return undefined for missing keys', () => {
      const collection = FlowCollection.from({ a: 1 } as Record<
        string,
        number
      >);
      expect(collection.get('b')).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      const collection = FlowCollection.of([
        ['a', null],
        ['b', undefined],
      ]);
      expect(collection.get('a')).toBeNull();
      expect(collection.get('b')).toBeUndefined();
    });
  });

  describe('has()', () => {
    it('should check if a key exists', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.has('a')).toBe(true);
      expect(collection.has('b')).toBe(true);
      expect(collection.has('c')).toBe(false);
    });

    it('should return false for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.has('a')).toBe(false);
    });
  });

  // ==================== isEmpty ====================
  describe('isEmpty()', () => {
    it('should return true for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.isEmpty()).toBe(true);
    });

    it('should return false for non-empty collection', () => {
      const collection = FlowCollection.from({ a: 1 });
      expect(collection.isEmpty()).toBe(false);
    });

    it('should return true after clearing', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      collection.clear();
      expect(collection.isEmpty()).toBe(true);
    });
  });

  // ==================== Mutation Methods ====================
  describe('set()', () => {
    it('should set a value and return this for chaining', () => {
      const collection = FlowCollection.of([]);
      const result = collection.set('a', 1);
      expect(result).toBe(collection);
      expect(collection.get('a')).toBe(1);
    });

    it('should overwrite existing values', () => {
      const collection = FlowCollection.from({ a: 1 });
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

    it('should set null and undefined values', () => {
      const collection = FlowCollection.of([])
        .set('a', null)
        .set('b', undefined);
      expect(collection.get('a')).toBeNull();
      expect(collection.get('b')).toBeUndefined();
      expect(collection.size).toBe(2);
    });
  });

  describe('delete()', () => {
    it('should delete a key and return true if found', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.delete('a');
      expect(result).toBe(true);
      expect(collection.has('a')).toBe(false);
      expect(collection.size).toBe(1);
    });

    it('should return false for non-existent key', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.delete('b');
      expect(result).toBe(false);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.delete('a')).toBe(false);
    });
  });

  describe('clear()', () => {
    it('should remove all entries and return this for chaining', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.clear();
      expect(result).toBe(collection);
      expect(collection.isEmpty()).toBe(true);
      expect(collection.size).toBe(0);
    });

    it('should be chainable', () => {
      const collection = FlowCollection.from({ a: 1 }).clear().set('b', 2);
      expect(collection.size).toBe(1);
      expect(collection.get('b')).toBe(2);
    });
  });

  // ==================== Immutable Methods ====================
  describe('with()', () => {
    it('should return a new collection with the set value', () => {
      const original = FlowCollection.from({ a: 1, b: 2 });
      const modified = original.with('c', 3);
      expect(modified).not.toBe(original);
      expect(original.size).toBe(2);
      expect(modified.size).toBe(3);
      expect(modified.get('c')).toBe(3);
    });

    it('should create a new collection when overwriting', () => {
      const original = FlowCollection.from({ a: 1 });
      const modified = original.with('a', 100);
      expect(modified).not.toBe(original);
      expect(original.get('a')).toBe(1);
      expect(modified.get('a')).toBe(100);
    });

    it('should not modify the original', () => {
      const original = FlowCollection.from({ a: 1 });
      original.with('b', 2);
      expect(original.size).toBe(1);
      expect(original.has('b')).toBe(false);
    });
  });

  describe('without()', () => {
    it('should return a new collection without the key', () => {
      const original = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const modified = original.without('b');
      expect(modified).not.toBe(original);
      expect(original.size).toBe(3);
      expect(modified.size).toBe(2);
      expect(modified.has('b')).toBe(false);
    });

    it('should handle missing keys gracefully', () => {
      const original = FlowCollection.from({ a: 1 });
      const modified = original.without('b');
      expect(modified.size).toBe(1);
      expect(modified.get('a')).toBe(1);
    });

    it('should not modify the original', () => {
      const original = FlowCollection.from({ a: 1, b: 2 });
      original.without('a');
      expect(original.size).toBe(2);
      expect(original.has('a')).toBe(true);
    });
  });

  describe('prepend()', () => {
    it('should add entry at the beginning and return new collection', () => {
      const original = FlowCollection.from([
        ['b', 2],
        ['c', 3],
      ]);
      const modified = original.prepend('a', 1);
      expect(modified).not.toBe(original);
      const entries = Array.from(modified.entries());
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
      const keys = Array.from(collection.keys());
      expect(keys).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should work on empty collection', () => {
      const original = FlowCollection.of([]);
      const modified = original.prepend('a', 1);
      expect(modified.get('a')).toBe(1);
      expect(modified.size).toBe(1);
    });

    it('should not modify the original', () => {
      const original = FlowCollection.from({ a: 1 });
      original.prepend('b', 2);
      expect(original.size).toBe(1);
    });
  });

  // ==================== Search Methods ====================
  describe('find()', () => {
    it('should find first value matching predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.find((v) => v > 2);
      expect(result).toBe(3);
    });

    it('should return undefined if no match found', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.find((v) => v > 10)).toBeUndefined();
    });

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      let capturedKey: string | undefined;
      let capturedCollection: any;
      collection.find((v, k, c) => {
        capturedKey = k;
        capturedCollection = c;
        return v === 1;
      });
      expect(capturedKey).toBe('a');
      expect(capturedCollection).toBe(collection);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.find(() => true)).toBeUndefined();
    });
  });

  describe('findLast()', () => {
    it('should find last value matching predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 2 });
      const result = collection.findLast((v) => v === 2);
      expect(result).toBe(2);
    });

    it('should return undefined if no match found', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.findLast((v) => v > 10)).toBeUndefined();
    });

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      let lastKey: string | undefined;
      collection.findLast((v, k) => {
        if (v > 1) lastKey = k;
        return v > 1;
      });
      expect(lastKey).toBe('c');
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.findLast(() => true)).toBeUndefined();
    });
  });

  describe('filter()', () => {
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

    it('should work with key predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.filter((_, k) => k === 'b');
      expect(result.size).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should return empty collection if no matches', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.filter(() => false);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('reject()', () => {
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

    it('should work with key predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.reject((_, k) => k === 'b');
      expect(result.size).toBe(2);
      expect(result.has('b')).toBe(false);
    });

    it('should return all entries if nothing is rejected', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.reject(() => false);
      expect(result.size).toBe(2);
    });
  });

  describe('includes()', () => {
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

    it('should work with null and undefined', () => {
      const collection = FlowCollection.of([
        ['a', null],
        ['b', undefined],
      ]);
      expect(collection.includes(null)).toBe(true);
      expect(collection.includes(undefined)).toBe(true);
    });

    it('should return false for empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.includes(1)).toBe(false);
    });
  });

  // ==================== Predicates ====================
  describe('every()', () => {
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

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      let callCount = 0;
      collection.every((v, k, c) => {
        expect(typeof k).toBe('string');
        expect(c).toBe(collection);
        callCount++;
        return true;
      });
      expect(callCount).toBe(2);
    });

    it('should short-circuit on first false', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      let callCount = 0;
      collection.every((v) => {
        callCount++;
        return v < 2;
      });
      expect(callCount).toBe(2);
    });
  });

  describe('some()', () => {
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

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1 });
      let capturedKey: string | undefined;
      collection.some((v, k, c) => {
        capturedKey = k;
        return c === collection;
      });
      expect(capturedKey).toBe('a');
    });

    it('should short-circuit on first true', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      let callCount = 0;
      collection.some((v) => {
        callCount++;
        return v > 1;
      });
      expect(callCount).toBe(2);
    });
  });

  // ==================== Transformation Methods ====================
  describe('map()', () => {
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
      const original = FlowCollection.from({ a: 1 });
      const mapped = original.map((v) => v);
      expect(mapped).not.toBe(original);
    });

    it('should receive key and collection in callback', () => {
      const collection = FlowCollection.from({ a: 1 });
      let capturedKey: string | undefined;
      collection.map((v, k, c) => {
        capturedKey = k;
        expect(c).toBe(collection);
        return v;
      });
      expect(capturedKey).toBe('a');
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.map((v: any) => v * 2);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('mapEntries()', () => {
    it('should map entries to new key-value pairs', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
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

    it('should receive collection in callback', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.mapEntries((v, k, c) => {
        expect(c).toBe(collection);
        return [k, v];
      });
    });

    it('should handle duplicate keys by using last', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.mapEntries(() => ['same', 1]);
      expect(result.size).toBe(1);
      expect(result.get('same')).toBe(1);
    });
  });

  describe('flatMap()', () => {
    it('should flatten mapped results with iterable source', () => {
      const collection = FlowCollection.from<string, number>({ a: 1, b: 2 });
      const result = collection.flatMap<string, number>((v) => [
        [`item${v}a`, v * 10],
        [`item${v}b`, v * 20],
      ]);
      expect(result.size).toBe(4);
      expect(result.get('item1a')).toBe(10);
      expect(result.get('item2b')).toBe(40);
    });

    it('should flatten mapped results with object source', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.flatMap<string, number>((v) => ({
        [`key${v}a`]: v * 10,
        [`key${v}b`]: v * 20,
      }));
      expect(result.get('key1a')).toBe(10);
      expect(result.get('key1b')).toBe(20);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const flatMapped = original.flatMap((v) => [[`k`, v]]);
      expect(flatMapped).not.toBe(original);
    });

    it('should handle overlapping keys by using last', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.flatMap(() => [
        ['same', 1],
        ['same', 2],
      ]);
      expect(result.get('same')).toBe(2);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.flatMap((v) => [['k', v]]);
      expect(result.isEmpty()).toBe(true);
    });

    it('should receive collection in callback', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.flatMap((v, k, c) => {
        expect(c).toBe(collection);
        return [['k', v]];
      });
    });
  });

  // ==================== Aggregation Methods ====================
  describe('partition()', () => {
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

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1 });
      let capturedKey: string | undefined;
      collection.partition((v, k, c) => {
        capturedKey = k;
        expect(c).toBe(collection);
        return true;
      });
      expect(capturedKey).toBe('a');
    });
  });

  describe('groupBy()', () => {
    it('should group values by key', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 2 });
      const result = collection.groupBy((v) => (v % 2 === 0 ? 'even' : 'odd'));
      expect(result.get('odd')).toEqual([1, 3]);
      expect(result.get('even')).toEqual([2, 2]);
    });

    it('should create new arrays for each group', () => {
      const collection = FlowCollection.from({ a: 'x', b: 'y', c: 'x' });
      const result = collection.groupBy((v) => v);
      expect(result.get('x')).toEqual(['x', 'x']);
      expect(result.get('y')).toEqual(['y']);
    });

    it('should work with numeric grouping keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.groupBy((v) => v * 10);
      expect(result.get(10)).toEqual([1]);
      expect(result.get(20)).toEqual([2]);
    });

    it('should handle single item per group', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.groupBy((v) => v);
      expect(result.get(1)).toEqual([1]);
    });

    it('should receive collection in callback', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.groupBy((v, k, c) => {
        expect(c).toBe(collection);
        return 'key';
      });
    });
  });

  describe('tally()', () => {
    it('should count values matching predicate', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      expect(collection.tally((v) => v > 2)).toBe(2);
    });

    it('should return 0 if no matches', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      expect(collection.tally((v) => v > 10)).toBe(0);
    });

    it('should return full size if all match', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      expect(collection.tally(() => true)).toBe(3);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      expect(collection.tally(() => true)).toBe(0);
    });

    it('should receive key and collection in predicate', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.tally((v, k, c) => {
        expect(typeof k).toBe('string');
        expect(c).toBe(collection);
        return true;
      });
    });
  });

  // ==================== Iteration Methods ====================
  describe('forEach()', () => {
    it('should iterate over all entries', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const entries: Array<[string, number]> = [];
      collection.forEach((v, k) => {
        entries.push([k, v]);
      });
      expect(entries.length).toBe(3);
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries).toContainEqual(['c', 3]);
    });

    it('should pass collection as third argument', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.forEach((v, k, c) => {
        expect(c).toBe(collection);
      });
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      let callCount = 0;
      collection.forEach(() => {
        callCount++;
      });
      expect(callCount).toBe(0);
    });
  });

  describe('keys()', () => {
    it('should return an iterator of keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const keys = Array.from(collection.keys());
      expect(keys).toContain('a');
      expect(keys).toContain('b');
      expect(keys).toContain('c');
      expect(keys.length).toBe(3);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const keys = Array.from(collection.keys());
      expect(keys).toEqual([]);
    });

    it('should preserve insertion order', () => {
      const collection = FlowCollection.of([
        ['z', 1],
        ['a', 2],
        ['m', 3],
      ]);
      const keys = Array.from(collection.keys());
      expect(keys).toEqual(['z', 'a', 'm']);
    });
  });

  describe('values()', () => {
    it('should return an iterator of values', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const values = Array.from(collection.values());
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
      expect(values.length).toBe(3);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const values = Array.from(collection.values());
      expect(values).toEqual([]);
    });

    it('should preserve insertion order', () => {
      const collection = FlowCollection.of([
        ['z', 1],
        ['a', 2],
        ['m', 3],
      ]);
      const values = Array.from(collection.values());
      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe('entries()', () => {
    it('should return an iterator of entries', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const entries = Array.from(collection.entries());
      expect(entries).toContainEqual(['a', 1]);
      expect(entries).toContainEqual(['b', 2]);
      expect(entries.length).toBe(2);
    });

    it('should return empty iterator for empty collection', () => {
      const collection = FlowCollection.of([]);
      const entries = Array.from(collection.entries());
      expect(entries).toEqual([]);
    });

    it('should preserve insertion order', () => {
      const collection = FlowCollection.of([
        ['z', 1],
        ['a', 2],
      ]);
      const entries = Array.from(collection.entries());
      expect(entries).toEqual([
        ['z', 1],
        ['a', 2],
      ]);
    });
  });

  // ==================== Sorting Methods ====================
  describe('sortBy()', () => {
    it('should sort by numeric value', () => {
      const collection = FlowCollection.from({ a: 3, b: 1, c: 2 });
      const result = collection.sortBy((v) => v);
      const values = Array.from(result.values());
      expect(values).toEqual([1, 2, 3]);
    });

    it('should sort by string value', () => {
      const collection = FlowCollection.from({
        a: 'charlie',
        b: 'alice',
        c: 'bob',
      });
      const result = collection.sortBy((v) => v);
      const values = Array.from(result.values());
      expect(values).toEqual(['alice', 'bob', 'charlie']);
    });

    it('should sort by boolean value', () => {
      const collection = FlowCollection.from({ a: true, b: false, c: true });
      const result = collection.sortBy((v) => v);
      const values = Array.from(result.values());
      expect(values).toEqual([false, true, true]);
    });

    it('should maintain order of equal elements', () => {
      const collection = FlowCollection.of([
        ['a', 1],
        ['b', 2],
        ['c', 2],
        ['d', 1],
      ]);
      const result = collection.sortBy((v) => v);
      const keys = Array.from(result.keys());
      expect(keys[0]).toBe('a');
      expect(keys[1]).toBe('d');
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 3, b: 1 });
      const sorted = original.sortBy((v) => v);
      expect(sorted).not.toBe(original);
    });

    it('should receive key and collection in callback', () => {
      const collection = FlowCollection.from({ a: 1 });
      collection.sortBy((v, k, c) => {
        expect(typeof k).toBe('string');
        expect(c).toBe(collection);
        return v;
      });
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.sortBy(() => 0);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('toSorted()', () => {
    it('should sort with custom comparator', () => {
      const collection = FlowCollection.from({ a: 3, b: 1, c: 2 });
      const result = collection.toSorted((a, b) => a[1] - b[1]);
      const values = Array.from(result.values());
      expect(values).toEqual([1, 2, 3]);
    });

    it('should sort in reverse order with custom comparator', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3 });
      const result = collection.toSorted((a, b) => b[1] - a[1]);
      const values = Array.from(result.values());
      expect(values).toEqual([3, 2, 1]);
    });

    it('should allow sorting by key', () => {
      const collection = FlowCollection.of([
        ['c', 1],
        ['a', 2],
        ['b', 3],
      ]);
      const result = collection.toSorted((a, b) => a[0].localeCompare(b[0]));
      const keys = Array.from(result.keys());
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 3, b: 1 });
      const sorted = original.toSorted(() => 0);
      expect(sorted).not.toBe(original);
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.toSorted(() => 0);
      expect(result.isEmpty()).toBe(true);
    });
  });

  // ==================== Inversion Method ====================
  describe('invert()', () => {
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

    it('should work with different value types', () => {
      const collection = FlowCollection.from({ a: 'x', b: 'y', c: 'z' });
      const result = collection.invert();
      expect(result.get('x')).toBe('a');
      expect(result.get('y')).toBe('b');
    });

    it('should work on empty collection', () => {
      const collection = FlowCollection.of([]);
      const result = collection.invert();
      expect(result.isEmpty()).toBe(true);
    });
  });

  // ==================== Selection Methods ====================
  describe('pick()', () => {
    it('should pick specified keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.pick(['a', 'c']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
      expect(result.get('c')).toBe(3);
      expect(result.has('b')).toBe(false);
    });

    it('should handle missing keys gracefully', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
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

  describe('omit()', () => {
    it('should omit specified keys', () => {
      const collection = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = collection.omit(['b', 'd']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
      expect(result.get('c')).toBe(3);
      expect(result.has('b')).toBe(false);
    });

    it('should handle non-existent keys gracefully', () => {
      const collection = FlowCollection.from({ a: 1, b: 2 });
      const result = collection.omit(['c', 'd']);
      expect(result.size).toBe(2);
      expect(result.get('a')).toBe(1);
    });

    it('should return new collection', () => {
      const original = FlowCollection.from({ a: 1 });
      const omitted = original.omit(['b']);
      expect(omitted).not.toBe(original);
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

  // ==================== Merge Method ====================
  describe('merge()', () => {
    it('should merge with iterable source', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.merge([
        ['b', 2],
        ['c', 3],
      ]);
      expect(result.size).toBe(3);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should merge with object source', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.merge({ b: 2, c: 3 });
      expect(result.size).toBe(3);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('should merge multiple sources', () => {
      const collection = FlowCollection.from({ a: 1 });
      const result = collection.merge({ b: 2 }, [['c', 3]], { d: 4 });
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

  // ==================== Integration Tests ====================
  describe('Method Chaining', () => {
    it('should chain immutable methods', () => {
      const result = FlowCollection.from<string, number>({ a: 1, b: 2, c: 3 })
        .filter((v) => v > 1)
        .map((v) => v * 2)
        .with('d', 8);
      expect(result.size).toBe(3);
      expect(result.get('b')).toBe(4);
      expect(result.get('c')).toBe(6);
      expect(result.get('d')).toBe(8);
    });

    it('should chain mutable methods', () => {
      const collection = FlowCollection.of([])
        .set('a', 1)
        .set('b', 2)
        .set('c', 3);
      expect(collection.size).toBe(3);
    });

    it('should work with complex workflows', () => {
      const data = FlowCollection.from({ a: 1, b: 2, c: 3, d: 4 });
      const result = data
        .filter((v) => v > 1)
        .partition((v) => v > 2)
        .entries();
      const entries = Array.from(result);
      expect(entries.length).toBe(2);
    });
  });

  describe('Type Preservation', () => {
    it('should preserve number types', () => {
      const collection = FlowCollection.from({ a: 1, b: 2.5, c: -3 });
      expect(collection.get('a')).toBe(1);
      expect(collection.get('b')).toBe(2.5);
      expect(collection.get('c')).toBe(-3);
    });

    it('should preserve string types', () => {
      const collection = FlowCollection.from({ a: 'hello', b: '', c: 'world' });
      expect(collection.get('a')).toBe('hello');
      expect(collection.get('b')).toBe('');
      expect(collection.get('c')).toBe('world');
    });

    it('should preserve object types', () => {
      const obj1 = { x: 1 };
      const obj2 = { y: 2 };
      const collection = FlowCollection.from({ a: obj1, b: obj2 });
      expect(collection.get('a')).toBe(obj1);
      expect(collection.get('b')).toBe(obj2);
    });

    it('should preserve array types', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [4, 5, 6];
      const collection = FlowCollection.from({ a: arr1, b: arr2 });
      expect(collection.get('a')).toBe(arr1);
      expect(collection.get('b')).toBe(arr2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle symbol keys', () => {
      const sym = Symbol('test');
      const map = new Map([[sym, 'value']]);
      const collection = new FlowCollection(map);
      expect(collection.get(sym)).toBe('value');
    });

    it('should handle large collections', () => {
      const entries = Array.from(
        { length: 1000 },
        (_, i) => [`key${i}`, i] as const,
      );
      const collection = FlowCollection.of(entries);
      expect(collection.size).toBe(1000);
      expect(collection.get('key500')).toBe(500);
    });

    it('should handle collections with mixed key types', () => {
      const map = new Map<any, number>([
        ['a', 1],
        [1, 2],
        [true, 3],
      ]);
      const collection = new FlowCollection(map);
      expect(collection.get('a')).toBe(1);
      expect(collection.get(1)).toBe(2);
      expect(collection.get(true)).toBe(3);
    });

    it('should handle special characters in string keys', () => {
      const collection = FlowCollection.from({
        'key with spaces': 1,
        'key-with-dashes': 2,
        'key.with.dots': 3,
      });
      expect(collection.get('key with spaces')).toBe(1);
      expect(collection.get('key-with-dashes')).toBe(2);
      expect(collection.get('key.with.dots')).toBe(3);
    });
  });
});
