# Flow Structures

A chainable, immutable, FP-friendly collection and array utility library. Inspired by Lodash and Highland.js — familiar API, but built for functional pipelines.

Part of the **@flow-tools-dev** ecosystem.

# Features

- **FlowList** — a chainable, immutable wrapper around arrays.
- **FlowCollection** — a chainable, immutable wrapper around Maps.
- Immutable by default. Mutating methods are clearly marked `MUTABLE`.
- Every callback receives the `FlowList` or `FlowCollection` instance as the last argument instead of the raw array or map — so you always have the full API available mid-chain.
- Familiar names. If you know Lodash, you already know most of this.
- Written in TypeScript. Full type support out of the box.
- Zero dependencies.

# Installation

```bash
npm install @flow-tools-dev/flow-structures
```

# FlowList

A chainable, immutable array wrapper. Think Lodash's collection methods, but as a class you can chain.

## Basic Usage

```ts
import { FlowList } from '@flow-tools-dev/flow-structures';

const list = FlowList.of([1, 2, 3, 4, 5]);

const result = list
  .filter((x) => x % 2 === 0)
  .map((x) => x * 10)
  .toArray();
// [20, 40]
```

## Creating a FlowList

```ts
// From an array
FlowList.of([1, 2, 3]);

// From any iterable or array-like
FlowList.from(new Set([1, 2, 3]));
FlowList.from({ 0: 'a', 1: 'b', length: 2 });

// From another FlowList
FlowList.from(otherList);
```

## Transforming

```ts
const list = FlowList.of([1, 2, 3, 4, 5]);

list.map((x) => x * 2); // [2, 4, 6, 8, 10]
list.flatMap((x) => [x, x * 2]); // [1, 2, 2, 4, 3, 6, ...]
list.filter((x) => x > 2); // [3, 4, 5]
list.reject((x) => x > 2); // [1, 2]
list.without(2, 4); // [1, 3, 5]
list.compact(); // removes falsy values
list.uniq(); // removes duplicates
list.uniqBy('id'); // removes duplicates by property
list.chunk(2); // [[1, 2], [3, 4], [5]]
list.flatten(); // flattens 1 level
list.flattenDeep(); // flattens all levels
list.toSorted((a, b) => b - a); // [5, 4, 3, 2, 1]
list.sortBy((x) => x); // sort by derived key
list.toReversed(); // [5, 4, 3, 2, 1]
list.with(0, 99); // [99, 2, 3, 4, 5]
```

## Slicing & Dicing

```ts
list.take(3); // [1, 2, 3]
list.takeRight(2); // [4, 5]
list.takeWhile((x) => x < 4); // [1, 2, 3]
list.takeRightWhile((x) => x > 3); // [4, 5]

list.drop(2); // [3, 4, 5]
list.dropRight(2); // [1, 2, 3]
list.dropWhile((x) => x < 3); // [3, 4, 5]
list.dropRightWhile((x) => x > 3); // [1, 2, 3]

list.slice(1, 3); // [2, 3]
list.insert(2, 99); // [1, 2, 99, 3, 4, 5]
list.append(6, 7); // [1, 2, 3, 4, 5, 6, 7]
list.prepend(0); // [0, 1, 2, 3, 4, 5]
```

## Set Operations

```ts
const a = FlowList.of([1, 2, 3]);
const b = FlowList.of([2, 3, 4]);

a.union(b); // [1, 2, 3, 4]
a.intersection(b); // [2, 3]
a.difference(b); // [1]
a.xor(b); // [1, 4] — symmetric difference
```

All set operations accept both plain arrays and `FlowList` instances interchangeably.

## Searching & Querying

```ts
list.find((x) => x > 3); // 4
list.findLast((x) => x < 4); // 3
list.findIndex((x) => x > 3); // 3
list.findLastIndex((x) => x < 4); // 2
list.indexOf(3, 0); // 2
list.lastIndexOf(3); // 2
list.includes(3); // true
list.some((x) => x > 4); // true
list.every((x) => x > 0); // true
list.tally((x) => x % 2 === 0); // 2
list.at(0); // 1
list.at(-1); // 5
list.head(); // 1
list.tail(); // 5
```

## Grouping & Splitting

```ts
list.partition((x) => x % 2 === 0);
// [[2, 4], [1, 3, 5]]

list.groupBy((x) => (x % 2 === 0 ? 'even' : 'odd'));
// [['even', [2, 4]], ['odd', [1, 3, 5]]]

FlowList.of([1, 2, 3]).zip([4, 5, 6]);
// [[1, 4], [2, 5], [3, 6]]
```

## Chaining Utilities

```ts
list
  .tap((x) => console.log('element:', x)) // side effect per element, passes through
  .peek((l) => console.log('list:', l)) // side effect on the whole list, passes through
  .inspect('my list') // console.log('my list', [...])
  .thru((l) => l.toArray()); // break out of the chain into any value
```

## Reducing

```ts
list.reduce((acc, x) => acc + x, 0); // 15
list.reduceRight((acc, x) => acc + x, 0); // 15
```

## Converting

```ts
list.toArray(); // plain T[]
list.toSet(); // Set<T>
list.toMap(); // Map — expects [key, value] elements
list.toObject(); // plain object — expects [key, value] elements
list.toHead(); // FlowList with only the first element
list.toTail(); // FlowList with only the last element
list.toIndex(2); // FlowList with only the element at index 2
```

---

# FlowCollection

A chainable, immutable Map wrapper. Bring the same FP-friendly API to key-value data.

## Basic Usage

```ts
import { FlowCollection } from '@flow-tools-dev/flow-structures';

const col = FlowCollection.from({ a: 1, b: 2, c: 3 });

const result = col
  .filter((v) => v > 1)
  .map((v) => v * 10)
  .toObject();
// { b: 20, c: 30 }
```

## Creating a FlowCollection

```ts
// From a plain object
FlowCollection.from({ a: 1, b: 2 });

// From an iterable of [key, value] pairs
FlowCollection.from([
  ['a', 1],
  ['b', 2],
]);

// From entries directly
FlowCollection.of([
  ['a', 1],
  ['b', 2],
]);
```

## Transforming

```ts
col.map((v) => v * 2); // { a: 2, b: 4, c: 6 }
col.mapEntries((v, k) => [k + '_new', v * 2]); // remaps both keys and values
col.flatMap((v) => ({ derived: v * 2 })); // maps and merges resulting entries
col.filter((v) => v > 1); // { b: 2, c: 3 }
col.reject((v) => v > 1); // { a: 1 }
col.pick(['a', 'b']); // { a: 1, b: 2 }
col.omit(['a']); // { b: 2, c: 3 }
col.merge({ d: 4 }); // { a: 1, b: 2, c: 3, d: 4 }
col.with('a', 99); // { a: 99, b: 2, c: 3 }
col.without('a'); // { b: 2, c: 3 }
col.prepend('z', 0); // { z: 0, a: 1, b: 2, c: 3 }
col.invert(); // { 1: 'a', 2: 'b', 3: 'c' }
col.sortBy((v) => v); // sorted by derived key
col.toSorted((a, b) => a[1] - b[1]); // sorted by raw comparator
```

## Querying

```ts
col.get('a'); // 1
col.has('a'); // true
col.includes(1); // true
col.find((v) => v > 1); // 2
col.findLast((v) => v < 3); // 2
col.some((v) => v > 2); // true
col.every((v) => v > 0); // true
col.tally((v) => v > 1); // 2
col.size; // 3
col.isEmpty(); // false
```

## Grouping & Splitting

```ts
col.partition((v) => v > 1);
// FlowCollection { true: [2, 3], false: [1] }

col.groupBy((v) => (v > 1 ? 'high' : 'low'));
// FlowCollection { high: [2, 3], low: [1] }
```

## Chaining Utilities

```ts
col
  .tap((v, k) => console.log(k, v)) // side effect per entry, passes through
  .peek((c) => console.log(c)) // side effect on the whole collection, passes through
  .inspect('my col') // console.log('my col', map)
  .thru((c) => c.toObject()); // break out of the chain into any value
```

## Reducing & Iterating

```ts
col.reduce((acc, v) => acc + v, 0); // 6
col.reduceRight((acc, v) => acc + v, 0); // 6
col.forEach((v, k) => console.log(k, v));
col.forEachRight((v, k) => console.log(k, v));
```

## Converting

```ts
col.toObject(); // plain Record
col.toMap(); // native Map
col.toEntries(); // [key, value][]
col.toKeys(); // key[]
col.toValues(); // value[]
```

---

# The @flow-tools-dev Ecosystem

| Package                           | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `@flow-tools-dev/flow-state`      | Minimal React global state management        |
| `@flow-tools-dev/flow-structures` | Chainable, immutable array and map utilities |

---

Leave a star. Thank you for trying it out.
