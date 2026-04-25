export type ListPredicate<T> = (
  value: T,
  index: number,
  list: FlowList<T>,
) => boolean;

export type ListCallback<T, R> = (
  value: T,
  index: number,
  list: FlowList<T>,
) => R;

export class FlowList<T> {
  private array: T[];
  constructor(array: T[]) {
    this.array = array;
  }

  /**
   * Creates a new FlowList from an array.
   * @param v The array to wrap
   * @returns A new FlowList instance
   */
  static of<T>(v: T[]) {
    return new FlowList(v);
  }

  /**
   * Creates a new FlowList from an iterable, array-like object, or another FlowList.
   * Calls Array.from on the source.
   * @param source The source to convert (Iterable, ArrayLike, or FlowList)
   * @returns A new FlowList instance
   */
  static from<T>(source: Iterable<T> | ArrayLike<T> | FlowList<T>) {
    if (source instanceof FlowList) return FlowList.of<T>(source.toArray());
    return FlowList.of<T>(Array.from(source as ArrayLike<T>));
  }

  /**
   * Checks if an item is a FlowList instance.
   * @param item The item to check
   * @returns True if the item is a FlowList, false otherwise
   */
  static isFlowList(item: unknown) {
    return item instanceof FlowList;
  }

  /**
   * Gets the number of elements in the list.
   * @returns The length of the list
   */
  get length() {
    return this.array.length;
  }

  /**
   * Wraps around the internal array.entries.
   * @returns An iterator of [index, value] entries
   */
  entries() {
    return this.array.entries();
  }

  /**
   * Wraps around the internal array.keys.
   * @returns An iterator of indices
   */
  keys() {
    return this.array.keys();
  }

  /**
   * Wraps around the internal array.values.
   * @returns An iterator of values
   */
  values() {
    return this.array.values();
  }

  /**
   * MUTABLE
   *
   * Wraps around the internal array.pop.
   * @returns The last value of the list.
   */

  pop() {
    return this.array.pop();
  }

  /**
   * MUTABLE
   * Wraps around the internal array.push.
   * @param items - Any item to pushed into the end of the List.
   * @returns The length of the new list.
   */

  push(...items: T[]) {
    return this.array.push(...items);
  }

  /**
   * MUTABLE
   * Wraps around the internal array.shift.
   * @returns The first element in the list.
   */

  shift() {
    return this.array.shift();
  }

  /**
   * Wraps around the internal array.join.
   * @param s The string to be used as a separator in the resulting string.
   * @returns String of all elements in the array, divided by the separator.
   */
  join(s?: string) {
    return this.array.join(s);
  }

  /**
   * MUTABLE
   * Wraps around the internal array.unshift.
   * @param items The items to be put at the beginning of the list.
   * @returns The new length of the list.
   */

  unshift(...items: T[]) {
    return this.array.unshift(...items);
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.map, but passing in the List instance as the third argument.
   * @param fn — A function that accepts up to three arguments - the element at index, the index, and the list instance itself.
   * @returns A new list with the resulting elements.
   *
   */
  map<U>(fn: (value: T, index: number, list: FlowList<T>) => U): FlowList<U> {
    return FlowList.of<U>(this.array.map((v, i) => fn(v, i, this)));
  }

  /**
   * Wraps around the internal array.forEach, but passing in the list instance as the third argument.
   * @param fn — A function that accepts up to three arguments - the element at index, the index, and the list instance itself.
   * @returns void
   */
  forEach(fn: ListCallback<T, void>) {
    this.array.forEach((el: T, i: number) => fn(el, i, this));
  }

  /**
   * Works exactly like forEach, but starts from the end of the list.
   * @param fn — A function that accepts up to three arguments - the element at index, the index, and the list instance itself.
   */
  forEachRight(fn: ListCallback<T, void>) {
    for (let i = this.array.length - 1; i >= 0; i--) {
      fn(this.array[i], i, this);
    }
  }

  /**
   * MUTABLE
   * Wraps around the internal array.fill.
   * @param v The value to fill the list with.
   * @param start The index to start filling the array at.
   * @param end The end index to stop filling the array at.
   * @returns The mutated list.
   */
  fill<U>(v?: U, start?: number, end?: number) {
    // @ts-expect-error
    this.array.fill(v, start, end) as unknown as U[];
    // @ts-expect-error
    return this as FlowList<U>;
  }

  /**
   * IMMUTABLE
   * An immutable version of the fill method.
   * @param v The value to fill the list with.
   * @param start The index to start filling the array at.
   * @param end The end index to stop filling the array at.
   * @returns A new list with the changed values.
   */
  toFilled<U>(v?: U, start: number = 0, end: number = this.length) {
    return FlowList.of<U>(
      // @ts-expect-error
      this.array.map<U>((el: T, i: number) => (i >= start && i < end ? v : el)),
    );
  }

  /**
   * IMMUTABLE
   * Maps over all elements in the list, and calls a callback on each one.
   * Then flattens the list 1 level deep.
   * This method flattens both arrays, and instances of FlowList.
   * @param fn — A function that accepts up to three arguments - the element at index, the index, and the list instance itself.
   * @returns A new list with the changed values
   */
  flatMap<U>(fn: ListCallback<T, U | U[] | FlowList<U>>): FlowList<U> {
    const out: U[] = [];
    this.array.forEach((value, index) => {
      const r = fn(value, index, this);
      if (Array.isArray(r)) {
        out.push(...r);
      } else if (r instanceof FlowList) {
        out.push(...r.toArray());
      } else {
        out.push(r);
      }
    });
    return FlowList.of<U>(out);
  }

  /**
   * MUTABLE
   * Copies part of the list to another location in the list, without modifying its length.
   * @param target The index where to copy the elements to
   * @param start The index to start copying elements from
   * @param end The index to stop copying elements from (exclusive)
   * @returns The same list instance with the changed values
   */
  copyWithin(target: number, start: number, end?: number) {
    this.array.copyWithin(target, start, end);
    return this;
  }

  /**
   * IMMUTABLE
   * Returns a new list with a copy of part of the list copied to another location, without modifying the original or the length.
   * @param target The index where to copy the elements to
   * @param start The index to start copying elements from
   * @param end The index to stop copying elements from (exclusive)
   * @returns A new list instance with the changed values
   */
  toCopiedWithin(target: number, start: number, end?: number) {
    return FlowList.of<T>([...this.array].copyWithin(target, start, end));
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.filter.
   * @param predicate A callback that takes an element, the index, and the list instance itself. Returns a boolean.
   * @returns A new list with all values that predicate returned truthy for.
   */
  filter(predicate: ListPredicate<T>): FlowList<T> {
    return FlowList.of<T>(this.array.filter((v, i) => predicate(v, i, this)));
  }

  /**
   * IMMUTABLE
   * The opposite of array.filter. Only keeps keeps that return falsy for the predicate.
   * @param predicate A callback that takes an element, the index, and the list instance itself. Returns a boolean.
   * @returns A new list with all values that predicate returned falsy for.
   */
  reject(predicate: ListPredicate<T>) {
    return FlowList.of<T>(this.array.filter((v, i) => !predicate(v, i, this)));
  }

  /**
   * IMMUTABLE
   * Counts the number of elements for which the predicate returns truthy.
   * @param predicate A callback that takes an element, the index, and the list instance itself. Returns a boolean.
   * @returns The tally of how many values the predicate returned truthy for.
   */
  tally(predicate: ListPredicate<T>) {
    return this.array.filter((el, i) => predicate(el, i, this)).length;
  }

  /**
   * Reduces the list to a single value by applying `fn` to each element from left to right.
   * @param fn - Reducer callback receiving the accumulator, current element, index, and list.
   * @param init - The initial accumulator value.
   * @returns The final accumulated value.
   */
  reduce<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduce((acc, curr, i) => fn(acc, curr, i, this), init);
  }

  /**
   * Reduces the list to a single value by applying `fn` to each element from right to left.
   * @param fn - Reducer callback receiving the accumulator, current element, index, and list.
   * @param init - The initial accumulator value.
   * @returns The final accumulated value.
   */
  reduceRight<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduceRight(
      (acc, curr, i) => fn(acc, curr, i, this),
      init,
    );
  }

  /**
   * IMMUTABLE
   * Returns a new list with `items` inserted at the given index without modifying the original.
   * @param index - The position at which to insert.
   * @param items - One or more items to insert.
   * @returns A new `FlowList` with the items inserted.
   */
  insert(index: number, ...items: T[]): FlowList<T> {
    return FlowList.of(this.array.toSpliced(index, 0, ...items));
  }

  /**
   * Wraps around the internal array.some.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns `true` if any element passes, otherwise `false`.
   */
  some(fn: ListPredicate<T>): boolean {
    return this.array.some((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.every.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns `true` if all element pass, otherwise `false`.
   */
  every(fn: ListPredicate<T>): boolean {
    return this.array.every((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.find.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The first matching element, or `undefined` if none is found.
   */
  find(fn: ListPredicate<T>): T | undefined {
    return this.array.find((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.findLast.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The last matching element, or `undefined` if none is found.
   */
  findLast(fn: ListPredicate<T>) {
    return this.array.findLast((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.findLastIndex.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The index of the last matching element, or `-1` if none is found.
   */
  findLastIndex(fn: ListPredicate<T>) {
    return this.array.findLastIndex((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.lastIndexOf.
   * @param v - The value to search for.
   * @returns The last index of `v`, or `-1` if not found.
   */
  lastIndexOf(v: T) {
    return this.array.lastIndexOf(v);
  }

  /**
   * Wraps around the internal array.findIndex.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The index of the first matching element, or `-1` if none is found.
   */
  findIndex(fn: ListPredicate<T>): number {
    return this.array.findIndex((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around hte internal array.indexOf.
   * @param el - The value to search for.
   * @param start - The index to begin searching from.
   * @returns The index of the first match, or `-1` if not found.
   */
  indexOf(el: T, start: number) {
    return this.array.indexOf(el, start);
  }

  /**
   * Wraps around the internal array.includes.
   * @param value - The value to search for.
   * @returns `true` if found, otherwise `false`.
   */
  includes(value: T): boolean {
    return this.array.includes(value);
  }

  /**
   * Wraps around the internal array.at.
   * @param index - The index to retrieve. Negative values count from the end.
   * @returns The element at `index`, or `undefined` if out of bounds.
   */
  at(index: number): T | undefined {
    return this.array.at(index);
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.toReversed.
   * Returns a new list with the elements in reverse order.
   * @returns A new reversed `FlowList`.
   */
  toReversed() {
    return FlowList.of<T>(this.array.toReversed());
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.toSorted.
   * @param fn - An optional comparator function. Uses default lexicographic sort if omitted.
   * @returns A new sorted `FlowList`.
   */
  toSorted(fn?: (a: T, b: T) => number) {
    return FlowList.of<T>(this.array.toSorted(fn));
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.with.
   * @param i - The index of the element to replace.
   * @param v - The replacement value.
   * @returns A new `FlowList` with the element replaced.
   */
  with(i: number, v: T) {
    return FlowList.of<T>(this.array.with(i, v));
  }

  /**
   * IMMUTABLE
   * Returns a new list with all occurrences of the given values removed.
   * @param vals - One or more values to exclude.
   * @returns A new `FlowList` with the specified values omitted.
   */
  without(...vals: T[]) {
    return FlowList.of<T>(this.array.filter((v) => !vals.includes(v)));
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.toSpliced.
   * @param start - The index at which to begin changes.
   * @param deleteCount - The number of elements to remove.
   * @param items - Elements to insert at `start`.
   * @returns A new `FlowList` with the splice applied.
   */
  toSpliced(start: number, deleteCount?: number, ...items: T[]): FlowList<T> {
    // @ts-expect-error
    return FlowList.of<T>(this.array.toSpliced(start, deleteCount, ...items));
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.slice.
   * @param start - The start index (inclusive). Defaults to `0`.
   * @param end - The end index (exclusive). Defaults to the list length.
   * @returns A new `FlowList` slice.
   */
  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(this.array.slice(start, end));
  }

  /**
   * IMMUTABLE
   * Returns a new list containing the first `n` elements.
   * @param n - The number of elements to take. Returns an empty list if `n <= 0`.
   * @returns A new `FlowList` with up to `n` elements.
   */
  take(n: number) {
    if (n <= 0) return FlowList.of<T>([]);
    return FlowList.of<T>(this.array.slice(0, n));
  }

  /**
   * IMMUTABLE
   * Returns a new list containing the leading elements for which the predicate holds.
   * Stops at the first element that fails.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A new `FlowList` of the leading passing elements.
   */
  takeWhile(predicate: ListPredicate<T>) {
    const take = [];
    for (let i = 0; i <= this.array.length - 1; i++) {
      if (!predicate(this.array[i], i, this)) break;
      take.push(this.array[i]);
    }
    return FlowList.of<T>(take);
  }

  /**
   * IMMUTABLE
   * Returns a new list containing the last `n` elements.
   * @param n - The number of elements to take from the end. Returns an empty list if `n <= 0`.
   * @returns A new `FlowList` with up to `n` trailing elements.
   */
  takeRight(n: number) {
    if (n <= 0) return FlowList.of<T>([]);
    return FlowList.of<T>(this.array.slice(-n));
  }

  /**
   * IMMUTABLE
   * Returns a new list containing the trailing elements for which the predicate holds.
   * Stops at the first element from the right that fails.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A new `FlowList` of the trailing passing elements, in original order.
   */
  takeRightWhile(predicate: ListPredicate<T>) {
    const take = [];
    for (let i = this.array.length - 1; i >= 0; i--) {
      if (!predicate(this.array[i], i, this)) break;
      take.push(this.array[i]);
    }
    return FlowList.of<T>(take.toReversed());
  }

  /**
   * IMMUTABLE
   * Returns a new list with the first `n` elements removed.
   * @param n - The number of elements to drop. Returns the original list if `n <= 0`.
   * @returns A new `FlowList` without the first `n` elements.
   */
  drop(n: number) {
    if (n <= 0) return this;
    return this.slice(n);
  }

  /**
   * IMMUTABLE
   * Drops leading elements for which the predicate holds, then returns the rest.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A new `FlowList` starting from the first element that fails the predicate.
   */
  dropWhile(predicate: ListPredicate<T>) {
    const keep: T[] = [];
    let drop = true;
    this.array.forEach((el, i) => {
      if (drop && predicate(el, i, this)) return;
      drop = false;
      keep.push(el);
    });
    return FlowList.of<T>(keep);
  }

  /**
   * IMMUTABLE
   * Returns a new list with the last `n` elements removed.
   * @param n - The number of elements to drop from the end. Returns the original list if `n <= 0`.
   * @returns A new `FlowList` without the last `n` elements.
   */
  dropRight(n: number) {
    if (n <= 0) return this;
    return FlowList.of<T>(this.array.slice(0, -n));
  }

  /**
   * IMMUTABLE
   * Drops trailing elements for which the predicate holds, then returns the rest.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A new `FlowList` with the trailing passing elements removed.
   */
  dropRightWhile(predicate: ListPredicate<T>) {
    const keep: T[] = [];
    let drop = true;
    const l = this.array.length - 1;
    this.array.toReversed().forEach((el, i) => {
      if (drop && predicate(el, l - i, this)) return;
      drop = false;
      keep.push(el);
    });
    return FlowList.of<T>(keep.toReversed());
  }

  /**
   * IMMUTABLE
   * Returns a new list with the given arrays or concat-compatible values appended.
   * @param items - Arrays or `ConcatArray` values to concatenate.
   * @returns A new `FlowList` with the concatenated elements.
   */
  concat(...items: ConcatArray<T>[]): FlowList<T> {
    return FlowList.of(this.array.concat(...items));
  }

  /**
   * IMMUTABLE
   * Flattens nested arrays or `FlowList` instances up to `depth` levels deep.
   * @param depth - The maximum recursion depth. Defaults to `1`.
   * @returns A new flattened `FlowList`.
   */
  flat(depth: number = 1) {
    const result: T[] = [];

    const flatten = (items: T[], currentDepth: number) => {
      for (const item of items) {
        const isFlow = FlowList.isFlowList(item);
        if (currentDepth > 0 && (Array.isArray(item) || isFlow)) {
          const next = isFlow ? item.toArray() : item;
          flatten(next, currentDepth - 1);
        } else {
          result.push(item);
        }
      }
    };
    flatten(this.array, depth);
    return FlowList.of<T>(result);
  }

  /**
   * IMMUTABLE
   * Recursively flattens all nested arrays and `FlowList` instances.
   * @returns A fully flattened `FlowList`.
   */
  flattenDeep() {
    return this.flat(Infinity);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.array[Symbol.iterator]();
  }

  append(...items: T[]) {
    return FlowList.of<T>([...this.array, ...items]);
  }

  prepend(...items: T[]) {
    return FlowList.of<T>([...items, ...this.array]);
  }

  chunk(n: number) {
    const agg: T[][] = [];
    let chunk: T[] = [];
    this.array.forEach((el) => {
      if (chunk.length < n) chunk.push(el);
      if (chunk.length === n) {
        agg.push(chunk);
        chunk = [];
      }
    });
    if (chunk.length) agg.push(chunk);
    return FlowList.of<T[]>(agg);
  }

  compact() {
    return FlowList.of<T>(this.array.filter(Boolean));
  }

  uniq() {
    return FlowList.of<T>(Array.from(new Set(this.array)));
  }

  uniqBy<K extends keyof T>(prop: K) {
    const seen = new Set<T[K]>();
    const arr = this.array.reduce((acc, curr, i) => {
      if (!seen.has(curr[prop])) {
        acc.push(curr);
        seen.add(curr[prop]);
      }
      return acc;
    }, [] as T[]);
    return FlowList.of<T>(arr);
  }

  head() {
    return this.array[0];
  }

  toHead() {
    return FlowList.of<T>(this.array.length ? [this.array[0]] : []);
  }

  toIndex(n: number) {
    if (n >= 0 && n < this.array.length) return FlowList.of<T>([this.array[n]]);
    if (n < 0 && n >= -this.array.length)
      return FlowList.of<T>([this.array[this.array.length + n]]);
    return FlowList.of<T>([]);
  }

  tap(fn: ListCallback<T, void>) {
    return FlowList.of<T>(
      this.array.map((el, idx) => {
        fn(el, idx, this);
        return el;
      }),
    );
  }

  peek(fn: (list: FlowList<T>) => void) {
    fn(this);
    return this;
  }

  thru(fn: (list: FlowList<T>) => void) {
    return fn(this);
  }

  inspect(label = 'Array Values --> ') {
    console.log(label, this.array);
    return this;
  }

  tail() {
    return this.array[this.array.length - 1];
  }

  toTail() {
    return FlowList.of<T>(
      this.array.length ? [this.array[this.array.length - 1]] : [],
    );
  }

  difference(...lists: (T[] | FlowList<T>)[]) {
    const exclude = FlowList.of(lists)
      .flatMap((a) => a)
      .toSet();
    return FlowList.of<T>(this.array.filter((el) => !exclude.has(el)));
  }

  xor(...lists: (T[] | FlowList<T>)[]) {
    const sets = [this.array, ...lists].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of<T>(result);
  }

  intersection(...lists: (T[] | FlowList<T>)[]) {
    return FlowList.of<T>(
      this.array.filter((v) => lists.every((arr) => arr.includes(v))),
    );
  }

  union(...lists: (T[] | FlowList<T>)[]) {
    const allLists = [this.array, ...lists].flatMap((a) =>
      FlowList.isFlowList(a) ? a.toArray() : a,
    );
    return FlowList.of(allLists).uniq();
  }

  partition(predicate: ListPredicate<T>): FlowList<T[]> {
    const pass: T[] = [];
    const fail: T[] = [];

    this.array.forEach((value, index) => {
      (predicate(value, index, this) ? pass : fail).push(value);
    });
    return FlowList.of<T[]>([pass, fail]);
  }

  zip<U extends T>(...lists: (FlowList<U> | U[])[]) {
    // normalize everything to arrays
    const allLists: (U[] | FlowList<U>)[] = [this.array as U[], ...lists];

    const maxLen = Math.max(...allLists.map((a) => a.length));
    const zipped: U[][] = [];

    for (let i = 0; i < maxLen; i++) {
      // map each array to its i-th element
      zipped.push(allLists.map((a) => a.at(i) as U));
    }

    return FlowList.of<U[]>(zipped);
  }

  groupBy(fn: ListCallback<T, PropertyKey>) {
    const results = this.array.reduce<Record<PropertyKey, T[]>>(
      (acc, curr, i) => {
        const key = fn(curr, i, this);
        if (!(key in acc)) acc[key] = [];
        acc[key].push(curr);
        return acc;
      },
      {},
    );
    return FlowList.of<[PropertyKey, T[]]>(Object.entries(results));
  }

  sortBy<U>(fn: (value: T, list: FlowList<T>) => U): FlowList<T> {
    return FlowList.of(
      this.array.toSorted((a, b) => {
        const ka = fn(a, this);
        const kb = fn(b, this);
        if (ka < kb) return -1;
        if (ka > kb) return 1;
        return 0;
      }),
    );
  }

  toArray() {
    return [...this.array];
  }

  toSet() {
    return new Set<T>(this.array);
  }

  toMap() {
    return new Map(this.array as [PropertyKey, T][]);
  }

  toObject() {
    return Object.fromEntries<T>(this.array as [PropertyKey, T][]);
  }
}
