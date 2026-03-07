export type Entry<K, V> = readonly [K, V];
type FlowCallback<K, V, R> = (
  value: V,
  key: K,
  collection: FlowCollection<K, V>,
) => R;

export type Source<K, V> =
  | Iterable<readonly [K, V]>
  | (K extends PropertyKey ? Record<K, V> : never);

const isPlainObject = <V>(
  value: unknown,
): value is Record<PropertyKey, any> => {
  if (typeof value !== 'object' || value === null) return false;

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export class FlowCollection<K, V> {
  private collection: Map<K, V>;

  constructor(map: Map<K, V>) {
    this.collection = map;
  }

  static of<K, V>(entries: Iterable<Entry<K, V>>) {
    return new FlowCollection<K, V>(new Map(entries));
  }

  static isFlowCollection(v: unknown): v is FlowCollection<unknown, unknown> {
    return v instanceof FlowCollection;
  }

  static from<K extends PropertyKey, V>(
    source: Record<K, V>,
  ): FlowCollection<K, V>;
  static from<K, V>(source: Iterable<readonly [K, V]>): FlowCollection<K, V>;
  static from<K, V>(source: Source<K, V>): FlowCollection<K, V>;
  static from<K, V>(source: Source<K, V>) {
    const src = isPlainObject(source) ? Object.entries(source) : source;
    return FlowCollection.of<K, V>(src as Iterable<Entry<K, V>>);
  }

  get size() {
    return this.collection.size;
  }

  get(key: K) {
    return this.collection.get(key);
  }

  set(key: K, value: V) {
    this.collection.set(key, value);
    return this;
  }

  isEmpty() {
    return this.collection.size <= 0;
  }

  with(key: K, value: V) {
    return new FlowCollection<K, V>(new Map(this.collection).set(key, value));
  }

  prepend(key: K, value: V) {
    return FlowCollection.of([[key, value], ...this.collection.entries()]);
  }

  without(key: K) {
    const m = new Map(this.collection);
    m.delete(key);
    return new FlowCollection<K, V>(m);
  }

  has(k: K) {
    return this.collection.has(k);
  }

  find(predicate: FlowCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) return v;
    }
  }

  findLast(predicate: FlowCallback<K, V, boolean>) {
    let el;
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) el = v;
    }
    return el;
  }

  partition(predicate: FlowCallback<K, V, boolean>) {
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

  flatMap<NK, NV>(
    fn: FlowCallback<K, V, Source<NK, NV>>,
  ): FlowCollection<NK, NV> {
    const m = new Map<NK, NV>();
    for (const [k, v] of this.collection) {
      const output = fn(v, k, this);
      const entries = isPlainObject(output)
        ? (Object.entries(output) as Iterable<Entry<NK, NV>>)
        : output;
      for (const [newK, newV] of entries) {
        m.set(newK, newV);
      }
    }
    return new FlowCollection(m);
  }

  invert() {
    const m = new Map<V, K>();
    for (const [k, v] of this.collection) {
      m.set(v, k);
    }
    return new FlowCollection<V, K>(m);
  }

  tally(predicate: FlowCallback<K, V, boolean>) {
    return this.filter(predicate).size;
  }

  includes(value: V) {
    for (const [k, v] of this.collection) {
      if (value === v) return true;
    }
    return false;
  }

  keys() {
    return this.collection.keys();
  }
  values() {
    return this.collection.values();
  }
  entries() {
    return this.collection.entries();
  }

  delete(key: K) {
    return this.collection.delete(key);
  }

  clear() {
    this.collection.clear();
    return this;
  }

  map<U>(fn: FlowCallback<K, V, U>) {
    const m = new Map<K, U>();
    for (const [k, v] of this.collection) {
      m.set(k, fn(v, k, this));
    }
    return new FlowCollection(m);
  }

  mapEntries<NK, NV>(fn: FlowCallback<K, V, [NK, NV]>) {
    const m = new Map<NK, NV>();
    for (const [k, v] of this.collection) {
      const [key, value] = fn(v, k, this);
      m.set(key, value);
    }
    return new FlowCollection(m);
  }

  groupBy<G>(fn: FlowCallback<K, V, G>): FlowCollection<G, V[]> {
    const grouped = new Map<G, V[]>();
    for (const [k, v] of this.collection) {
      const key = fn(v, k, this);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)?.push(v);
    }
    return new FlowCollection(grouped);
  }

  sortBy(
    fn: FlowCallback<K, V, string | number | boolean>,
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

  toSorted(fn: (a: [K, V], b: [K, V]) => number) {
    return FlowCollection.of([...this.collection].sort(fn));
  }

  every(predicate: FlowCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (!predicate(v, k, this)) return false;
    }
    return true;
  }

  some(predicate: FlowCallback<K, V, boolean>) {
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) return true;
    }
    return false;
  }

  filter(predicate: FlowCallback<K, V, boolean>) {
    const m = new Map<K, V>();
    for (const [k, v] of this.collection) {
      if (predicate(v, k, this)) m.set(k, v);
    }
    return new FlowCollection<K, V>(m);
  }

  reject(predicate: FlowCallback<K, V, boolean>) {
    const m = new Map<K, V>();
    for (const [k, v] of this.collection) {
      if (!predicate(v, k, this)) m.set(k, v);
    }
    return FlowCollection.of<K, V>(m);
  }

  pick(keys: K[]) {
    const set = new Set(keys);
    return this.filter((_, k) => set.has(k));
  }

  omit(keys: K[]) {
    const set = new Set(keys);
    return this.filter((_, k) => !set.has(k));
  }

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

  forEach(fn: FlowCallback<K, V, void>) {
    this.collection.forEach((v, k) => fn(v, k, this));
  }

  forEachRight(fn: FlowCallback<K, V, void>) {
    const entries = [...this.collection];
    for (let i = entries.length - 1; i >= 0; i--) {
      const [k, v] = entries[i];
      fn(v, k, this);
    }
  }

  reduce<R>(
    fn: (acc: R, value: V, key: K, collection: this) => R,
    initial: R,
  ): R {
    return [...this.collection].reduce(
      (acc, [k, v]) => fn(acc, v, k, this),
      initial,
    );
  }

  reduceRight<R>(
    fn: (acc: R, value: V, key: K, collection: this) => R,
    initial: R,
  ): R {
    return [...this.collection].reduceRight(
      (acc, [k, v]) => fn(acc, v, k, this),
      initial,
    );
  }

  toEntries() {
    return [...this.entries()];
  }

  toKeys() {
    return [...this.keys()];
  }

  toValues() {
    return [...this.values()];
  }

  tap(fn: FlowCallback<K, V, void>) {
    this.collection.forEach((v, k) => fn(v, k, this));
    return FlowCollection.of(this.collection);
  }

  peek(fn: (list: FlowCollection<K, V>) => void) {
    fn(this);
    return this;
  }

  thru(fn: (list: FlowCollection<K, V>) => void) {
    return fn(this);
  }

  inspect(label = 'Collection Values --> ') {
    console.log(label, this.collection);
    return this;
  }

  toObject(): Record<PropertyKey, V> {
    const obj = {} as Record<PropertyKey, V>;

    this.collection.forEach((v, key) => {
      const k = key as PropertyKey;
      obj[k] = v;
    });

    return obj;
  }

  toMap() {
    return new Map(this.collection);
  }

  [Symbol.iterator]() {
    return this.collection[Symbol.iterator]();
  }
}
