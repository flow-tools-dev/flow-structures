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

  static of<T>(v: T[]) {
    return new FlowList(v);
  }

  static from<T>(source: Iterable<T> | ArrayLike<T> | FlowList<T>) {
    if (source instanceof FlowList) return FlowList.of<T>(source.toArray());
    return FlowList.of<T>(Array.from(source as ArrayLike<T>));
  }

  static isFlowList(item: unknown) {
    return item instanceof FlowList;
  }

  get length() {
    return this.array.length;
  }

  entries() {
    return this.array.entries();
  }

  keys() {
    return this.array.keys();
  }

  values() {
    return this.array.values();
  }

  pop() {
    return this.array.pop();
  }

  push(...items: T[]) {
    return this.array.push(...items);
  }

  shift() {
    return this.array.shift();
  }

  join(s: string) {
    return this.array.join(s);
  }

  unshift(...items: T[]) {
    return this.array.unshift(...items);
  }

  map<U>(fn: (value: T, index: number, list: FlowList<T>) => U): FlowList<U> {
    return FlowList.of<U>(this.array.map((v, i) => fn(v, i, this)));
  }

  forEach(fn: ListCallback<T, void>) {
    this.array.forEach((el: T, i: number) => fn(el, i, this));
  }

  forEachRight(fn: ListCallback<T, void>) {
    for (let i = this.array.length - 1; i >= 0; i--) {
      fn(this.array[i], i, this);
    }
  }

  fill(v: T, start: number, end: number): FlowList<T> {
    return FlowList.of<T>(this.array.fill(v, start, end));
  }

  toFilled<U>(
    v: U,
    start: number = 0,
    end: number = this.length,
  ): FlowList<T | U> {
    return FlowList.of<T | U>(
      this.array.map<T | U>((el: T, i: number) =>
        i >= start && i < end ? v : el,
      ),
    );
  }

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

  copyWithin(target: number, start: number, end?: number) {
    return FlowList.of<T>(this.array.copyWithin(target, start, end));
  }

  toCopiedWithin(target: number, start: number, end?: number) {
    return FlowList.of<T>([...this.array].copyWithin(target, start, end));
  }

  filter(predicate: ListPredicate<T>): FlowList<T> {
    return FlowList.of<T>(this.array.filter((v, i) => predicate(v, i, this)));
  }

  reject(predicate: ListPredicate<T>) {
    return FlowList.of<T>(this.array.filter((v, i) => !predicate(v, i, this)));
  }

  tally(predicate: ListPredicate<T>) {
    return this.array.filter((el, i) => predicate(el, i, this)).length;
  }

  reduce<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduce((acc, curr, i) => fn(acc, curr, i, this), init);
  }
  reduceRight<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduceRight(
      (acc, curr, i) => fn(acc, curr, i, this),
      init,
    );
  }

  insert(index: number, ...items: T[]): FlowList<T> {
    return FlowList.of(this.array.toSpliced(index, 0, ...items));
  }

  some(fn: ListPredicate<T>): boolean {
    return this.array.some((v, i) => fn(v, i, this));
  }

  every(fn: ListPredicate<T>): boolean {
    return this.array.every((v, i) => fn(v, i, this));
  }

  find(fn: ListPredicate<T>): T | undefined {
    return this.array.find((v, i) => fn(v, i, this));
  }

  findLast(fn: ListPredicate<T>) {
    return this.array.findLast((v, i) => fn(v, i, this));
  }

  findLastIndex(fn: ListPredicate<T>) {
    return this.array.findLastIndex((v, i) => fn(v, i, this));
  }

  lastIndexOf(v: T) {
    return this.array.lastIndexOf(v);
  }

  findIndex(fn: ListPredicate<T>): number {
    return this.array.findIndex((v, i) => fn(v, i, this));
  }

  indexOf(el: T, start: number) {
    return this.array.indexOf(el, start);
  }

  includes(value: T): boolean {
    return this.array.includes(value);
  }

  at(index: number): T | undefined {
    return this.array.at(index);
  }

  toReversed() {
    return FlowList.of<T>(this.array.toReversed());
  }

  toSorted(fn?: (a: T, b: T) => number) {
    return FlowList.of<T>(this.array.toSorted(fn));
  }

  with(i: number, v: T) {
    return FlowList.of<T>(this.array.with(i, v));
  }

  without(...vals: T[]) {
    return FlowList.of<T>(this.array.filter((v) => !vals.includes(v)));
  }

  toSpliced(start: number, deleteCount?: number, ...items: T[]): FlowList<T> {
    // @ts-expect-error
    return FlowList.of<T>(this.array.toSpliced(start, deleteCount, ...items));
  }

  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(this.array.slice(start, end));
  }

  take(n: number) {
    if (n <= 0) return FlowList.of<T>([]);
    return FlowList.of<T>(this.array.slice(0, n));
  }

  takeWhile(predicate: ListPredicate<T>) {
    const take = [];
    for (let i = 0; i <= this.array.length - 1; i++) {
      if (!predicate(this.array[i], i, this)) break;
      take.push(this.array[i]);
    }
    return FlowList.of<T>(take);
  }

  takeRight(n: number) {
    if (n <= 0) return FlowList.of<T>([]);
    return FlowList.of<T>(this.array.slice(-n));
  }

  takeRightWhile(predicate: ListPredicate<T>) {
    const take = [];
    for (let i = this.array.length - 1; i >= 0; i--) {
      if (!predicate(this.array[i], i, this)) break;
      take.push(this.array[i]);
    }
    return FlowList.of<T>(take.toReversed());
  }

  drop(n: number) {
    if (n <= 0) return this;
    return this.slice(n);
  }

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

  dropRight(n: number) {
    if (n <= 0) return this;
    return FlowList.of<T>(this.array.slice(0, -n));
  }

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

  concat(...items: ConcatArray<T>[]): FlowList<T> {
    return FlowList.of(this.array.concat(...items));
  }

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
