class FlowList<T> extends Array<T> {
  constructor(...n: any) {
    super(...n);
  }

  static get [Symbol.species]() {
    return FlowList;
  }

  static of<T>(...items: T[]) {
    return new FlowList<T>(...items);
  }

  static from<T>(arr: T[]): FlowList<T> {
    return new FlowList<T>(arr.length)
      .fill(null as unknown as T)
      .map((_, i) => arr[i]) as FlowList<T>;
  }

  // @ts-expect-error
  map<U>(
    callback: (value: T, index: number, array: FlowList<T>) => U,
  ): FlowList<U> {
    return super.map(
      callback as (value: T, index: number, array: T[]) => U,
    ) as FlowList<U>;
  }

  // @ts-expect-error
  filter(
    predicate: (value: T, index: number, array: FlowList<T>) => boolean,
  ): FlowList<T> {
    return super.filter(
      predicate as (value: T, index: number, array: T[]) => boolean,
    ) as FlowList<T>;
  }
  // @ts-expect-error
  toReversed() {
    return FlowList.of<T>(...super.toReversed());
  }
  // @ts-expect-error
  toSorted(fn?: (a: T, b: T) => number) {
    return FlowList.of<T>(...super.toSorted(fn));
  }
  // @ts-expect-error
  toSpliced(start: number, deleteCount: number, ...items: T[]): FlowList<T> {
    return FlowList.of<T>(...super.toSpliced(start, deleteCount, ...items));
  }
  // @ts-expect-error
  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(...super.slice(start, end));
  }
  // @ts-expect-error
  concat(...items: (T | T[])[]): FlowList<T> {
    return FlowList.of<T>(...super.concat(...items));
  }

  // @ts-expect-error
  flat(depth?: number): FlowList<any> {
    return FlowList.of(...super.flat(depth));
  }

  batch(n: number) {
    const agg: FlowList<T>[] = [];
    let chunk: FlowList<T> = FlowList.of<T>();
    this.forEach((el) => {
      if (chunk.length < n) chunk.push(el);
      if (chunk.length === n) {
        agg.push(chunk);
        chunk = FlowList.of<T>();
      }
    });
    if (chunk.length) agg.push(chunk);
    return FlowList.of(...agg);
  }

  compact() {
    return FlowList.of(...this.filter(Boolean));
  }

  dedupe() {
    return FlowList.of(...new Set(this));
  }

  head() {
    return this.at(0);
  }

  tail() {
    return this.at(this.length - 1);
  }

  difference(...arrs: T[][] | FlowList<T>[]) {
    const set = new Set(arrs.flat());
    return FlowList.of(...this.filter((el) => !set.has(el)));
  }

  xor(...arrs: T[][] | FlowList<T>[]) {
    const sets = [this, ...arrs].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of(...result);
  }

  union(...arrs: T[][] | FlowList<T>[]) {
    return FlowList.of(...this, ...arrs.flat()).dedupe();
  }
}

const q = FlowList.of(1, 2, 3, 4, 4, 4)
  .toReversed()
  .toSorted()
  .batch(2)
  .flat()
  .batch(2)
  .map((fl) => fl.head());
console.log(q);
const a = [1, 2, 3];
const b = [4, 5, 6];
