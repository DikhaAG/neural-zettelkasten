import { Note, GraphData, GraphNode, GraphEdge, SynapticLink } from '@/types/zettel';
import { getClusterColor } from './clusterColors';

export function computeGraphData(
  notes: Note[],
  synapticLinks: SynapticLink[],
  searchQuery: string,
  selectedCluster: string | null,
  isDark: boolean
): GraphData {
  // Filter notes by search query and cluster
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCluster =
      selectedCluster === null || n.cluster === selectedCluster;

    return matchesSearch && matchesCluster;
  });

  const filteredNoteIds = new Set(filteredNotes.map((n) => n.id));

  // Calculate degree (connection count) for node sizing
  const degreeMap: Record<string, number> = {};
  for (const note of filteredNotes) {
    degreeMap[note.id] = (note.explicitLinks || []).length;
  }

  const links: GraphEdge[] = [];

  // 1. Explicit Hard Links (Cyan)
  for (const note of filteredNotes) {
    for (const targetId of note.explicitLinks || []) {
      if (filteredNoteIds.has(targetId)) {
        degreeMap[targetId] = (degreeMap[targetId] || 0) + 1;
        links.push({
          source: note.id,
          target: targetId,
          type: 'explicit',
          color: isDark ? '#38bdf8' : '#0284c7',
          dashed: false,
        });
      }
    }
  }

  // 2. Synaptic Soft Links (Violet)
  for (const syn of synapticLinks) {
    if (filteredNoteIds.has(syn.sourceId) && filteredNoteIds.has(syn.targetId)) {
      links.push({
        source: syn.sourceId,
        target: syn.targetId,
        type: 'synaptic',
        similarity: syn.similarity,
        color: isDark ? '#a855f7' : '#9333ea',
        dashed: true,
      });
    }
  }

  const nodes: GraphNode[] = filteredNotes.map((note) => ({
    id: note.id,
    title: note.title,
    cluster: note.cluster,
    tags: note.tags,
    val: Math.max(4, Math.min(14, 4 + (degreeMap[note.id] || 0) * 1.5)),
    color: getClusterColor(note.cluster),
  }));

  return { nodes, links };
}
