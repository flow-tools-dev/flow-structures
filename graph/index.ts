import {
  AdjacencyEntry,
  EdgeOf,
  EdgeRegistry,
  EdgeStore,
  GraphEdge,
  GraphKey,
  NodeInput,
  NodeOf,
  NodeRef,
  NodeRegistry,
  NodeStore,
} from './types';

/**
 *
 *  nodes are [LABEL][ID]
 *
 * edges are [label][id][type][label][id]
 */
const isGraphKey = (v: unknown): v is GraphKey =>
  typeof v === 'string' || typeof v === 'number';

const isEdgeObject = (e: unknown): e is GraphEdge<any> =>
  !isGraphKey(e) && typeof e === 'object' && e !== null && 'type' in e;

export class FlowGraph<NR extends NodeRegistry, ER extends EdgeRegistry> {
  private _nodes: NodeStore<NR>;
  private _edges: EdgeStore<ER>;

  constructor(nodes: NodeStore<NR>, edges: EdgeStore<ER>) {
    this._nodes = nodes;
    this._edges = edges;
  }

  static of<NR extends NodeRegistry, ER extends EdgeRegistry>(
    nodes: NodeStore<NR>,
    edges: EdgeStore<ER>,
  ) {
    return new FlowGraph<NR, ER>(nodes, edges);
  }

  static fromAdjacencyList<NR extends NodeRegistry, ER extends EdgeRegistry>(
    adjacencyList: AdjacencyEntry<NR, ER>[],
  ) {
    const nodes = {} as NodeStore<NR>;
    const edges = {} as EdgeStore<ER>;

    adjacencyList.forEach(([from, to, edge]) => {
      const f = from as NodeInput<NR>;
      const t = to as NodeInput<NR>;

      // register nodes
      if (!nodes[f.label]) nodes[f.label] = {} as any;
      if (!nodes[f.label][f.id]) (nodes[f.label] as any)[f.id] = f as any;
      if (!nodes[t.label]) nodes[t.label] = {} as any;
      if (!nodes[t.label][t.id]) (nodes[t.label] as any)[t.id] = t as any;

      // resolve edge type and data
      const type = (isGraphKey(edge) ? edge : (edge as any).type) as keyof ER;
      const data = isGraphKey(edge) ? undefined : (edge as any).data;

      const e = {
        from: { label: f.label, id: f.id },
        to: { label: t.label, id: t.id },
        type,
        data,
      } as EdgeOf<ER, typeof type>;

      // register edge
      if (!edges[f.label]) edges[f.label] = {} as any;
      if (!edges[f.label][f.id]) edges[f.label][f.id] = {} as any;
      if (!edges[f.label][f.id][type]) edges[f.label][f.id][type] = {} as any;
      if (!edges[f.label][f.id][type][t.label])
        edges[f.label][f.id][type][t.label] = {} as any;
      edges[f.label][f.id][type][t.label][t.id] = e;
    });

    return FlowGraph.of<NR, ER>(nodes, edges);
  }

  getNode({ label, id }: NodeRef) {
    return this._nodes[label][id];
  }

  getAllNodesByLabel(label) {
    return this._nodes[label];
  }

  setNode<L extends keyof NR>({ label, id, data }: NodeOf<NR, L>): this {
    (this._nodes[label] as any)[id] = { id, label, data };
    return this;
  }

  getNodeEdges({ id, label }: NodeRef) {
    return this._edges[label]?.[id];
  }

  getNodeEdgesByType({ label, id }, type) {
    return this._edges[label]?.[id]?.[type];
  }

  hasNode({ label, id }: NodeRef): boolean {
    return !!this._nodes[label]?.[id];
  }

  hasEdge(from, to, type): boolean {
    return !!this._edges[from.label]?.[from.id]?.[type]?.[to.label]?.[to.id];
  }

  setEdge(from, to, e): this {
    return this;
  }

  withNode(n: IdOrNode<NR>): FlowGraph<NR, ER> {
    return FlowGraph.of(this._nodes, this._edges);
  }

  withEdge(n: IdOrNode<NR>, e: IdOrEdge<ER>): FlowGraph<NR, ER> {
    return FlowGraph.of(this._nodes, this._edges);
  }

  deleteEdge(from, to, type): this {
    return this;
  }

  deleteNode(): this {
    return this;
  }

  clearEdge(n, e): this {
    return this;
  }

  mapBfs() {}
  mapDfs() {}

  queryP() {}

  inspect() {}
  tap() {}
  peek() {}
}
