import { describe, it, expect, vi } from 'vitest';
import { FlowList } from '..';

describe('FlowList.of', () => {
  it('creates a FlowList from an array', () => {
    expect(FlowList.of([1, 2, 3])).toBeInstanceOf(FlowList);
  });

  it('wraps an empty array', () => {
    expect(FlowList.of([]).length).toBe(0);
  });
});

describe('FlowList.from', () => {
  it('creates a FlowList from an array-like', () => {
    expect(FlowList.from({ 0: 'a', 1: 'b', length: 2 }).toArray()).toEqual([
      'a',
      'b',
    ]);
  });

  it('creates a FlowList from an iterable', () => {
    expect(FlowList.from(new Set([1, 2, 3])).toArray()).toEqual([1, 2, 3]);
  });

  it('creates a FlowList from another FlowList', () => {
    const original = FlowList.of([1, 2, 3]);
    expect(FlowList.from(original).toArray()).toEqual([1, 2, 3]);
  });
});

describe('FlowList.isFlowList', () => {
  it('returns true for a FlowList instance', () => {
    expect(FlowList.isFlowList(FlowList.of([1]))).toBe(true);
  });

  it('returns false for a plain array', () => {
    expect(FlowList.isFlowList([1, 2, 3])).toBe(false);
  });
});

describe('length', () => {
  it('returns the number of elements', () => {
    expect(FlowList.of([1, 2, 3]).length).toBe(3);
  });

  it('returns 0 for an empty list', () => {
    expect(FlowList.of([]).length).toBe(0);
  });
});

describe('entries', () => {
  it('returns an iterator of [index, value] pairs', () => {
    expect([...FlowList.of(['a', 'b']).entries()]).toEqual([
      [0, 'a'],
      [1, 'b'],
    ]);
  });
});

describe('keys', () => {
  it('returns an iterator of indices', () => {
    expect([...FlowList.of(['a', 'b']).keys()]).toEqual([0, 1]);
  });
});

describe('values', () => {
  it('returns an iterator of values', () => {
    expect([...FlowList.of(['a', 'b']).values()]).toEqual(['a', 'b']);
  });
});

describe('pop', () => {
  it('removes and returns the last element', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.pop()).toBe(3);
    expect(list.toArray()).toEqual([1, 2]);
  });

  it('returns undefined for an empty list', () => {
    expect(FlowList.of([]).pop()).toBeUndefined();
  });
});

describe('push', () => {
  it('appends items and returns the new length', () => {
    const list = FlowList.of([1, 2]);
    expect(list.push(3, 4)).toBe(4);
    expect(list.toArray()).toEqual([1, 2, 3, 4]);
  });
});

describe('shift', () => {
  it('removes and returns the first element', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.shift()).toBe(1);
    expect(list.toArray()).toEqual([2, 3]);
  });

  it('returns undefined for an empty list', () => {
    expect(FlowList.of([]).shift()).toBeUndefined();
  });
});

describe('unshift', () => {
  it('inserts items at the beginning and returns the new length', () => {
    const list = FlowList.of([3, 4]);
    expect(list.unshift(1, 2)).toBe(4);
    expect(list.toArray()).toEqual([1, 2, 3, 4]);
  });
});

describe('join', () => {
  it('joins elements with the default separator', () => {
    expect(FlowList.of([1, 2, 3]).join()).toBe('1,2,3');
  });

  it('joins elements with a custom separator', () => {
    expect(FlowList.of([1, 2, 3]).join(' - ')).toBe('1 - 2 - 3');
  });

  it('returns an empty string for an empty list', () => {
    expect(FlowList.of([]).join()).toBe('');
  });
});

describe('map', () => {
  it('transforms each element', () => {
    expect(
      FlowList.of([1, 2, 3])
        .map((x) => x * 2)
        .toArray(),
    ).toEqual([2, 4, 6]);
  });

  it('passes the index to the callback', () => {
    expect(
      FlowList.of(['a', 'b'])
        .map((_, i) => i)
        .toArray(),
    ).toEqual([0, 1]);
  });

  it('returns a new FlowList', () => {
    const list = FlowList.of([1, 2]);
    expect(list.map((x) => x)).toBeInstanceOf(FlowList);
  });
});

describe('forEach', () => {
  it('iterates over each element', () => {
    const results: number[] = [];
    FlowList.of([1, 2, 3]).forEach((x) => results.push(x));
    expect(results).toEqual([1, 2, 3]);
  });
});

describe('forEachRight', () => {
  it('iterates from last to first', () => {
    const results: number[] = [];
    FlowList.of([1, 2, 3]).forEachRight((x) => results.push(x));
    expect(results).toEqual([3, 2, 1]);
  });

  it('passes the correct index', () => {
    const indices: number[] = [];
    FlowList.of(['a', 'b', 'c']).forEachRight((_, i) => indices.push(i));
    expect(indices).toEqual([2, 1, 0]);
  });
});

describe('fill', () => {
  it('fills the entire list with a value', () => {
    const list = FlowList.of([1, 2, 3]);
    list.fill(0);
    expect(list.toArray()).toEqual([0, 0, 0]);
  });

  it('fills a range with a value', () => {
    const list = FlowList.of([1, 2, 3, 4]);
    list.fill(0, 1, 3);
    expect(list.toArray()).toEqual([1, 0, 0, 4]);
  });

  it('returns the mutated list', () => {
    const list = FlowList.of([1, 2]);
    expect(list.fill(0)).toBe(list);
  });
});

describe('toFilled', () => {
  it('fills the entire list with a value without mutating', () => {
    const list = FlowList.of([1, 2, 3]);
    const filled = list.toFilled(0);
    expect(filled.toArray()).toEqual([0, 0, 0]);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });

  it('fills a range', () => {
    expect(FlowList.of([1, 2, 3, 4]).toFilled(0, 1, 3).toArray()).toEqual([
      1, 0, 0, 4,
    ]);
  });

  it('returns a new FlowList', () => {
    const list = FlowList.of([1, 2]);
    expect(list.toFilled(0)).not.toBe(list);
  });
});

describe('flatMap', () => {
  it('maps and flattens array return values', () => {
    expect(
      FlowList.of([1, 2])
        .flatMap((x) => [x, x * 2])
        .toArray(),
    ).toEqual([1, 2, 2, 4]);
  });

  it('maps and flattens FlowList return values', () => {
    expect(
      FlowList.of([1, 2])
        .flatMap((x) => FlowList.of([x, x]))
        .toArray(),
    ).toEqual([1, 1, 2, 2]);
  });

  it('handles scalar return values', () => {
    expect(
      FlowList.of([1, 2])
        .flatMap((x) => x * 2)
        .toArray(),
    ).toEqual([2, 4]);
  });
});

describe('copyWithin', () => {
  it('copies elements to another position', () => {
    const list = FlowList.of([1, 2, 3, 4, 5]);
    list.copyWithin(0, 3);
    expect(list.toArray()).toEqual([4, 5, 3, 4, 5]);
  });

  it('respects the end parameter', () => {
    const list = FlowList.of([1, 2, 3, 4, 5]);
    list.copyWithin(1, 3, 4);
    expect(list.toArray()).toEqual([1, 4, 3, 4, 5]);
  });

  it('returns the mutated list', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.copyWithin(0, 1)).toBe(list);
  });
});

describe('toCopiedWithin', () => {
  it('copies elements to another position without mutating', () => {
    const list = FlowList.of([1, 2, 3, 4, 5]);
    const result = list.toCopiedWithin(0, 3);
    expect(result.toArray()).toEqual([4, 5, 3, 4, 5]);
    expect(list.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns a new FlowList', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.toCopiedWithin(0, 1)).not.toBe(list);
  });
});

describe('filter', () => {
  it('keeps elements that pass the predicate', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .filter((x) => x % 2 === 0)
        .toArray(),
    ).toEqual([2, 4]);
  });

  it('returns a new FlowList', () => {
    const list = FlowList.of([1, 2]);
    expect(list.filter(() => true)).toBeInstanceOf(FlowList);
  });
});

describe('reject', () => {
  it('removes elements that pass the predicate', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .reject((x) => x % 2 === 0)
        .toArray(),
    ).toEqual([1, 3]);
  });
});

describe('tally', () => {
  it('counts elements that pass the predicate', () => {
    expect(FlowList.of([1, 2, 3, 4]).tally((x) => x % 2 === 0)).toBe(2);
  });

  it('returns 0 when no elements pass', () => {
    expect(FlowList.of([1, 3, 5]).tally((x) => x % 2 === 0)).toBe(0);
  });
});

describe('reduce', () => {
  it('reduces from left to right', () => {
    expect(FlowList.of([1, 2, 3]).reduce((acc, x) => acc + x, 0)).toBe(6);
  });
});

describe('reduceRight', () => {
  it('reduces from right to left', () => {
    expect(
      FlowList.of(['a', 'b', 'c']).reduceRight((acc, x) => acc + x, ''),
    ).toBe('cba');
  });
});

describe('insert', () => {
  it('inserts items at the given index', () => {
    expect(FlowList.of([1, 2, 4]).insert(2, 3).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('inserts multiple items', () => {
    expect(FlowList.of([1, 4]).insert(1, 2, 3).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('inserts at the beginning', () => {
    expect(FlowList.of([2, 3]).insert(0, 1).toArray()).toEqual([1, 2, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2]);
    list.insert(1, 99);
    expect(list.toArray()).toEqual([1, 2]);
  });
});

describe('some', () => {
  it('returns true if any element passes', () => {
    expect(FlowList.of([1, 2, 3]).some((x) => x === 2)).toBe(true);
  });

  it('returns false if no element passes', () => {
    expect(FlowList.of([1, 2, 3]).some((x) => x === 99)).toBe(false);
  });
});

describe('every', () => {
  it('returns true if all elements pass', () => {
    expect(FlowList.of([2, 4, 6]).every((x) => x % 2 === 0)).toBe(true);
  });

  it('returns false if any element fails', () => {
    expect(FlowList.of([2, 3, 6]).every((x) => x % 2 === 0)).toBe(false);
  });
});

describe('find', () => {
  it('returns the first matching element', () => {
    expect(FlowList.of([1, 2, 3]).find((x) => x > 1)).toBe(2);
  });

  it('returns undefined if no element matches', () => {
    expect(FlowList.of([1, 2, 3]).find((x) => x > 99)).toBeUndefined();
  });
});

describe('findLast', () => {
  it('returns the last matching element', () => {
    expect(FlowList.of([1, 2, 3]).findLast((x) => x < 3)).toBe(2);
  });

  it('returns undefined if no element matches', () => {
    expect(FlowList.of([1, 2, 3]).findLast((x) => x > 99)).toBeUndefined();
  });
});

describe('findLastIndex', () => {
  it('returns the index of the last matching element', () => {
    expect(FlowList.of([1, 2, 3, 2]).findLastIndex((x) => x === 2)).toBe(3);
  });

  it('returns -1 if no element matches', () => {
    expect(FlowList.of([1, 2, 3]).findLastIndex((x) => x === 99)).toBe(-1);
  });
});

describe('lastIndexOf', () => {
  it('returns the last index of a value', () => {
    expect(FlowList.of([1, 2, 1, 3]).lastIndexOf(1)).toBe(2);
  });

  it('returns -1 if not found', () => {
    expect(FlowList.of([1, 2, 3]).lastIndexOf(99)).toBe(-1);
  });
});

describe('findIndex', () => {
  it('returns the index of the first matching element', () => {
    expect(FlowList.of([1, 2, 3]).findIndex((x) => x > 1)).toBe(1);
  });

  it('returns -1 if no element matches', () => {
    expect(FlowList.of([1, 2, 3]).findIndex((x) => x > 99)).toBe(-1);
  });
});

describe('indexOf', () => {
  it('returns the first index of a value', () => {
    expect(FlowList.of([1, 2, 3, 2]).indexOf(2, 0)).toBe(1);
  });

  it('respects the start parameter', () => {
    expect(FlowList.of([1, 2, 3, 2]).indexOf(2, 2)).toBe(3);
  });

  it('returns -1 if not found', () => {
    expect(FlowList.of([1, 2, 3]).indexOf(99, 0)).toBe(-1);
  });
});

describe('includes', () => {
  it('returns true if the value is present', () => {
    expect(FlowList.of([1, 2, 3]).includes(2)).toBe(true);
  });

  it('returns false if the value is not present', () => {
    expect(FlowList.of([1, 2, 3]).includes(99)).toBe(false);
  });
});

describe('at', () => {
  it('returns the element at a positive index', () => {
    expect(FlowList.of([1, 2, 3]).at(1)).toBe(2);
  });

  it('returns the element at a negative index', () => {
    expect(FlowList.of([1, 2, 3]).at(-1)).toBe(3);
  });

  it('returns undefined for an out-of-bounds index', () => {
    expect(FlowList.of([1, 2, 3]).at(99)).toBeUndefined();
  });
});

describe('toReversed', () => {
  it('returns a new list in reverse order', () => {
    expect(FlowList.of([1, 2, 3]).toReversed().toArray()).toEqual([3, 2, 1]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2, 3]);
    list.toReversed();
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe('toSorted', () => {
  it('sorts with the default comparator', () => {
    expect(FlowList.of([3, 1, 2]).toSorted().toArray()).toEqual([1, 2, 3]);
  });

  it('sorts with a custom comparator', () => {
    expect(
      FlowList.of([3, 1, 2])
        .toSorted((a, b) => b - a)
        .toArray(),
    ).toEqual([3, 2, 1]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([3, 1, 2]);
    list.toSorted();
    expect(list.toArray()).toEqual([3, 1, 2]);
  });
});

describe('with', () => {
  it('replaces the element at the given index', () => {
    expect(FlowList.of([1, 2, 3]).with(1, 99).toArray()).toEqual([1, 99, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2, 3]);
    list.with(1, 99);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe('without', () => {
  it('removes all occurrences of the given values', () => {
    expect(FlowList.of([1, 2, 3, 2, 1]).without(1, 2).toArray()).toEqual([3]);
  });

  it('returns the original elements when no match', () => {
    expect(FlowList.of([1, 2, 3]).without(99).toArray()).toEqual([1, 2, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2, 3]);
    list.without(1);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe('toSpliced', () => {
  it('removes elements', () => {
    expect(FlowList.of([1, 2, 3, 4]).toSpliced(1, 2).toArray()).toEqual([1, 4]);
  });

  it('inserts elements', () => {
    expect(FlowList.of([1, 4]).toSpliced(1, 0, 2, 3).toArray()).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2, 3]);
    list.toSpliced(0, 1);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe('slice', () => {
  it('returns a slice of the list', () => {
    expect(FlowList.of([1, 2, 3, 4]).slice(1, 3).toArray()).toEqual([2, 3]);
  });

  it('defaults start to 0', () => {
    expect(FlowList.of([1, 2, 3]).slice(undefined, 2).toArray()).toEqual([
      1, 2,
    ]);
  });

  it('defaults end to the list length', () => {
    expect(FlowList.of([1, 2, 3]).slice(1).toArray()).toEqual([2, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2, 3]);
    list.slice(0, 1);
    expect(list.toArray()).toEqual([1, 2, 3]);
  });
});

describe('take', () => {
  it('returns the first n elements', () => {
    expect(FlowList.of([1, 2, 3, 4]).take(2).toArray()).toEqual([1, 2]);
  });

  it('returns an empty list for n <= 0', () => {
    expect(FlowList.of([1, 2, 3]).take(0).toArray()).toEqual([]);
    expect(FlowList.of([1, 2, 3]).take(-1).toArray()).toEqual([]);
  });

  it('returns all elements if n exceeds list length', () => {
    expect(FlowList.of([1, 2]).take(99).toArray()).toEqual([1, 2]);
  });
});

describe('takeWhile', () => {
  it('takes leading elements while predicate holds', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .takeWhile((x) => x < 3)
        .toArray(),
    ).toEqual([1, 2]);
  });

  it('returns an empty list if the first element fails', () => {
    expect(
      FlowList.of([3, 1, 2])
        .takeWhile((x) => x < 3)
        .toArray(),
    ).toEqual([]);
  });

  it('returns all elements if all pass', () => {
    expect(
      FlowList.of([1, 2, 3])
        .takeWhile((x) => x < 99)
        .toArray(),
    ).toEqual([1, 2, 3]);
  });
});

describe('takeRight', () => {
  it('returns the last n elements', () => {
    expect(FlowList.of([1, 2, 3, 4]).takeRight(2).toArray()).toEqual([3, 4]);
  });

  it('returns an empty list for n <= 0', () => {
    expect(FlowList.of([1, 2, 3]).takeRight(0).toArray()).toEqual([]);
    expect(FlowList.of([1, 2, 3]).takeRight(-1).toArray()).toEqual([]);
  });

  it('returns all elements if n exceeds list length', () => {
    expect(FlowList.of([1, 2]).takeRight(99).toArray()).toEqual([1, 2]);
  });
});

describe('takeRightWhile', () => {
  it('takes trailing elements while predicate holds', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .takeRightWhile((x) => x > 2)
        .toArray(),
    ).toEqual([3, 4]);
  });

  it('returns elements in original order', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .takeRightWhile((x) => x > 1)
        .toArray(),
    ).toEqual([2, 3, 4]);
  });

  it('returns an empty list if the last element fails', () => {
    expect(
      FlowList.of([1, 2, 3])
        .takeRightWhile((x) => x > 99)
        .toArray(),
    ).toEqual([]);
  });
});

describe('drop', () => {
  it('removes the first n elements', () => {
    expect(FlowList.of([1, 2, 3, 4]).drop(2).toArray()).toEqual([3, 4]);
  });

  it('returns the original list for n <= 0', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.drop(0)).toBe(list);
  });

  it('returns an empty list if n exceeds list length', () => {
    expect(FlowList.of([1, 2]).drop(99).toArray()).toEqual([]);
  });
});

describe('dropWhile', () => {
  it('drops leading elements while predicate holds', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .dropWhile((x) => x < 3)
        .toArray(),
    ).toEqual([3, 4]);
  });

  it('returns all elements if the first element fails', () => {
    expect(
      FlowList.of([3, 1, 2])
        .dropWhile((x) => x < 3)
        .toArray(),
    ).toEqual([3, 1, 2]);
  });

  it('returns an empty list if all elements pass', () => {
    expect(
      FlowList.of([1, 2, 3])
        .dropWhile((x) => x < 99)
        .toArray(),
    ).toEqual([]);
  });
});

describe('dropRight', () => {
  it('removes the last n elements', () => {
    expect(FlowList.of([1, 2, 3, 4]).dropRight(2).toArray()).toEqual([1, 2]);
  });

  it('returns the original list for n <= 0', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.dropRight(0)).toBe(list);
  });

  it('returns an empty list if n exceeds list length', () => {
    expect(FlowList.of([1, 2]).dropRight(99).toArray()).toEqual([]);
  });
});

describe('dropRightWhile', () => {
  it('drops trailing elements while predicate holds', () => {
    expect(
      FlowList.of([1, 2, 3, 4])
        .dropRightWhile((x) => x > 2)
        .toArray(),
    ).toEqual([1, 2]);
  });

  it('returns all elements if the last element fails', () => {
    expect(
      FlowList.of([1, 2, 3])
        .dropRightWhile((x) => x > 99)
        .toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('returns an empty list if all elements pass', () => {
    expect(
      FlowList.of([1, 2, 3])
        .dropRightWhile((x) => x > 0)
        .toArray(),
    ).toEqual([]);
  });
});

describe('concat', () => {
  it('concatenates plain arrays', () => {
    expect(FlowList.of([1, 2]).concat([3, 4]).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('concatenates FlowList instances', () => {
    expect(
      FlowList.of([1, 2])
        .concat(FlowList.of([3, 4]))
        .toArray(),
    ).toEqual([1, 2, 3, 4]);
  });

  it('concatenates multiple mixed inputs', () => {
    expect(
      FlowList.of([1])
        .concat([2], FlowList.of([3]))
        .toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2]);
    list.concat([3]);
    expect(list.toArray()).toEqual([1, 2]);
  });
});

describe('flat', () => {
  it('flattens one level by default', () => {
    expect(
      FlowList.of([
        [1, 2],
        [3, 4],
      ])
        .flat()
        .toArray(),
    ).toEqual([1, 2, 3, 4]);
  });

  it('flattens to the specified depth', () => {
    expect(
      FlowList.of([[[1]], [[2]]])
        .flat(2)
        .toArray(),
    ).toEqual([1, 2]);
  });

  it('flattens nested FlowList instances', () => {
    expect(
      FlowList.of([FlowList.of([1, 2]), FlowList.of([3, 4])])
        .flat()
        .toArray(),
    ).toEqual([1, 2, 3, 4]);
  });

  it('does not flatten beyond the specified depth', () => {
    expect(
      FlowList.of([[[1, 2]]])
        .flat(1)
        .toArray(),
    ).toEqual([[1, 2]]);
  });

  it('does not flatten beyond the specified depth - mixed instances', () => {
    expect(
      FlowList.of([[[1, 2]], FlowList.of([[3, 4]])])
        .flat(1)
        .toArray(),
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

describe('flattenDeep', () => {
  it('flattens all levels of nesting', () => {
    expect(
      FlowList.of([[[1]], [[2, [3]]]])
        .flattenDeep()
        .toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('flattens nested FlowList instances at any depth', () => {
    expect(
      FlowList.of([FlowList.of([FlowList.of([1])])])
        .flattenDeep()
        .toArray(),
    ).toEqual([1]);
  });
});

describe('Symbol.iterator', () => {
  it('supports for...of iteration', () => {
    const results: number[] = [];
    for (const x of FlowList.of([1, 2, 3])) results.push(x);
    expect(results).toEqual([1, 2, 3]);
  });

  it('supports spread syntax', () => {
    expect([...FlowList.of([1, 2, 3])]).toEqual([1, 2, 3]);
  });
});

describe('append', () => {
  it('adds items to the end', () => {
    expect(FlowList.of([1, 2]).append(3, 4).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([1, 2]);
    list.append(3);
    expect(list.toArray()).toEqual([1, 2]);
  });
});

describe('prepend', () => {
  it('adds items to the beginning', () => {
    expect(FlowList.of([3, 4]).prepend(1, 2).toArray()).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([3, 4]);
    list.prepend(1);
    expect(list.toArray()).toEqual([3, 4]);
  });
});

describe('chunk', () => {
  it('splits the list into chunks of size n', () => {
    expect(FlowList.of([1, 2, 3, 4]).chunk(2).toArray()).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('includes a smaller final chunk when list does not divide evenly', () => {
    expect(FlowList.of([1, 2, 3, 4, 5]).chunk(2).toArray()).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('returns a single chunk if n exceeds list length', () => {
    expect(FlowList.of([1, 2]).chunk(10).toArray()).toEqual([[1, 2]]);
  });

  it('returns empty array if negative n passed in.', () => {
    expect(FlowList.of([1, 2]).chunk(-1).toArray()).toEqual([]);
  });

  it('returns empty array if 0 passed in.', () => {
    expect(FlowList.of([1, 2]).chunk(0).toArray()).toEqual([]);
  });
});

describe('compact', () => {
  it('removes all falsy values', () => {
    expect(
      FlowList.of([0, 1, false, 2, '', 3, null, undefined]).compact().toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('returns an empty list when all values are falsy', () => {
    expect(FlowList.of([0, false, '']).compact().toArray()).toEqual([]);
  });
});

describe('uniq', () => {
  it('removes duplicate values', () => {
    expect(FlowList.of([1, 2, 2, 3, 1]).uniq().toArray()).toEqual([1, 2, 3]);
  });

  it('preserves first occurrence order', () => {
    expect(FlowList.of([3, 1, 2, 1, 3]).uniq().toArray()).toEqual([3, 1, 2]);
  });
});

describe('uniqBy', () => {
  it('removes duplicates by property', () => {
    const list = FlowList.of([
      { id: 1, v: 'a' },
      { id: 2, v: 'b' },
      { id: 1, v: 'c' },
    ]);
    expect(list.uniqBy('id').toArray()).toEqual([
      { id: 1, v: 'a' },
      { id: 2, v: 'b' },
    ]);
  });

  it('preserves first occurrence order', () => {
    const list = FlowList.of([{ k: 'b' }, { k: 'a' }, { k: 'b' }]);
    expect(
      list
        .uniqBy('k')
        .map((x) => x.k)
        .toArray(),
    ).toEqual(['b', 'a']);
  });
});

describe('head', () => {
  it('returns the first element', () => {
    expect(FlowList.of([1, 2, 3]).head()).toBe(1);
  });

  it('returns undefined for an empty list', () => {
    expect(FlowList.of([]).head()).toBeUndefined();
  });
});

describe('toHead', () => {
  it('returns a list with only the first element', () => {
    expect(FlowList.of([1, 2, 3]).toHead().toArray()).toEqual([1]);
  });

  it('returns an empty list for an empty list', () => {
    expect(FlowList.of([]).toHead().toArray()).toEqual([]);
  });
});

describe('toIndex', () => {
  it('returns a list with the element at the given index', () => {
    expect(FlowList.of([1, 2, 3]).toIndex(1).toArray()).toEqual([2]);
  });

  it('supports negative indices', () => {
    expect(FlowList.of([1, 2, 3]).toIndex(-1).toArray()).toEqual([3]);
  });

  it('returns an empty list for an out-of-bounds positive index', () => {
    expect(FlowList.of([1, 2, 3]).toIndex(99).toArray()).toEqual([]);
  });

  it('returns an empty list for an out-of-bounds negative index', () => {
    expect(FlowList.of([1, 2, 3]).toIndex(-99).toArray()).toEqual([]);
  });
});

describe('tap', () => {
  it('invokes fn for each element as a side effect', () => {
    const results: number[] = [];
    FlowList.of([1, 2, 3]).tap((x) => results.push(x));
    expect(results).toEqual([1, 2, 3]);
  });

  it('returns the original elements unchanged', () => {
    expect(
      FlowList.of([1, 2, 3])
        .tap(() => {})
        .toArray(),
    ).toEqual([1, 2, 3]);
  });
});

describe('peek', () => {
  it('passes the list to fn as a side effect', () => {
    let seen: FlowList<number> | null = null;
    const list = FlowList.of([1, 2, 3]);
    list.peek((l) => {
      seen = l;
    });
    expect(seen).toBe(list);
  });

  it('returns the original list', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.peek(() => {})).toBe(list);
  });
});

describe('thru', () => {
  it('returns the result of fn', () => {
    expect(FlowList.of([1, 2, 3]).thru((l) => l.toArray())).toEqual([1, 2, 3]);
  });

  it('can return a non-FlowList value', () => {
    expect(FlowList.of([1, 2, 3]).thru((l) => l.length)).toBe(3);
  });
});

describe('inspect', () => {
  it('logs the array with the default label', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    FlowList.of([1, 2, 3]).inspect();
    expect(spy).toHaveBeenCalledWith('Array Values --> ', [1, 2, 3]);
    spy.mockRestore();
  });

  it('logs the array with a custom label', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    FlowList.of([1, 2, 3]).inspect('my list:');
    expect(spy).toHaveBeenCalledWith('my list:', [1, 2, 3]);
    spy.mockRestore();
  });

  it('returns the original list', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const list = FlowList.of([1, 2, 3]);
    expect(list.inspect()).toBe(list);
    vi.restoreAllMocks();
  });
});

describe('tail', () => {
  it('returns the last element', () => {
    expect(FlowList.of([1, 2, 3]).tail()).toBe(3);
  });

  it('returns undefined for an empty list', () => {
    expect(FlowList.of([]).tail()).toBeUndefined();
  });
});

describe('toTail', () => {
  it('returns a list with only the last element', () => {
    expect(FlowList.of([1, 2, 3]).toTail().toArray()).toEqual([3]);
  });

  it('returns an empty list for an empty list', () => {
    expect(FlowList.of([]).toTail().toArray()).toEqual([]);
  });
});

describe('difference', () => {
  it('returns elements not present in the given lists', () => {
    expect(FlowList.of([1, 2, 3, 4]).difference([2, 4]).toArray()).toEqual([
      1, 3,
    ]);
  });

  it('accepts FlowList instances', () => {
    expect(
      FlowList.of([1, 2, 3])
        .difference(FlowList.of([2, 3]))
        .toArray(),
    ).toEqual([1]);
  });

  it('accepts multiple lists', () => {
    expect(FlowList.of([1, 2, 3, 4]).difference([2], [4]).toArray()).toEqual([
      1, 3,
    ]);
  });

  it('returns all elements if no matches', () => {
    expect(FlowList.of([1, 2, 3]).difference([99]).toArray()).toEqual([
      1, 2, 3,
    ]);
  });
});

describe('xor', () => {
  it('returns elements unique to a single list', () => {
    expect(FlowList.of([1, 2, 3]).xor([2, 3, 4]).toArray()).toEqual([1, 4]);
  });

  it('handles multiple lists', () => {
    expect(FlowList.of([1, 2, 3]).xor([2, 3, 4], [3, 4, 5]).toArray()).toEqual([
      1, 5,
    ]);
  });

  it('returns no duplicates when a value appears multiple times within a single list', () => {
    expect(FlowList.of([1, 1, 2]).xor([2, 3]).toArray()).toEqual([1, 3]);
  });

  it('accepts FlowList instances', () => {
    expect(
      FlowList.of([1, 2, 3])
        .xor(FlowList.of([2, 3, 4]))
        .toArray(),
    ).toEqual([1, 4]);
  });

  it('returns an empty list when all elements are shared', () => {
    expect(FlowList.of([1, 2]).xor([1, 2]).toArray()).toEqual([]);
  });
});

describe('intersection', () => {
  it('returns elements common to all lists', () => {
    expect(FlowList.of([1, 2, 3]).intersection([2, 3, 4]).toArray()).toEqual([
      2, 3,
    ]);
  });

  it('accepts FlowList instances', () => {
    expect(
      FlowList.of([1, 2, 3])
        .intersection(FlowList.of([2, 3]))
        .toArray(),
    ).toEqual([2, 3]);
  });

  it('returns an empty list when there is no overlap', () => {
    expect(FlowList.of([1, 2]).intersection([3, 4]).toArray()).toEqual([]);
  });

  it('handles multiple lists', () => {
    expect(
      FlowList.of([1, 2, 3]).intersection([1, 2], [1, 3]).toArray(),
    ).toEqual([1]);
  });
});

describe('union', () => {
  it('returns all unique elements across all lists', () => {
    expect(FlowList.of([1, 2]).union([2, 3]).toArray()).toEqual([1, 2, 3]);
  });

  it('accepts FlowList instances', () => {
    expect(
      FlowList.of([1, 2])
        .union(FlowList.of([2, 3]))
        .toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('handles multiple lists', () => {
    expect(FlowList.of([1]).union([2], [3]).toArray()).toEqual([1, 2, 3]);
  });

  it('deduplicates within a single list', () => {
    expect(FlowList.of([1, 1, 2]).union([2, 3]).toArray()).toEqual([1, 2, 3]);
  });
});

describe('partition', () => {
  it('splits elements into passing and failing groups', () => {
    const [pass, fail] = FlowList.of([1, 2, 3, 4])
      .partition((x) => x % 2 === 0)
      .toArray();
    expect(pass).toEqual([2, 4]);
    expect(fail).toEqual([1, 3]);
  });

  it('returns an empty pass group when nothing passes', () => {
    const [pass, fail] = FlowList.of([1, 3])
      .partition((x) => x % 2 === 0)
      .toArray();
    expect(pass).toEqual([]);
    expect(fail).toEqual([1, 3]);
  });

  it('returns an empty fail group when everything passes', () => {
    const [pass, fail] = FlowList.of([2, 4])
      .partition((x) => x % 2 === 0)
      .toArray();
    expect(pass).toEqual([2, 4]);
    expect(fail).toEqual([]);
  });
});

describe('zip', () => {
  it('zips two lists into tuples', () => {
    expect(FlowList.of([1, 2, 3]).zip([4, 5, 6]).toArray()).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it('fills missing positions with undefined for unequal lengths', () => {
    expect(FlowList.of([1, 2, 3]).zip([4, 5]).toArray()).toEqual([
      [1, 4],
      [2, 5],
      [3, undefined],
    ]);
  });

  it('handles multiple lists', () => {
    expect(FlowList.of([1, 2]).zip([3, 4], [5, 6]).toArray()).toEqual([
      [1, 3, 5],
      [2, 4, 6],
    ]);
  });

  it('accepts FlowList instances', () => {
    expect(
      FlowList.of([1, 2])
        .zip(FlowList.of([3, 4]))
        .toArray(),
    ).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });
});

describe('groupBy', () => {
  it('groups elements by a derived key', () => {
    const result = FlowList.of([1, 2, 3, 4])
      .groupBy((x) => (x % 2 === 0 ? 'even' : 'odd'))
      .toArray();
    expect(Object.fromEntries(result)).toEqual({ odd: [1, 3], even: [2, 4] });
  });
});

describe('sortBy', () => {
  it('sorts by a derived key ascending', () => {
    const list = FlowList.of([{ n: 3 }, { n: 1 }, { n: 2 }]);
    expect(
      list
        .sortBy((x) => x.n)
        .map((x) => x.n)
        .toArray(),
    ).toEqual([1, 2, 3]);
  });

  it('does not mutate the original', () => {
    const list = FlowList.of([3, 1, 2]);
    list.sortBy((x) => x);
    expect(list.toArray()).toEqual([3, 1, 2]);
  });

  it('returns 0 for elements with equal sort keys', () => {
    const list = FlowList.of([
      { n: 1, id: 'a' },
      { n: 1, id: 'b' },
      { n: 2, id: 'c' },
    ]);
    expect(
      list
        .sortBy((x) => x.n)
        .map((x) => x.id)
        .toArray(),
    ).toEqual(['a', 'b', 'c']);
  });
});

describe('toArray', () => {
  it('returns a plain array of the elements', () => {
    expect(FlowList.of([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
  });

  it('returns a shallow copy, not a reference', () => {
    const list = FlowList.of([1, 2, 3]);
    expect(list.toArray()).not.toBe(list.toArray());
  });
});

describe('toSet', () => {
  it('converts the list to a Set', () => {
    expect(FlowList.of([1, 2, 2, 3]).toSet()).toEqual(new Set([1, 2, 3]));
  });
});

describe('toMap', () => {
  it('converts [key, value] pairs to a Map', () => {
    expect(
      FlowList.of([
        ['a', 1],
        ['b', 2],
      ] as [string, number][]).toMap(),
    ).toEqual(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
    );
  });
});

describe('toObject', () => {
  it('converts [key, value] pairs to a plain object', () => {
    expect(
      FlowList.of([
        ['a', 1],
        ['b', 2],
      ] as [string, number][]).toObject(),
    ).toEqual({ a: 1, b: 2 });
  });
});
