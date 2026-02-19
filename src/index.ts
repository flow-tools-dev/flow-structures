type Predicate<T> = (value: T, index: number, list: FlowList<T>) => boolean;

class FlowList<T> {
  private array: T[];
  constructor(array: T[]) {
    this.array = array;
  }

  static of<T>(v: T[]) {
    return new FlowList(v);
  }

  static from<T>(source: Iterable<T> | ArrayLike<T> | FlowList<T>) {
    if (source instanceof FlowList) return new FlowList(source.toArray());
    return new FlowList(Array.from(source as ArrayLike<T>));
  }

  static isFlowList(item: any) {
    return item instanceof FlowList;
  }

  get length() {
    return this.array.length;
  }

  entries(): IterableIterator<[number, T]> {
    return this.array.entries();
  }

  keys(): IterableIterator<number> {
    return this.array.keys();
  }

  values(): IterableIterator<T> {
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

  forEach(fn: (value: T, index: number, list: FlowList<T>) => void) {
    this.array.forEach((el: T, i: number) => fn(el, i, this));
  }

  forEachRight(fn: (value: T, index: number, list: FlowList<T>) => void) {
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

  flatMap<U>(
    fn: (value: T, index: number, list: FlowList<T>) => U | U[] | FlowList<U>,
  ): FlowList<U> {
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

  filter(predicate: Predicate<T>): FlowList<T> {
    return FlowList.of(this.array.filter((v, i) => predicate(v, i, this)));
  }

  filterNot(predicate: Predicate<T>) {
    return FlowList.of(this.array.filter((v, i) => !predicate(v, i, this)));
  }

  tally(predicate: Predicate<T>) {
    return this.array.filter((el, i) => predicate(el, i, this)).length;
  }

  reduce<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduce((acc, curr, i) => fn(acc, curr, i, this), init);
  }

  some(fn: Predicate<T>): boolean {
    return this.array.some((v, i) => fn(v, i, this));
  }

  every(fn: Predicate<T>): boolean {
    return this.array.every((v, i) => fn(v, i, this));
  }

  find(fn: Predicate<T>): T | undefined {
    return this.array.find((v, i) => fn(v, i, this));
  }

  findLast(fn: Predicate<T>) {
    return this.array.findLast((v, i) => fn(v, i, this));
  }

  findLastIndex(fn: Predicate<T>) {
    return this.array.findLastIndex((v, i) => fn(v, i, this));
  }

  lastIndexOf(v: T) {
    return this.array.lastIndexOf(v);
  }

  findIndex(fn: Predicate<T>): number {
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

  takeWhile(predicate: Predicate<T>) {
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

  takeRightWhile(predicate: Predicate<T>) {
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

  dropWhile(predicate: Predicate<T>) {
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

  dropRightWhile(predicate: Predicate<T>) {
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

  flat(depth?: number): FlowList<T> {
    // @ts-expect-error
    return FlowList.of<T>(this.array.flat(depth));
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

  batch(n: number) {
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

  chunk(n: number) {
    return this.batch(n);
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
    return FlowList.of<T>([this.array[0]]);
  }

  tail() {
    return this.array[this.array.length - 1];
  }

  toTail() {
    return FlowList.of<T>([this.array[this.array.length - 1]]);
  }

  difference(...arrs: T[][]) {
    const set = new Set(arrs.flat());
    return FlowList.of<T>(this.array.filter((el) => !set.has(el)));
  }

  xor(...arrs: T[][]) {
    const sets = [this.array, ...arrs].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of<T>(result);
  }

  union(...arrs: T[][]) {
    return FlowList.of([...this.array, ...arrs.flat()]).uniq();
  }

  partition(predicate: Predicate<T>): FlowList<T[]> {
    const pass: T[] = [];
    const fail: T[] = [];

    this.array.forEach((value, index) => {
      (predicate(value, index, this) ? pass : fail).push(value);
    });
    return FlowList.of<T[]>([pass, fail]);
  }

  zip<U>(...lists: (FlowList<U> | U[])[]): FlowList<[T, ...U[]]> {
    // normalize everything to arrays
    const allArrays: unknown[][] = [
      this.array,
      ...lists.map((l) => (l instanceof FlowList ? l.toArray() : l)),
    ];

    const maxLen = Math.max(...allArrays.map((a) => a.length));
    const zipped: [T, ...U[]][] = [];

    for (let i = 0; i < maxLen; i++) {
      // map each array to its i-th element
      zipped.push(allArrays.map((a) => a[i]) as [T, ...U[]]);
    }

    return FlowList.of(zipped);
  }

  toArray() {
    return this.array;
  }
}
const q = FlowList.of([1, 2]).toSorted().batch(2).flat().batch(2);
const a = [1, 2, 3];
const b = [4, 5, 6];
