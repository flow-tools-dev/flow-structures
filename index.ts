class FlowList<T> extends Array<T> {
  constructor(n: number) {
    super(n);
  }

  static of<T>(...items: T[]) {
    return FlowList.from<T>(items);
  }

  static from<T>(arr: T[]): FlowList<T> {
    return new FlowList<T>(arr.length)
      .fill(null as unknown as T)
      .map((_, i) => arr[i]) as FlowList<T>;
  }

  batch(n: number) {
    const agg: T[][] = [];
    let chunk: T[] = [];
    this.forEach((el) => {
      if (chunk.length < n) chunk.push(el);
      if (chunk.length === n) {
        agg.push(chunk);
        chunk = [];
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

  difference(...arrs: T[][]) {
    const set = new Set(arrs.flat());
    return FlowList.of(...this.filter((el) => !set.has(el)));
  }

  xor(...arrs: T[][]) {
    const sets = [this, ...arrs].map((a) => new Set(a));
    const result = sets
      .flatMap((s) => [...s])
      .filter((el) => sets.filter((s) => s.has(el)).length === 1);
    return FlowList.of(...result);
  }

  union(...arrs: T[][]) {
    return FlowList.of(...this, ...arrs.flat()).dedupe();
  }
}

const q = FlowList.of(1, 2, 3, 7);
const a = [1, 2, 3];
const b = [4, 5, 6];
