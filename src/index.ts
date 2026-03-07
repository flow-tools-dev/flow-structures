import { FlowCollection, Entry, Source } from './collection';
import { FlowList } from './list';

export { FlowCollection };
export type { Entry, Source };
export { FlowList };

export const listOf = <T>(v: T[]) => FlowList.of(v);
export const listFrom = <T>(v: Iterable<T> | ArrayLike<T> | FlowList<T>) =>
  FlowList.from(v);

export const collectionOf = <K, V>(v: Iterable<Entry<K, V>>) =>
  FlowCollection.of(v);

export const collectionFrom = <K, V>(source: Source<K, V>) =>
  FlowCollection.from(source);
