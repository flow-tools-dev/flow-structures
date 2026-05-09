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
   * Wraps around the internal array.pop.
   * @returns The last element of the list, or `undefined` if the list is empty.
   */
  pop() {
    return this.array.pop();
  }

  /**
   * MUTABLE
   * Wraps around the internal array.push.
   * @param items - One or more items to push to the end of the list.
   * @returns The new length of the list.
   */
  push(...items: T[]) {
    return this.array.push(...items);
  }

  /**
   * MUTABLE
   * Wraps around the internal array.shift.
   * @returns The first element of the list, or `undefined` if the list is empty.
   */
  shift() {
    return this.array.shift();
  }

  /**
   * Wraps around the internal array.join.
   * @param s - The separator string. Defaults to `','`.
   * @returns A string of all elements joined by the separator.
   */
  join(s?: string) {
    return this.array.join(s);
  }

  /**
   * MUTABLE
   * Wraps around the internal array.unshift.
   * @param items - One or more items to insert at the beginning of the list.
   * @returns The new length of the list.
   */
  unshift(...items: T[]) {
    return this.array.unshift(...items);
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.map, passing the list instance as the third argument instead of the raw array.
   * @param fn - A callback receiving each element, its index, and the list.
   * @returns A new `FlowList` with the mapped values.
   */
  map<U>(fn: (value: T, index: number, list: FlowList<T>) => U): FlowList<U> {
    return FlowList.of<U>(this.array.map((v, i) => fn(v, i, this)));
  }

  /**
   * Wraps around the internal array.forEach, passing the list instance as the third argument instead of the raw array.
   * @param fn - A callback receiving each element, its index, and the list.
   */
  forEach(fn: ListCallback<T, void>) {
    this.array.forEach((el: T, i: number) => fn(el, i, this));
  }

  /**
   * Works exactly like forEach, but starts from the end of the list.
   * @param fn - A callback receiving each element, its index, and the list.
   */
  forEachRight(fn: ListCallback<T, void>) {
    for (let i = this.array.length - 1; i >= 0; i--) {
      fn(this.array[i], i, this);
    }
  }

  /**
   * MUTABLE
   * Wraps around the internal array.fill.
   * @param v - The value to fill with.
   * @param start - The index to start filling at (inclusive).
   * @param end - The index to stop filling at (exclusive).
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
   * An immutable version of `fill`. Wraps around the internal array.map to produce a new list.
   * @param v - The value to fill with.
   * @param start - The index to start filling at (inclusive). Defaults to `0`.
   * @param end - The index to stop filling at (exclusive). Defaults to the list length.
   * @returns A new `FlowList` with the filled values.
   */
  toFilled<U>(v?: U, start: number = 0, end: number = this.length) {
    return FlowList.of<U>(
      // @ts-expect-error
      this.array.map<U>((el: T, i: number) => (i >= start && i < end ? v : el)),
    );
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.flatMap, passing the list instance as the third argument instead of the raw array.
   * Also flattens `FlowList` return values in addition to plain arrays.
   * @param fn - A callback receiving each element, its index, and the list. May return a value, array, or `FlowList`.
   * @returns A new `FlowList` with the mapped and flattened values.
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
   * Wraps around the internal array.copyWithin.
   * @param target - The index to copy elements to.
   * @param start - The index to start copying from (inclusive).
   * @param end - The index to stop copying from (exclusive).
   * @returns The mutated list.
   */
  copyWithin(target: number, start: number, end?: number) {
    this.array.copyWithin(target, start, end);
    return this;
  }

  /**
   * IMMUTABLE
   * An immutable version of `copyWithin`. Operates on a shallow copy of the internal array.
   * @param target - The index to copy elements to.
   * @param start - The index to start copying from (inclusive).
   * @param end - The index to stop copying from (exclusive).
   * @returns A new `FlowList` with the copy applied.
   */
  toCopiedWithin(target: number, start: number, end?: number) {
    return FlowList.of<T>([...this.array].copyWithin(target, start, end));
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.filter, passing the list instance as the third argument instead of the raw array.
   * @param predicate - A callback receiving each element, its index, and the list. Returns a boolean.
   * @returns A new `FlowList` of elements for which the predicate returned truthy.
   */
  filter(predicate: ListPredicate<T>): FlowList<T> {
    return FlowList.of<T>(this.array.filter((v, i) => predicate(v, i, this)));
  }

  /**
   * IMMUTABLE
   * The inverse of `filter`. Keeps only elements for which the predicate returns falsy.
   * @param predicate - A callback receiving each element, its index, and the list. Returns a boolean.
   * @returns A new `FlowList` of elements for which the predicate returned falsy.
   */
  reject(predicate: ListPredicate<T>) {
    return FlowList.of<T>(this.array.filter((v, i) => !predicate(v, i, this)));
  }

  /**
   * IMMUTABLE
   * Counts the number of elements for which the predicate returns truthy.
   * @param predicate - A callback receiving each element, its index, and the list. Returns a boolean.
   * @returns The number of elements for which the predicate returned truthy.
   */
  tally(predicate: ListPredicate<T>) {
    return this.array.filter((el, i) => predicate(el, i, this)).length;
  }

  /**
   * Wraps around the internal array.reduce, passing the list instance as the fourth argument instead of the raw array.
   * @param fn - A reducer callback receiving the accumulator, current element, its index, and the list.
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
   * Wraps around the internal array.reduceRight, passing the list instance as the fourth argument instead of the raw array.
   * @param fn - A reducer callback receiving the accumulator, current element, its index, and the list.
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
   * Returns a new list with `items` inserted at the given index.
   * @param index - The position at which to insert.
   * @param items - One or more items to insert.
   * @returns A new `FlowList` with the items inserted.
   */
  insert(index: number, ...items: T[]): FlowList<T> {
    return FlowList.of(this.array.toSpliced(index, 0, ...items));
  }

  /**
   * Wraps around the internal array.some, passing the list instance as the third argument instead of the raw array.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns `true` if any element satisfies the predicate, otherwise `false`.
   */
  some(fn: ListPredicate<T>): boolean {
    return this.array.some((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.every, passing the list instance as the third argument instead of the raw array.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns `true` if all elements satisfy the predicate, otherwise `false`.
   */
  every(fn: ListPredicate<T>): boolean {
    return this.array.every((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.find, passing the list instance as the third argument instead of the raw array.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The first matching element, or `undefined` if none is found.
   */
  find(fn: ListPredicate<T>): T | undefined {
    return this.array.find((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.findLast, passing the list instance as the third argument instead of the raw array.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The last matching element, or `undefined` if none is found.
   */
  findLast(fn: ListPredicate<T>) {
    return this.array.findLast((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.findLastIndex, passing the list instance as the third argument instead of the raw array.
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
   * Wraps around the internal array.findIndex, passing the list instance as the third argument instead of the raw array.
   * @param fn - A predicate receiving each element, its index, and the list.
   * @returns The index of the first matching element, or `-1` if none is found.
   */
  findIndex(fn: ListPredicate<T>): number {
    return this.array.findIndex((v, i) => fn(v, i, this));
  }

  /**
   * Wraps around the internal array.indexOf.
   * @param el - The value to search for.
   * @param start - The index to begin searching from.
   * @returns The index of the first match at or after `start`, or `-1` if not found.
   */
  indexOf(el: T, start: number = 0) {
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
   * Wraps around the internal array.at. Supports negative indices.
   * @param index - The index to retrieve. Negative values count from the end.
   * @returns The element at `index`, or `undefined` if out of bounds.
   */
  at(index: number): T | undefined {
    return this.array.at(index);
  }

  /**
   * IMMUTABLE
   * Wraps around the internal array.toReversed.
   * @returns A new `FlowList` with elements in reverse order.
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
   * @returns A new `FlowList` with the element at `i` replaced by `v`.
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
   * @returns A new `FlowList` containing the sliced elements.
   */
  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(this.array.slice(start, end));
  }

  /**
   * IMMUTABLE
   * Returns a new list containing the first `n` elements.
   * @param n - The number of elements to take. Returns an empty list if `n <= 0`.
   * @returns A new `FlowList` with up to `n` leading elements.
   */
  take(n: number) {
    if (n <= 0) return FlowList.of<T>([]);
    return FlowList.of<T>(this.array.slice(0, n));
  }

  /**
   * IMMUTABLE
   * Returns a new list of leading elements for which the predicate holds, stopping at the first failure.
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
   * Returns a new list of trailing elements for which the predicate holds, stopping at the first failure from the right.
   * Elements are returned in their original order.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A new `FlowList` of the trailing passing elements.
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
   * Stops dropping at the first element that fails the predicate.
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
   * Stops dropping at the first element from the right that fails the predicate.
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
   * Returns a new list with the elements of all given arrays or `FlowList` instances appended.
   * Unlike the native array.concat, this method accepts `FlowList` instances directly.
   * @param items - One or more arrays or `FlowList` instances to concatenate.
   * @returns A new `FlowList` with the concatenated elements.
   */
  concat(...items: (T[] | FlowList<T>)[]): FlowList<T> {
    const out = [this.array, ...items].flatMap((item) =>
      FlowList.isFlowList(item) ? item.toArray() : item,
    );
    return FlowList.of(out);
  }

  /**
   * IMMUTABLE
   * Flattens nested arrays or `FlowList` instances up to `depth` levels deep.
   * Unlike the native array.flat, this method also flattens nested `FlowList` instances.
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

  /**
   * Returns an iterator over the list's elements, enabling `for...of` usage.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.array[Symbol.iterator]();
  }

  /**
   * IMMUTABLE
   * Returns a new list with `items` added to the end.
   * @param items - One or more items to append.
   * @returns A new `FlowList` with the items appended.
   */
  append(...items: T[]) {
    return FlowList.of<T>([...this.array, ...items]);
  }

  /**
   * IMMUTABLE
   * Returns a new list with `items` added to the beginning.
   * @param items - One or more items to prepend.
   * @returns A new `FlowList` with the items prepended.
   */
  prepend(...items: T[]) {
    return FlowList.of<T>([...items, ...this.array]);
  }

  /**
   * IMMUTABLE
   * Splits the list into consecutive chunks of size `n`.
   * The final chunk may be smaller if the list does not divide evenly.
   * @param n - The size of each chunk.
   * @returns A new `FlowList` of `T[]` chunks.
   */
  chunk(n: number) {
    if (n <= 0) return FlowList.of<T[]>([]);

    const agg: T[][] = [];
    let chunk: T[] = [];
    this.array.forEach((el) => {
      chunk.push(el);
      if (chunk.length === n) {
        agg.push(chunk);
        chunk = [];
      }
    });
    if (chunk.length) agg.push(chunk);
    return FlowList.of<T[]>(agg);
  }

  /**
   * IMMUTABLE
   * Returns a new list with all falsy values removed.
   * @returns A new `FlowList` containing only truthy elements.
   */
  compact() {
    return FlowList.of<T>(this.array.filter(Boolean));
  }

  /**
   * IMMUTABLE
   * Returns a new list with duplicate values removed, preserving first occurrence order.
   * @returns A new `FlowList` of unique elements.
   */
  uniq() {
    return FlowList.of<T>(Array.from(new Set(this.array)));
  }

  /**
   * IMMUTABLE
   * Returns a new list with duplicates removed based on a property key, preserving first occurrence order.
   * @param prop - The property key to determine uniqueness by.
   * @returns A new `FlowList` of elements unique by `prop`.
   */
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

  /**
   * Returns the first element of the list, or `undefined` if the list is empty.
   */
  head() {
    return this.array[0];
  }

  /**
   * IMMUTABLE
   * Returns a new list containing only the first element.
   * @returns A `FlowList` with the first element, or an empty `FlowList` if the list is empty.
   */
  toHead() {
    return FlowList.of<T>(this.array.length ? [this.array[0]] : []);
  }

  /**
   * IMMUTABLE
   * Returns a new list containing only the element at index `n`. Supports negative indices.
   * @param n - The index to retrieve. Negative values count from the end.
   * @returns A `FlowList` with the element at `n`, or an empty `FlowList` if out of bounds.
   */
  toIndex(n: number) {
    if (n >= 0 && n < this.array.length) return FlowList.of<T>([this.array[n]]);
    if (n < 0 && n >= -this.array.length)
      return FlowList.of<T>([this.array[this.array.length + n]]);
    return FlowList.of<T>([]);
  }

  /**
   * Invokes `fn` on each element as a side effect, then returns the same list.
   * Useful for logging or debugging mid-chain without affecting values.
   * @param fn - A callback receiving each element, its index, and the list.
   * @returns The original `FlowList`.
   */
  tap(fn: ListCallback<T, void>) {
    this.array.forEach((el, idx) => fn(el, idx, this));
    return this;
  }

  /**
   * Passes the entire list to `fn` as a side effect, then returns the list unchanged.
   * Useful for inspecting or logging the list as a whole mid-chain.
   * @param fn - A callback receiving the list.
   * @returns The original `FlowList`.
   */
  peek(fn: (list: FlowList<T>) => void) {
    fn(this);
    return this;
  }

  /**
   * Passes the list to `fn` and returns whatever `fn` returns.
   * Use this to break out of the `FlowList` chain into an arbitrary value.
   * @param fn - A transform function receiving the list.
   * @returns The return value of `fn`.
   */
  thru(fn: (list: FlowList<T>) => void) {
    return fn(this);
  }

  /**
   * Logs the internal array to the console with an optional label, then returns the list unchanged.
   * @param label - A prefix for the log output. Defaults to `'Array Values --> '`.
   * @returns The original `FlowList`.
   */
  inspect(label = 'Array Values --> ') {
    console.log(label, this.array);
    return this;
  }

  /**
   * Returns the last element of the list, or `undefined` if the list is empty.
   */
  tail() {
    return this.array[this.array.length - 1];
  }

  /**
   * IMMUTABLE
   * Returns a new list containing only the last element.
   * @returns A `FlowList` with the last element, or an empty `FlowList` if the list is empty.
   */
  toTail() {
    return FlowList.of<T>(
      this.array.length ? [this.array[this.array.length - 1]] : [],
    );
  }

  /**
   * IMMUTABLE
   * Returns a new list of elements not present in any of the given lists.
   * @param lists - One or more arrays or `FlowList` instances to exclude.
   * @returns A new `FlowList` containing only elements unique to this list.
   */
  difference(...lists: (T[] | FlowList<T>)[]) {
    const exclude = FlowList.of(lists)
      .flatMap((a) => a)
      .toSet();
    return FlowList.of<T>(this.array.filter((el) => !exclude.has(el)));
  }

  /**
   * IMMUTABLE
   * Returns a new list of elements that appear in exactly one of the input lists (symmetric difference).
   * @param lists - One or more arrays or `FlowList` instances to compare against.
   * @returns A new `FlowList` of elements unique to a single list.
   */
  xor(...lists: (T[] | FlowList<T>)[]) {
    const sets = [this.array, ...lists].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of<T>(result);
  }

  /**
   * IMMUTABLE
   * Returns a new list of elements present in this list and all given lists.
   * @param lists - One or more arrays or `FlowList` instances to intersect with.
   * @returns A new `FlowList` of common elements.
   */
  intersection(...lists: (T[] | FlowList<T>)[]) {
    return FlowList.of<T>(
      this.array.filter((v) => lists.every((arr) => arr.includes(v))),
    );
  }

  /**
   * IMMUTABLE
   * Returns a new deduplicated list of all elements across this list and all given lists.
   * @param lists - One or more arrays or `FlowList` instances to merge.
   * @returns A new `FlowList` of unique elements from all lists.
   */
  union(...lists: (T[] | FlowList<T>)[]) {
    const allLists = [this.array, ...lists].flatMap((a) =>
      FlowList.isFlowList(a) ? a.toArray() : a,
    );
    return FlowList.of(allLists).uniq();
  }

  /**
   * IMMUTABLE
   * Splits the list into two groups based on the predicate.
   * @param predicate - A predicate receiving each element, its index, and the list.
   * @returns A `FlowList` of two arrays: `[passing, failing]`.
   */
  partition(predicate: ListPredicate<T>): FlowList<T[]> {
    const pass: T[] = [];
    const fail: T[] = [];

    this.array.forEach((value, index) => {
      (predicate(value, index, this) ? pass : fail).push(value);
    });
    return FlowList.of<T[]>([pass, fail]);
  }

  /**
   * IMMUTABLE
   * Zips this list with one or more lists into a list of tuples.
   * The result length matches the longest input; missing positions are filled with `undefined`.
   * @param lists - One or more arrays or `FlowList` instances to zip with.
   * @returns A new `FlowList` of element tuples.
   */
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

  /**
   * IMMUTABLE
   * Groups elements by a derived key, returning a list of `[key, elements[]]` pairs.
   * @param fn - A callback returning a `PropertyKey` for each element.
   * @returns A `FlowList` of `[PropertyKey, T[]]` entries.
   */
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

  /**
   * IMMUTABLE
   * Returns a new list sorted by a derived key in ascending order.
   * @param fn - A function returning a comparable sort key for each element.
   * @returns A new sorted `FlowList`.
   */
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

  /**
   * Returns a shallow copy of the internal array.
   * @returns A plain `T[]`.
   */
  toArray() {
    return [...this.array];
  }

  /**
   * Converts the list to a `Set`.
   * @returns A `Set<T>` of the list's elements.
   */

  toSet() {
    return new Set<T>(this.array);
  }

  /**
   * Converts the list to a `Map`, treating each element as a `[key, value]` pair.
   * @returns A `Map` built from the list's elements.
   */
  toMap() {
    return new Map(this.array as [PropertyKey, T][]);
  }

  /**
   * Converts the list to a plain object, treating each element as a `[key, value]` pair.
   * @returns A `Record` built from the list's elements.
   */
  toObject() {
    return Object.fromEntries<T>(this.array as [PropertyKey, T][]);
  }
}
