import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FlowList } from '..';

describe('FlowList - basics', () => {
  it('constructs via of and from (array, iterable, FlowList)', () => {
    const a = FlowList.of([1, 2, 3]);
    expect(a.length).toBe(3);
    expect(a.toArray()).toEqual([1, 2, 3]);

    const fromArray = FlowList.from([4, 5]);
    expect(fromArray.toArray()).toEqual([4, 5]);

    const fromIterable = FlowList.from(
      (function* () {
        yield 6;
        yield 7;
      })(),
    );
    expect(fromIterable.toArray()).toEqual([6, 7]);

    const fromFlow = FlowList.from(a);
    expect(fromFlow.toArray()).toEqual([1, 2, 3]);
  });

  it('supports iterator, entries, keys, values', () => {
    const a = FlowList.of(['x', 'y']);
    expect(Array.from(a)).toEqual(['x', 'y']);
    expect(Array.from(a.entries())).toEqual([
      [0, 'x'],
      [1, 'y'],
    ]);
    expect(Array.from(a.keys())).toEqual([0, 1]);
    expect(Array.from(a.values())).toEqual(['x', 'y']);
  });
});

describe('FlowList - mapping and iteration', () => {
  it('map', () => {
    const a = FlowList.of([1, 2, 3]);
    expect(a.map((v, i, list) => v + 1).toArray()).toEqual([2, 3, 4]);
  });

  it('forEach calls callback with (value, index, list) in order and returns undefined', () => {
    const a = FlowList.of([10, 20, 30]);
    const calls: Array<[number, number, boolean]> = [];
    const ret = a.forEach((v, i, list) =>
      calls.push([v as number, i as number, list === a]),
    );
    expect(calls).toEqual([
      [10, 0, true],
      [20, 1, true],
      [30, 2, true],
    ]);
    expect(ret).toBeUndefined();
    expect(a.toArray()).toEqual([10, 20, 30]);
  });

  it('forEachRight iterates right-to-left with (value, index, list) and returns undefined', () => {
    const a = FlowList.of([10, 20, 30]);
    const calls: Array<[number, number, boolean]> = [];
    const ret = a.forEachRight((v, i, list) =>
      calls.push([v as number, i as number, list === a]),
    );
    expect(calls).toEqual([
      [30, 2, true],
      [20, 1, true],
      [10, 0, true],
    ]);
    expect(ret).toBeUndefined();
    expect(a.toArray()).toEqual([10, 20, 30]);
  });

  it('flatMap handles arrays, FlowList and single values', () => {
    const a = FlowList.of([1, 2, 3]);
    const fm = a.flatMap((v: number) => [v, v + 10]);
    expect(fm.toArray()).toEqual([1, 11, 2, 12, 3, 13]);

    const fm2 = a.flatMap((v: number) => FlowList.of([v, v * 2]));
    expect(fm2.toArray()).toEqual([1, 2, 2, 4, 3, 6]);

    const fm3 = a.flatMap((v: number) => v + 100);
    expect(fm3.toArray()).toEqual([101, 102, 103]);
  });

  it('tap allows side-effects but returns original values', () => {
    const a = FlowList.of([1, 2]);
    const side: number[] = [];
    const tapped = a.tap((v: number) => side.push(v * 2));
    expect(side).toEqual([2, 4]);
    expect(tapped.toArray()).toEqual([1, 2]);
  });
});

describe('FlowList - filtering, searching, predicates', () => {
  it('filter, reject, tally, some, every', () => {
    const a = FlowList.of([1, 2, 3, 4]);
    expect(a.filter((v: number) => v % 2 === 0).toArray()).toEqual([2, 4]);
    expect(a.reject((v: number) => v % 2 === 0).toArray()).toEqual([1, 3]);
    expect(a.tally((v: number) => v > 2)).toBe(2);
    expect(a.some((v: number) => v === 3)).toBe(true);
    expect(a.every((v: number) => v > 0)).toBe(true);
  });

  it('find, findIndex, findLast, findLastIndex, indexOf, lastIndexOf, includes, at', () => {
    const a = FlowList.of([1, 2, 3, 2]);
    expect(a.find((v: number) => v === 2)).toBe(2);
    expect(a.findIndex((v: number) => v === 2)).toBe(1);
    expect(a.findLast((v: number) => v === 2)).toBe(2);
    expect(a.findLastIndex((v: number) => v === 2)).toBe(3);

    expect(a.indexOf(2, 0)).toBe(1);
    expect(a.lastIndexOf(2)).toBe(3);
    expect(a.includes(3)).toBe(true);
    expect(a.at(0)).toBe(1);
    expect(a.at(-1)).toBe(2);
  });
});

describe('FlowList - reductions', () => {
  it('reduce and reduceRight', () => {
    const a = FlowList.of([1, 2, 3]);
    const sum = a.reduce((acc: number, curr: number) => acc + curr, 0);
    expect(sum).toBe(6);
    const concatRight = a.reduceRight(
      (acc: string, curr: number) => acc + curr,
      '',
    );
    expect(concatRight).toBe('321');
  });
});

describe('FlowList - slicing, take/drop, with, splicing', () => {
  it('slice, take, takeRight, drop, dropRight, with, toSpliced, insert', () => {
    const a = FlowList.of([1, 2, 3, 4, 5]);
    expect(a.slice(1, 4).toArray()).toEqual([2, 3, 4]);
    expect(a.take(3).toArray()).toEqual([1, 2, 3]);
    expect(a.takeRight(2).toArray()).toEqual([4, 5]);
    expect(a.drop(2).toArray()).toEqual([3, 4, 5]);
    expect(a.dropRight(2).toArray()).toEqual([1, 2, 3]);
    expect(a.with(1, 99).toArray()).toEqual([1, 99, 3, 4, 5]);
    expect(a.toArray()).toEqual([1, 2, 3, 4, 5]);

    // toSpliced may be available; test basic insertion/removal behavior if present
    const spliced = a.toSpliced(2, 1, 7, 8);
    expect(spliced.toArray()).toEqual([1, 2, 7, 8, 4, 5]);
    // original unchanged
    expect(a.toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(a.insert(1, 55, 43, 56).toArray()).toEqual([
      1, 55, 43, 56, 2, 3, 4, 5,
    ]);
  });

  it('toIndex handles positive, negative and out-of-range', () => {
    const a = FlowList.of([10, 20, 30]);
    expect(a.toIndex(1).toArray()).toEqual([20]);
    expect(a.toIndex(-1).toArray()).toEqual([30]);
    expect(a.toIndex(5).toArray()).toEqual([]);
  });

  it('copy within copies elements within the same list', () => {
    const a = FlowList.of([1, 2, 3, 4, 5]);
    expect(a.copyWithin(0, 3, 5).toArray()).toEqual([4, 5, 3, 4, 5]);

    const b = FlowList.of(['a', 'b', 'c', 'd']);
    expect(b.copyWithin(1, 0, 2).toArray()).toEqual(['a', 'a', 'b', 'd']);
  });

  it('copy within, but does not modify the original', () => {
    const a = FlowList.of([1, 2, 3, 4, 5]);
    expect(a.toCopiedWithin(0, 3, 5).toArray()).toEqual([4, 5, 3, 4, 5]);

    const b = FlowList.of(['a', 'b', 'c', 'd']);
    expect(b.toCopiedWithin(1, 0, 2).toArray()).toEqual(['a', 'a', 'b', 'd']);

    // original unchanged
    expect(a.toArray()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('FlowList - while-based operations', () => {
  it('takeWhile and dropWhile', () => {
    const a = FlowList.of([1, 2, 3, 1, 0]);
    expect(a.takeWhile((v: number) => v < 3).toArray()).toEqual([1, 2]);
    expect(a.dropWhile((v: number) => v < 3).toArray()).toEqual([3, 1, 0]);
  });

  it('takeRightWhile and dropRightWhile', () => {
    const a = FlowList.of([1, 2, 3, 3, 2, 1]);
    expect(a.takeRightWhile((v: number) => v <= 1).toArray()).toEqual([1]);
    expect(a.dropRightWhile((v: number) => v <= 1).toArray()).toEqual([
      1, 2, 3, 3, 2,
    ]);
  });
});

describe('FlowList - ordering and sorting', () => {
  it('toReversed and toSorted and sortBy', () => {
    const a = FlowList.of([3, 1, 2]);
    expect(a.toReversed().toArray()).toEqual([2, 1, 3]);

    expect(a.toSorted().toArray()).toEqual([1, 2, 3]);
    expect(a.toSorted((x: number, y: number) => y - x).toArray()).toEqual([
      3, 2, 1,
    ]);

    const objs = FlowList.of([{ k: 2 }, { k: 1 }]);
    expect(objs.sortBy((o: any) => o.k).toArray()).toEqual([
      { k: 1 },
      { k: 2 },
    ]);
  });
});

describe('FlowList - flattening, concat, flat', () => {
  it('concat, append, prepend', () => {
    const a = FlowList.of([1]);
    expect(a.concat([2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(a.append(4, 5).toArray()).toEqual([1, 4, 5]);
    expect(a.prepend(0).toArray()).toEqual([0, 1]);
    expect(a.toArray()).toEqual([1]); // original unchanged
  });

  it('flat flattens arrays and FlowList by depth', () => {
    const a = FlowList.of([1, [2, [3]], FlowList.of([4, [5]])]);
    const f1 = a.flat(1).toArray();
    // depth-1 flatten: inner arrays and FlowList become flattened one level
    expect(f1).toEqual([1, 2, [3], 4, [5]]);
    const f2 = a.flat(2).toArray();
    expect(f2).toEqual([1, 2, 3, 4, 5]);
    expect(a.flat(Infinity).toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(a.flat().toArray()).toEqual([1, 2, [3], 4, [5]]);
  });
});

describe('FlowList - set-like operations', () => {
  it('uniq, compact, uniqBy and toSet', () => {
    const a = FlowList.of([1, 2, 2, 0, null, undefined, false, 1]);
    expect(a.uniq().toArray()).toEqual([1, 2, 0, null, undefined, false]);
    expect(a.compact().toArray()).toEqual([1, 2, 2, 1]);

    const objs = FlowList.of([{ id: 1 }, { id: 2 }, { id: 1 }]);
    expect(objs.uniqBy('id').toArray()).toEqual([{ id: 1 }, { id: 2 }]);
    expect(FlowList.of([1, 2, 3]).toSet()).toEqual(new Set([1, 2, 3]));
  });

  it('union merges inputs and deduplicates', () => {
    const a = FlowList.of([1, 2, 3]);
    const b = [3, 4];
    const c = FlowList.of([2, 5]);
    const union = a.union(b, c).toArray().sort();
    expect(union).toEqual([1, 2, 3, 4, 5].sort());
  });

  it('difference removes any elements present in other inputs', () => {
    const a = FlowList.of([1, 2, 3]);
    const b = [3, 4];
    const c = FlowList.of([2, 5]);
    expect(a.difference(b, c).toArray()).toEqual([1]);
  });

  it('xor returns elements present in exactly one input', () => {
    const res = FlowList.of([1, 2])
      .xor([2, 3], FlowList.of([1, 4]))
      .toArray()
      .sort();
    expect(res).toEqual([3, 4].sort());
  });
});

describe('FlowList - grouping, partition, zip', () => {
  it('groupBy groups by key', () => {
    const a = FlowList.of(['aa', 'ab', 'ba']);
    const g = a.groupBy((s: string) => s[0]).toArray();
    // convert to map-like check
    const obj = Object.fromEntries(g);
    expect(obj['a']).toEqual(['aa', 'ab']);
    expect(obj['b']).toEqual(['ba']);
  });

  it('partition returns [pass, fail]', () => {
    const a = FlowList.of([1, 2, 3, 4]);
    const p = a.partition((v: number) => v % 2 === 0).toArray();
    expect(p).toEqual([
      [2, 4],
      [1, 3],
    ]);
  });

  it('zip with unequal lengths yields undefined for missing', () => {
    const a = FlowList.of([1, 2]);
    const z = a.zip([10], FlowList.of([20, 30, 40])).toArray();
    expect(z).toEqual([
      [1, 10, 20],
      [2, undefined, 30],
      [undefined, undefined, 40],
    ]);
  });
});

describe('FlowList - batching and conversions', () => {
  it('chunk', () => {
    const a = FlowList.of([1, 2, 3, 4, 5]);
    expect(a.chunk(3).toArray()).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it('toArray, toMap, toObject, head/tail/toHead/toTail/toIndex', () => {
    const pairs = FlowList.of([
      ['a', 1],
      ['b', 2],
    ]);
    expect(pairs.toMap().get('a')).toBe(1);
    expect(pairs.toObject()).toEqual({ a: 1, b: 2 });

    const a = FlowList.of([9, 8, 7]);
    expect(a.head()).toBe(9);
    expect(a.tail()).toBe(7);
    expect(a.toHead().toArray()).toEqual([9]);
    expect(a.toTail().toArray()).toEqual([7]);
    expect(a.toIndex(1).toArray()).toEqual([8]);
    expect(a.toIndex(-1).toArray()).toEqual([7]);
  });
});
