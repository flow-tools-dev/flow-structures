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

export function collectionFrom<K, V>(
  source: Iterable<readonly [K, V]>,
): FlowCollection<K, V>;
export function collectionFrom<K extends PropertyKey, V>(
  source: Record<K, V>,
): FlowCollection<K, V>;
export function collectionFrom(source: any) {
  return FlowCollection.from(source);
}
