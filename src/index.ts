class FlowList<T> {
  private array: T[];
  constructor(array: T[]) {
    this.array = array;
  }

  static of<T>(items: T[]) {
    return new FlowList(items);
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

  unshift(...items: T[]) {
    return this.array.unshift(...items);
  }

  map<U>(fn: (value: T, index: number, list: FlowList<T>) => U): FlowList<U> {
    return FlowList.of<U>(this.array.map((v, i) => fn(v, i, this)));
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

  filter(
    predicate: (value: T, index: number, list: FlowList<T>) => boolean,
  ): FlowList<T> {
    return FlowList.of(this.array.filter((v, i) => predicate(v, i, this)));
  }

  reduce<U>(
    fn: (acc: U, curr: T, index: number, list: FlowList<T>) => U,
    init: U,
  ): U {
    return this.array.reduce((acc, curr, i) => fn(acc, curr, i, this), init);
  }

  some(fn: (value: T, index: number, list: FlowList<T>) => boolean): boolean {
    return this.array.some((v, i) => fn(v, i, this));
  }

  every(fn: (value: T, index: number, list: FlowList<T>) => boolean): boolean {
    return this.array.every((v, i) => fn(v, i, this));
  }

  find(
    fn: (value: T, index: number, list: FlowList<T>) => boolean,
  ): T | undefined {
    return this.array.find((v, i) => fn(v, i, this));
  }

  findIndex(
    fn: (value: T, index: number, list: FlowList<T>) => boolean,
  ): number {
    return this.array.findIndex((v, i) => fn(v, i, this));
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

  toSpliced(start: number, deleteCount?: number, ...items: T[]): FlowList<T> {
    // @ts-expect-error
    return FlowList.of<T>(this.array.toSpliced(start, deleteCount, ...items));
  }

  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(this.array.slice(start, end));
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

  compact() {
    return FlowList.of<T>(this.array.filter(Boolean));
  }

  dedupe() {
    return FlowList.of<T>(Array.from(new Set(this.array)));
  }

  head() {
    return this.array[0];
  }

  tail() {
    return this.array[this.array.length - 1];
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
    return FlowList.of([...this.array, ...arrs.flat()]).dedupe();
  }

  partition(
    predicate: (value: T, index: number, list: FlowList<T>) => boolean,
  ): FlowList<T[]> {
    const pass: T[] = [];
    const fail: T[] = [];

    this.array.forEach((value, index) => {
      (predicate(value, index, this) ? pass : fail).push(value);
    });
    return FlowList.of<T[]>([pass, fail]);
  }

  toArray() {
    return this.array;
  }
}
const q = FlowList.of([1, 2]).toSorted().batch(2).flat().batch(2);
const a = [1, 2, 3];
const b = [4, 5, 6];

console.log(q);
