export interface Note {
  id: string;              // e.g. "20261001-001" or Luhmann "1.1a"
  title: string;
  content: string;         // Markdown content with [[ID]] links
  tags: string[];
  cluster: string;         // e.g. "PKM Methodology", "Neuroscience & AI"
  explicitLinks: string[]; // Target note IDs mentioned in [[...]]
  createdAt: string;
  updatedAt: string;
}

export interface SynapticLink {
  sourceId: string;
  targetId: string;
  similarity: number;      // 0.0 to 1.0 (Cosine Similarity)
  reason?: string;         // Why AI believes they are conceptually related
}

export interface GraphNode {
  id: string;
  title: string;
  cluster: string;
  tags: string[];
  val: number;             // Node size based on connection count
  color: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'explicit' | 'synaptic';
  similarity?: number;
  color?: string;
  dashed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

export type ViewMode = 'split' | 'graph-only' | 'editor-only' | 'neural-chat';
export type ThemeMode = 'dark' | 'light';
