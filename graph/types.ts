export type GraphKey = string | number;

// ── Registries ───────────────────────────────────────────────────────────────

export type NodeRegistry = Record<GraphKey, unknown>;
export type EdgeRegistry = Record<GraphKey, unknown>;

// ── Node ref ──────────────────────────────────────────────────────────────────

export type NodeRef = { label: GraphKey; id: GraphKey };

// ── Core shapes ───────────────────────────────────────────────────────────────

export type GraphNode<NR extends NodeRegistry> = {
  [L in keyof NR]: { id: GraphKey; label: L; data: NR[L] };
}[keyof NR];

export type GraphEdge<ER extends EdgeRegistry> = {
  [T in keyof ER]: { from: NodeRef; to: NodeRef; type: T; data: ER[T] };
}[keyof ER];

// ── Narrowing helpers ─────────────────────────────────────────────────────────

export type NodeOf<NR extends NodeRegistry, L extends keyof NR> = Extract<
  GraphNode<NR>,
  { label: L }
>;

export type EdgeOf<ER extends EdgeRegistry, T extends keyof ER> = Extract<
  GraphEdge<ER>,
  { type: T }
>;

// ── Storage shapes ────────────────────────────────────────────────────────────

export type NodeStore<NR extends NodeRegistry> = {
  [L in keyof NR]: Record<GraphKey, NodeOf<NR, L>>;
};

export type EdgeStore<ER extends EdgeRegistry> = {
  [FL in GraphKey]: {
    [FI in GraphKey]: {
      [T in keyof ER]: {
        [TL in GraphKey]: {
          [TI in GraphKey]: EdgeOf<ER, T>;
        };
      };
    };
  };
};

// ── Input types ───────────────────────────────────────────────────────────────

export type NodeInput<NR extends NodeRegistry> = {
  [L in keyof NR]: { id: GraphKey; label: L; data?: NR[L] };
}[keyof NR];

export type EdgeInput<ER extends EdgeRegistry> =
  | keyof ER
  | { [T in keyof ER]: { type: T; data?: ER[T] } }[keyof ER];

export type AdjacencyEntry<NR extends NodeRegistry, ER extends EdgeRegistry> =
  | [NodeInput<NR>, NodeInput<NR>]
  | [NodeInput<NR>, NodeInput<NR>, EdgeInput<ER>];

export type EdgeRef<ER extends EdgeRegistry> = {
  from: NodeRef;
  to: NodeRef;
  type?: keyof ER;
};
