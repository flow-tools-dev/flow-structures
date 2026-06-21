# Flow Structures

Arrays and objects that just... do what you want.

Heavily inspired by the utility of Lodash, the functional elegance of Ramda, and the chainable pipeline style of Highland.js — but built for the way people actually write and use Typescript and Functional Programming today.

# Features

- **FlowList** — a chainable array wrapper with every operation you've ever reached for Lodash to do (or most of them, anyways).
- **FlowCollection** — a chainable map/object wrapper with every operation you've ever reached for Lodash to do (or, again, most of them at least).
- Inspired by FP techniques and principles, but without the dogma. New methods are immutable by default. But where you need mutability (pop, push, delete, etc) behaviors mimic built in Javascript APIs.
- Every callback receives the `FlowList` or `FlowCollection` instance as the last argument — so you always have the full API available, right there, mid-chain.
- Familiar names. If you know Lodash, you already know most of this. If you know Ramda, the philosophy will feel right at home.
- Written in TypeScript. Full type support out of the box.
- Zero dependencies.

# The Big Idea

Lodash is great. Ramda is great. Highland, also great. But the goal of Flow Structures is to make an approachable, chainable, easy to understand, hybrid FP lodash data structure library that naturally extends what's already built into Javascript today.

What if `prepend`, `groupBy`, `sortBy`, `partition`, `zip`, `flatMap`, `chunk`, `difference`, `intersection`, `uniq`, `merge` — all of it — just lived on the thing you're already working with? Chainable. Immutable. Typed. No wrappers, no imports, no ceremony.

That's Flow Structures. You wrap once, and then you just go.

```ts
const result = FlowList.of(orders)
  .uniqBy((o) => o.id)
  .filter((o) => o.status === 'paid')
  .sortBy((o) => o.createdAt)
  .groupBy((o) => o.customerId)
  .thru((groups) => sendSummaryEmails(groups));
```

# Installation

```bash
npm install @flow-tools-dev/flow-structures
```

# FlowList

A chainable, immutable array. Everything Lodash gave you as standalone functions, now living directly on your data.

## Basic Usage

```ts
import { FlowList } from '@flow-tools-dev/flow-structures';

const list = FlowList.of([1, 2, 3, 4, 5]);

// everything that an array has is still here.
list
  .filter((x) => x % 2 === 0)
  .map((x) => x * 10)
  .inspect() // logs your array of numbers [20, 40]
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
list.uniqBy('id'); // removes duplicates by property or function
list.chunk(2); // [[1, 2], [3, 4], [5]]
list.flat(); // flattens 1 level
list.flattenDeep(); // flattens all levels
list.toSorted((a, b) => b - a); // [5, 4, 3, 2, 1]
list.sortBy((x) => x); // sort by derived key
list.toReversed(); // [5, 4, 3, 2, 1]
list.with(0, 99); // [99, 2, 3, 4, 5]
list.fill(0, 1, 3); // mutates in place: [1, 0, 0, 4, 5]
list.toFilled(0, 1, 3); // immutable version of fill
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

All set operations accept both plain arrays and `FlowList` instances interchangeably. See [Set Operations By Key](#set-operations-by-key) below for comparing by a derived key instead of the elements themselves.

## Set Operations By Key

Same operations as above, but compare elements by a derived key — a property name or a transform function — instead of the elements themselves.

```ts
type Item = { id: number; name: string };

const a = FlowList.of<Item>([
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
]);
const b: Item[] = [
  { id: 2, name: 'x' },
  { id: 3, name: 'y' },
];

a.unionBy('id', b); // merges, deduped by id — first occurrence wins
a.intersectionBy('id', b); // elements whose id exists in every list, deduped by id
a.differenceBy('id', b); // elements whose id is not present in b — no dedup
a.xorBy('id', b); // elements whose id appears in exactly one list, deduped by id

// also accepts a transform function instead of a property key:
a.uniqBy((item) => item.id);
a.unionBy((item) => item.id, b);
```

`uniqBy`, `unionBy`, `intersectionBy`, and `xorBy` all deduplicate their results by the resolved key, keeping the first matching element. `differenceBy` does not deduplicate — it preserves any duplicates already present in the source list, since it's a pure filter.

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
list.isEmpty(); // false
list.entries(); // iterator of [index, value] pairs
list.keys(); // iterator of indices
list.values(); // iterator of values
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

## Mutating

A handful of methods mutate in place, mirroring their native array counterparts exactly. Everything else on `FlowList` is immutable.

```ts
const list = FlowList.of([1, 2, 3]);

list.push(4, 5); // [1, 2, 3, 4, 5] — returns new length
list.pop(); // [1, 2, 3, 4] — returns removed element
list.unshift(0); // [0, 1, 2, 3, 4] — returns new length
list.shift(); // [1, 2, 3, 4] — returns removed element
list.copyWithin(0, 2); // copies a range over another, in place
```

Prefer the immutable `toSpliced`, `toCopiedWithin`, and friends if you'd rather not mutate.

## Chaining Utilities

Inspired by Highland's pipeline model — tap in, peek around, break out whenever you're ready.

```ts
list
  .tap((x) => console.log('element:', x)) // side effect per element, passes through
  .peek((l) => console.log('list:', l)) // side effect on the whole list, passes through
  .inspect('my list') // console.log label shorthand
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

A chainable, immutable Map wrapper made to bridge the gap between how native Objects/Maps behave, and all the stuff you actually want to do with them. Same energy as FlowList, but for key-value data.

If you've ever found yourself writing `Object.fromEntries(Object.entries(obj).filter(...).map(...))` and wishing it could just... chain — this is for you.

It's important to note that FlowCollection treats any key/value data structure as generally the same entity. So when merging, flat mapping, or building new collections, you can pass plain objects or any iterable of `[key, value]` pairs — arrays of entries, Maps, other FlowCollections — and they're all accepted and handled the same way.

## Basic Usage

```ts
import { FlowCollection } from '@flow-tools-dev/flow-structures';

const col = FlowCollection.from({ a: 1, b: 2, c: 3 });

col
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
col.mapKeys((_, k) => k.toUpperCase()); // { A: 1, B: 2, C: 3 }
col.mapEntries((v, k) => [k + '_new', v * 2]); // remaps both keys and values
col.flatMap((v) => ({ derived: v * 2 })); // maps and merges resulting entries
col.filter((v) => v > 1); // { b: 2, c: 3 }
col.reject((v) => v > 1); // { a: 1 }
col.pick(['a', 'b']); // { a: 1, b: 2 }
col.omit(['a']); // { b: 2, c: 3 }
col.merge({ d: 4 }); // { a: 1, b: 2, c: 3, d: 4 }
col.with('a', 99); // { a: 99, b: 2, c: 3 }
col.update('a', (v) => v + 1); // { a: 2, b: 2, c: 3 }
col.without('a'); // { b: 2, c: 3 }
col.prepend('z', 0); // { z: 0, a: 1, b: 2, c: 3 }
col.invert(); // { 1: 'a', 2: 'b', 3: 'c' }
col.sortBy((v) => v); // sorted by derived key
col.sortWith((a, b) => a[1] - b[1]); // sorted by raw comparator
```

## Querying

```ts
col.get('a'); // 1
col.has('a'); // true
col.includes(1); // true
col.find((v) => v > 1); // 2
col.findEntry((v) => v > 1); // ['b', 2]
col.findLast((v) => v < 3); // 2
col.findLastEntry((v) => v < 3); // ['b', 2]
col.some((v) => v > 2); // true
col.every((v) => v > 0); // true
col.tally((v) => v > 1); // 2
col.tallyBy((v) => (v > 1 ? 'high' : 'low')); // FlowCollection { high: 2, low: 1 } — counts per derived key
col.size; // 3
col.isEmpty(); // false
col.keys(); // native iterator of keys
col.values(); // native iterator of values
col.entries(); // native iterator of [key, value] pairs
```

## Mutating

```ts
col.set('d', 4); // mutates in place, returns the collection
col.delete('a'); // removes a key, returns true/false
col.clear(); // removes all entries in place, returns the collection
```

Prefer `with` and `without` if you'd rather not mutate.

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
  .inspect('my col') // console.log label shorthand
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

## Exports

```ts
import {
  FlowList,
  FlowCollection,
  listOf,
  listFrom,
  collectionOf,
  collectionFrom,
} from '@flow-tools-dev/flow-structures';
```

`listOf`/`listFrom` and `collectionOf`/`collectionFrom` are thin functional wrappers around `FlowList.of`/`FlowList.from` and `FlowCollection.of`/`FlowCollection.from`, for anyone who prefers a plain function call over a static method:

```ts
listOf([1, 2, 3]); // same as FlowList.of([1, 2, 3])
collectionFrom({ a: 1 }); // same as FlowCollection.from({ a: 1 })
```

Type helpers (`Entry`, `Source`, `ListCallback`, `ListPredicate`, `CollectionCallback`) and the `isPlainObject`, `isFunction`, `resolveIfFn` utilities are also exported for anyone building on top of `FlowList`/`FlowCollection` directly.

---

# The @flow-tools-dev Ecosystem

| Package                           | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `@flow-tools-dev/flow-state`      | Minimal React global state management        |
| `@flow-tools-dev/flow-structures` | Chainable, immutable array and map utilities |

---

Leave a star. Thank you for trying it out.
