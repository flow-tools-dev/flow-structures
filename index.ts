type ListOrArr<T> = T[] | FlowList<T>;

class FlowList<T> extends Array<T> {
  constructor(...n: any) {
    super(...n);
  }

  static get [Symbol.species]() {
    return FlowList;
  }

  static of<T>(...items: T[]) {
    const f = new FlowList<T>();
    f.push(...items);
    return f;
  }

  static isFlowList(item: any) {
    return item instanceof FlowList;
  }

  static empty(n: number) {
    return new FlowList(n);
  }

  map<U>(
    callback: (value: T, index: number, array: FlowList<T>) => U,
    thisArg?: any,
  ): FlowList<U> {
    return super.map(
      callback as (value: T, index: number, array: T[]) => U,
      thisArg,
    ) as FlowList<U>;
  }

  // @ts-expect-error
  filter(
    predicate: (value: T, index: number, array: FlowList<T>) => boolean,
    thisArg?: any,
  ): FlowList<T> {
    return super.filter(
      predicate as (value: T, index: number, array: T[]) => boolean,
      thisArg,
    ) as FlowList<T>;
  }

  toReversed() {
    return FlowList.of<T>(...super.toReversed());
  }

  toSorted(fn?: (a: T, b: T) => number) {
    return FlowList.of<T>(...super.toSorted(fn));
  }

  toSpliced(start: number, deleteCount?: number, ...items: T[]): FlowList<T> {
    // @ts-expect-error
    return FlowList.of<T>(...super.toSpliced(start, deleteCount, ...items));
  }
  slice(start?: number, end?: number): FlowList<T> {
    return FlowList.of<T>(...super.slice(start, end));
  }

  concat(...items: (T | ListOrArr<T>)[]): FlowList<T> {
    const arr: T[] = [];
    items.forEach((item) => {
      Array.isArray(item)
        ? arr.push(...item)
        : FlowList.isFlowList(item)
          ? arr.push(...item)
          : arr.push(item);
    });
    return FlowList.of<T>(...arr);
  }

  // @ts-expect-error
  flat(depth?: number): FlowList<T> {
    return FlowList.of<T>(...(super.flat(depth) as any));
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

  difference(...arrs: ListOrArr<T>[]) {
    const set = new Set(arrs.flat());
    return FlowList.of(...this.filter((el) => !set.has(el)));
  }

  xor(...arrs: ListOrArr<T>[]) {
    const sets = [this, ...arrs].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of(...result);
  }

  union(...arrs: ListOrArr<T>[]) {
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
const a = [1, 2, 3];
const b = [4, 5, 6].map;

console.log();
