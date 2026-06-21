export type Entry<K, V> = readonly [K, V];
export type CollectionCallback<K, V, R> = (
  value: V,
  key: K,
  collection: FlowCollection<K, V>,
) => R;

export type Source<K, V> =
  | Iterable<readonly [K, V]>
  | (K extends PropertyKey ? Record<K, V> : never);

export const isPlainObject = (
  value: unknown,
): value is Record<PropertyKey, any> => {
  if (typeof value !== 'object' || value === null) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export class FlowCollection<K, V> {
  private collection: Map<K, V>;

  constructor(map: Map<K, V> = new Map<K, V>()) {
    this.collection = map;
  }

  /**
   * Checks if a value is a FlowCollection instance.
   * @param v - The value to check.
   * @returns `true` if `v` is a `FlowCollection`, otherwise `false`.
   */
  static isFlowCollection(v: unknown): v is FlowCollection<unknown, unknown> {
    return v instanceof FlowCollection;
  }

  /**
   * Creates a new FlowCollection from an iterable of `[key, value]` entries.
   * @param entries - An iterable of `[key, value]` pairs.
   * @returns A new `FlowCollection` instance.
   */
  static of<K, V>(entries: Iterable<Entry<K, V>>) {
    return new FlowCollection<K, V>(new Map(entries));
  }

  /**
   * Creates a new FlowCollection from an iterable of `[key, value]` pairs or a plain object.
   * @param source - An iterable of `[key, value]` pairs, or a plain `Record`.
   * @returns A new `FlowCollection` instance.
   */
  static from<K, V>(source: Iterable<Entry<K, V>>): FlowCollection<K, V>;
  static from<K extends PropertyKey, V>(
    source: Record<K, V>,
  ): FlowCollection<K, V>;
  static from(source: any) {
    const src = isPlainObject(source) ? Object.entries(source) : source;
    return FlowCollection.of(src);
  }

  /**
   * Gets the number of entries in the collection.
   * @returns The size of the collection.
   */
  get size() {
    return this.collection.size;
  }

  /**
   * Wraps around the internal Map.get.
   * @param key - The key to retrieve.
   * @returns The value at `key`, or `undefined` if not found.
   */
  get(key: K) {
    return this.collection.get(key);
  }

  /**
   * MUTABLE
   * Wraps around the internal Map.set.
   * @param key - The key to set.
   * @param value - The value to associate with `key`.
   * @returns The mutated collection.
   */
  set(key: K, value: V) {
    this.collection.set(key, value);
    return this;
  }

  /**
   * Returns `true` if the collection has no entries.
   * @returns `true` if the collection is empty, otherwise `false`.
   */
  isEmpty() {
    return this.collection.size <= 0;
  }

  /**
   * IMMUTABLE
   * Returns a new collection with the given key set to `value`.
   * @param key - The key to set.
   * @param value - The value to associate with `key`.
   * @returns A new `FlowCollection` with the entry added or replaced.
   */
  with(key: K, value: V) {
    return new FlowCollection(new Map<K, V>(this.collection).set(key, value));
  }

  /**
   * IMMUTABLE
   * Returns a new collection with the value at `key` transformed by `fn`.
   * If the key does not exist, the original collection is returned unchanged.
   * @param key - The key of the entry to update.
   * @param fn - A function receiving the current value and returning the new value.
   * @returns A new `FlowCollection` with the updated entry, or the original if the key was not found.
   */
  update(key: K, fn: (value: V) => V): FlowCollection<K, V> {
    if (!this.collection.has(key)) return this;
    const m = new Map(this.collection);
    m.set(key, fn(this.collection.get(key) as V));
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection with the given key-value pair inserted at the beginning.
   * If the key already exists, it is moved to the front.
   * @param key - The key to prepend.
   * @param value - The value to associate with `key`.
   * @returns A new `FlowCollection` with the entry at the front.
   */
  prepend(key: K, value: V) {
    const m = new Map<K, V>();
    m.set(key, value);
    for (const [k, v] of this.collection) {
      if (k !== key) m.set(k, v);
    }
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection with the given key removed.
   * @param key - The key to remove.
   * @returns A new `FlowCollection` without the specified key.
   */
  without(key: K) {
    const m = new Map(this.collection);
    m.delete(key);
    return new FlowCollection(m);
  }

  /**
   * Wraps around the internal Map.has.
   * @param k - The key to check.
   * @returns `true` if the key exists, otherwise `false`.
   */
  has(k: K) {
    return this.collection.has(k);
  }

  /**
   * Returns the first value for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns The first matching value, or `undefined` if none is found.
   */
  find(predicate: CollectionCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) return v;
    }
  }

  /**
   * Returns the last value for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns The last matching value, or `undefined` if none is found.
   */
  findLast(predicate: CollectionCallback<K, V, boolean>) {
    let el;
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) el = v;
    }
    return el;
  }

  /**
   * Returns the first `[key, value]` entry for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns The first matching `[key, value]` tuple, or `undefined` if none is found.
   */
  findEntry(predicate: CollectionCallback<K, V, boolean>): [K, V] | undefined {
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) return [k, v];
    }
  }

  /**
   * Returns the last `[key, value]` entry for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns The last matching `[key, value]` tuple, or `undefined` if none is found.
   */
  findLastEntry(
    predicate: CollectionCallback<K, V, boolean>,
  ): [K, V] | undefined {
    let el: [K, V] | undefined = undefined;
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) el = [k, v];
    }
    return el;
  }

  /**
   * IMMUTABLE
   * Splits the collection into two groups based on the predicate.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns A `FlowCollection` with two entries: `true` for passing values, `false` for failing values.
   */
  partition(predicate: CollectionCallback<K, V, boolean>) {
    const truthy: V[] = [];
    const falsy: V[] = [];
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) truthy.push(v);
      else falsy.push(v);
    }
    return FlowCollection.of([
      [true, truthy],
      [false, falsy],
    ]);
  }

  /**
   * IMMUTABLE
   * Maps each entry to a new `Source` and merges all resulting entries into a new collection.
   * Accepts both plain objects and iterables of `[key, value]` pairs as return values.
   * @param fn - A callback receiving each value, its key, and the collection. Returns a `Source<NK, NV>`.
   * @returns A new `FlowCollection` of the merged resulting entries.
   */
  flatMap<NK, NV>(
    fn: CollectionCallback<K, V, Source<NK, NV>>,
  ): FlowCollection<NK, NV> {
    const m = new Map<NK, NV>();
    for (const [k, v] of this.collection) {
      const output = fn(v, k, this);
      const entries = isPlainObject(output) ? Object.entries(output) : output;
      for (const [newK, newV] of entries as Iterable<Entry<NK, NV>>) {
        m.set(newK, newV);
      }
    }
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection with keys and values swapped.
   * @returns A new `FlowCollection<V, K>` with inverted entries.
   */
  invert() {
    const m = new Map<V, K>();
    for (const [k, v] of this.collection) {
      m.set(v, k);
    }
    return new FlowCollection<V, K>(m);
  }

  /**
   * Counts the number of entries for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns The number of entries for which the predicate returned truthy.
   */
  tally(predicate: CollectionCallback<K, V, boolean>) {
    return this.filter(predicate).size;
  }

  /**
   * IMMUTABLE
   * Counts occurrences of each derived key across the collection's values.
   * @param fn - A callback receiving each value, its key, and the collection. Returns the group key to tally by.
   * @returns A `Map` of each derived key to the number of values that produced it.
   */
  tallyBy<R>(fn: CollectionCallback<K, V, R>) {
    const acc = new Map<R, number>();
    for (const [key, v] of this.collection) {
      const k = fn(v, key, this);
      acc.set(k, (acc.get(k) ?? 0) + 1);
    }
    return new FlowCollection(acc);
  }

  /**
   * Returns `true` if the given value exists anywhere in the collection.
   * @param value - The value to search for.
   * @returns `true` if found, otherwise `false`.
   */
  includes(value: V) {
    for (const [k, v] of this.collection) {
      if (value === v) return true;
    }
    return false;
  }

  /**
   * Wraps around the internal Map.keys.
   * @returns An iterator of keys.
   */
  keys() {
    return this.collection.keys();
  }

  /**
   * Wraps around the internal Map.values.
   * @returns An iterator of values.
   */
  values() {
    return this.collection.values();
  }

  /**
   * Wraps around the internal Map.entries.
   * @returns An iterator of `[key, value]` pairs.
   */
  entries() {
    return this.collection.entries();
  }

  /**
   * MUTABLE
   * Wraps around the internal Map.delete.
   * @param key - The key to delete.
   * @returns `true` if the key existed and was deleted, otherwise `false`.
   */
  delete(key: K) {
    return this.collection.delete(key);
  }

  /**
   * MUTABLE
   * Wraps around the internal Map.clear. Removes all entries.
   * @returns The mutated collection.
   */
  clear() {
    this.collection.clear();
    return this;
  }

  /**
   * IMMUTABLE
   * Returns a new collection with each value transformed by `fn`.
   * Keys are preserved.
   * @param fn - A callback receiving each value, its key, and the collection.
   * @returns A new `FlowCollection` with the mapped values.
   */
  map<U>(fn: CollectionCallback<K, V, U>) {
    const m = new Map<K, U>();
    for (const [k, v] of this.collection) {
      m.set(k, fn(v, k, this));
    }
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection with both keys and values transformed by `fn`.
   * @param fn - A callback receiving each value, its key, and the collection. Returns a `[newKey, newValue]` tuple.
   * @returns A new `FlowCollection` with the remapped entries.
   */
  mapEntries<NK, NV>(fn: CollectionCallback<K, V, [NK, NV]>) {
    const m = new Map<NK, NV>();
    for (const [k, v] of this.collection) {
      const [key, value] = fn(v, k, this);
      m.set(key, value);
    }
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection with keys transformed by `fn`. Values are preserved.
   * @param fn - A callback receiving each value, its key, and the collection. Returns the new key.
   * @returns A new `FlowCollection` with the remapped keys.
   */
  mapKeys<NK>(fn: CollectionCallback<K, V, NK>) {
    const m = new Map<NK, V>();
    for (const [k, v] of this.collection) {
      const newK = fn(v, k, this);
      m.set(newK, v);
    }
    return new FlowCollection(m);
  }

  /**
   * IMMUTABLE
   * Groups entries by a derived key, collecting values into arrays.
   * The resulting collection has group keys as keys and arrays of matching values as values.
   * @param fn - A callback returning a group key for each entry.
   * @returns A new `FlowCollection<G, V[]>` of grouped values.
   */
  groupBy<G>(fn: CollectionCallback<K, V, G>): FlowCollection<G, V[]> {
    const grouped = new Map<G, V[]>();
    for (const [k, v] of this.collection) {
      const key = fn(v, k, this);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(v);
    }
    return new FlowCollection(grouped);
  }

  /**
   * IMMUTABLE
   * Returns a new collection sorted by a derived key in ascending order.
   * @param fn - A callback returning a comparable sort key for each entry.
   * @returns A new sorted `FlowCollection`.
   */
  sortBy(
    fn: CollectionCallback<K, V, string | number | boolean>,
  ): FlowCollection<K, V> {
    const sorted = [...this.collection].sort(([k1, v1], [k2, v2]) => {
      const a = fn(v1, k1, this);
      const b = fn(v2, k2, this);
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
    return new FlowCollection(new Map(sorted));
  }

  /**
   * IMMUTABLE
   * Returns a new collection sorted by a raw comparator function over `[key, value]` pairs.
   * @param fn - A comparator receiving two `[key, value]` tuples.
   * @returns A new sorted `FlowCollection`.
   */
  sortWith(fn: (a: [K, V], b: [K, V]) => number) {
    return FlowCollection.of([...this.collection].sort(fn));
  }

  /**
   * Returns `true` if every entry satisfies the predicate.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns `true` if all entries pass, otherwise `false`.
   */
  every(predicate: CollectionCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (!predicate(v, k, this)) return false;
    }
    return true;
  }

  /**
   * Returns `true` if at least one entry satisfies the predicate.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns `true` if any entry passes, otherwise `false`.
   */
  some(predicate: CollectionCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) return true;
    }
    return false;
  }

  /**
   * IMMUTABLE
   * Returns a new collection containing only entries for which the predicate returns truthy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns A new `FlowCollection` of passing entries.
   */
  filter(predicate: CollectionCallback<K, V, boolean>) {
    const m = new Map<K, V>();
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) m.set(k, v);
    }
    return new FlowCollection<K, V>(m);
  }

  /**
   * IMMUTABLE
   * The inverse of `filter`. Returns a new collection of entries for which the predicate returns falsy.
   * @param predicate - A callback receiving each value, its key, and the collection.
   * @returns A new `FlowCollection` of failing entries.
   */
  reject(predicate: CollectionCallback<K, V, boolean>) {
    const m = new Map<K, V>();
    for (const [k, v] of this.collection) {
      if (!predicate(v, k, this)) m.set(k, v);
    }
    return new FlowCollection<K, V>(m);
  }

  /**
   * IMMUTABLE
   * Returns a new collection containing only the specified keys.
   * @param keys - An array of keys to keep.
   * @returns A new `FlowCollection` with only the picked keys.
   */
  pick(keys: K[]) {
    const set = new Set(keys);
    return this.filter((_, k) => set.has(k));
  }

  /**
   * IMMUTABLE
   * Returns a new collection with the specified keys removed.
   * @param keys - An array of keys to exclude.
   * @returns A new `FlowCollection` without the omitted keys.
   */
  omit(keys: K[]) {
    const set = new Set(keys);
    return this.filter((_, k) => !set.has(k));
  }

  /**
   * IMMUTABLE
   * Returns a new collection with all entries from the given sources shallow merged in.
   * Accepts both plain objects and iterables of `[key, value]` pairs.
   * Later sources overwrite earlier keys.
   * @param sources - One or more `Source<K, V>` values to merge.
   * @returns A new `FlowCollection` with the merged entries.
   */
  merge(...sources: Source<K, V>[]) {
    const result = sources.reduce<Map<K, V>>((acc, curr) => {
      const src = isPlainObject(curr) ? Object.entries(curr) : curr;
      for (const [k, v] of src as Iterable<Entry<K, V>>) {
        acc.set(k, v);
      }
      return acc;
    }, new Map<K, V>(this.collection));
    return new FlowCollection(result);
  }

  /**
   * Wraps around the internal Map.forEach, passing the collection instance as the third argument instead of the raw map.
   * @param fn - A callback receiving each value, its key, and the collection.
   */
  forEach(fn: CollectionCallback<K, V, void>) {
    this.collection.forEach((v, k) => fn(v, k, this));
  }

  /**
   * Works like `forEach` but iterates from the last entry to the first.
   * @param fn - A callback receiving each value, its key, and the collection.
   */
  forEachRight(fn: CollectionCallback<K, V, void>) {
    const entries = [...this.collection];
    for (let i = entries.length - 1; i >= 0; i--) {
      const [k, v] = entries[i];
      fn(v, k, this);
    }
  }

  /**
   * Reduces the collection to a single value by applying `fn` to each entry from first to last.
   * @param fn - A reducer callback receiving the accumulator, current value, its key, and the collection.
   * @param initial - The initial accumulator value.
   * @returns The final accumulated value.
   */
  reduce<R>(
    fn: (acc: R, value: V, key: K, collection: this) => R,
    initial: R,
  ): R {
    return [...this.collection].reduce(
      (acc, [k, v]) => fn(acc, v, k, this),
      initial,
    );
  }

  /**
   * Reduces the collection to a single value by applying `fn` to each entry from last to first.
   * @param fn - A reducer callback receiving the accumulator, current value, its key, and the collection.
   * @param initial - The initial accumulator value.
   * @returns The final accumulated value.
   */
  reduceRight<R>(
    fn: (acc: R, value: V, key: K, collection: this) => R,
    initial: R,
  ): R {
    return [...this.collection].reduceRight(
      (acc, [k, v]) => fn(acc, v, k, this),
      initial,
    );
  }

  /**
   * Returns a plain array of all `[key, value]` entries.
   * @returns An `[K, V][]` array.
   */
  toEntries() {
    return [...this.entries()];
  }

  /**
   * Returns a plain array of all keys.
   * @returns A `K[]` array.
   */
  toKeys() {
    return [...this.keys()];
  }

  /**
   * Returns a plain array of all values.
   * @returns A `V[]` array.
   */
  toValues() {
    return [...this.values()];
  }

  /**
   * Invokes `fn` on each entry as a side effect, then returns the same collection.
   * Useful for logging or debugging mid-chain without affecting values.
   * @param fn - A callback receiving each value, its key, and the collection.
   * @returns The original Flow Collection.
   */
  tap(fn: CollectionCallback<K, V, void>) {
    this.collection.forEach((v, k) => fn(v, k, this));
    return this;
  }

  /**
   * Passes the entire collection to `fn` as a side effect, then returns the collection unchanged.
   * Useful for inspecting or logging the collection as a whole mid-chain.
   * @param fn - A callback receiving the collection.
   * @returns The original `FlowCollection`.
   */
  peek(fn: (collection: FlowCollection<K, V>) => void) {
    fn(this);
    return this;
  }

  /**
   * Passes the collection to `fn` and returns whatever `fn` returns.
   * Use this to break out of the `FlowCollection` chain into an arbitrary value.
   * @param fn - A transform function receiving the collection.
   * @returns The return value of `fn`.
   */
  thru(fn: (collection: FlowCollection<K, V>) => void) {
    return fn(this);
  }

  /**
   * Logs the internal map to the console with an optional label, then returns the collection unchanged.
   * @param label - A prefix for the log output. Defaults to `'Collection Values --> '`.
   * @returns The original `FlowCollection`.
   */
  inspect(label = 'Collection Values --> ') {
    console.log(label, this.collection);
    return this;
  }

  /**
   * Converts the collection to a plain object.
   * Keys must be `PropertyKey` compatible.
   * @returns A `Record<PropertyKey, V>` of the collection's entries.
   */
  toObject(): Record<PropertyKey, V> {
    const obj = {} as Record<PropertyKey, V>;

    this.collection.forEach((v, key) => {
      const k = key as PropertyKey;
      obj[k] = v;
    });

    return obj;
  }

  /**
   * Returns a shallow copy of the internal map.
   * @returns A native `Map<K, V>`.
   */
  toMap() {
    return new Map(this.collection);
  }

  /**
   * Returns an iterator over the collection's `[key, value]` pairs, enabling `for...of` usage.
   */
  [Symbol.iterator]() {
    return this.collection[Symbol.iterator]();
  }
}
