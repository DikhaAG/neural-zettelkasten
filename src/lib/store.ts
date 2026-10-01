import { create } from 'zustand';
import { Note, GraphData, GraphNode, GraphEdge, ViewMode, SynapticLink } from '@/types/zettel';
import { INITIAL_NOTES, CLUSTER_COLORS } from './initialData';
import { extractExplicitLinkIds } from './wikilinks';
import { discoverSynapticLinks } from './synapse';

interface ZettelState {
  notes: Note[];
  activeNoteId: string | null;
  selectedNodeIds: string[]; // For multi-node AI synthesis
  viewMode: ViewMode;
  searchQuery: string;
  selectedCluster: string | null;
  synapticThreshold: number;
  synapticLinks: SynapticLink[];
  isAiSynthesizing: boolean;
  synthesisResult: string | null;
  
  // Actions
  setActiveNoteId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCluster: (cluster: string | null) => void;
  setSynapticThreshold: (threshold: number) => void;
  toggleNodeSelection: (id: string) => void;
  clearNodeSelection: () => void;
  
  createNote: (partial?: Partial<Note>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  getGraphData: () => GraphData;
  setSynthesisResult: (result: string | null) => void;
  setIsAiSynthesizing: (loading: boolean) => void;
}

export const useZettelStore = create<ZettelState>((set, get) => ({
  notes: INITIAL_NOTES,
  activeNoteId: INITIAL_NOTES[0].id,
  selectedNodeIds: [],
  viewMode: 'split',
  searchQuery: '',
  selectedCluster: null,
  synapticThreshold: 0.18,
  synapticLinks: discoverSynapticLinks(INITIAL_NOTES, 0.18),
  isAiSynthesizing: false,
  synthesisResult: null,

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
  
  setSynapticThreshold: (threshold) => {
    const { notes } = get();
    const synapticLinks = discoverSynapticLinks(notes, threshold);
    set({ synapticThreshold: threshold, synapticLinks });
  },

  toggleNodeSelection: (id) => {
    const current = get().selectedNodeIds;
    if (current.includes(id)) {
      set({ selectedNodeIds: current.filter((item) => item !== id) });
    } else {
      set({ selectedNodeIds: [...current, id] });
    }
  },

  clearNodeSelection: () => set({ selectedNodeIds: [] }),

  createNote: (partial = {}) => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const id = partial.id || `${timestamp.slice(0, 8)}-${timestamp.slice(8)}`;
    
    const newNote: Note = {
      id,
      title: partial.title || 'Untitled Thought',
      content: partial.content || 'Start drafting your atomic thought here. Use [[NoteID]] to link.',
      tags: partial.tags || ['inbox'],
      cluster: partial.cluster || 'PKM Methodology',
      explicitLinks: partial.content ? extractExplicitLinkIds(partial.content) : [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...partial,
    };

    set((state) => {
      const updatedNotes = [newNote, ...state.notes];
      const synapticLinks = discoverSynapticLinks(updatedNotes, state.synapticThreshold);
      return {
        notes: updatedNotes,
        activeNoteId: newNote.id,
        synapticLinks,
      };
    });

    return newNote;
  },

  updateNote: (id, updates) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) => {
        if (note.id !== id) return note;
        const newContent = updates.content !== undefined ? updates.content : note.content;
        const explicitLinks = extractExplicitLinkIds(newContent);
        return {
          ...note,
          ...updates,
          explicitLinks,
          updatedAt: new Date().toISOString(),
        };
      });

      const synapticLinks = discoverSynapticLinks(updatedNotes, state.synapticThreshold);
      return { notes: updatedNotes, synapticLinks };
    });
  },

  deleteNote: (id) => {
    set((state) => {
      const updatedNotes = state.notes.filter((note) => note.id !== id);
      const synapticLinks = discoverSynapticLinks(updatedNotes, state.synapticThreshold);
      const nextActiveId =
        state.activeNoteId === id
          ? updatedNotes.length > 0
            ? updatedNotes[0].id
            : null
          : state.activeNoteId;
      return {
        notes: updatedNotes,
        activeNoteId: nextActiveId,
        synapticLinks,
        selectedNodeIds: state.selectedNodeIds.filter((item) => item !== id),
      };
    });
  },

  getGraphData: () => {
    const { notes, synapticLinks, searchQuery, selectedCluster } = get();

    // Filter notes by search and cluster
    const filteredNotes = notes.filter((n) => {
      const matchesSearch =
        searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCluster =
        selectedCluster === null || n.cluster === selectedCluster;

      return matchesSearch && matchesCluster;
    });

    const filteredNoteIds = new Set(filteredNotes.map((n) => n.id));

    // Calculate degree (connection count) for node sizing
    const degreeMap: Record<string, number> = {};
    for (const note of filteredNotes) {
      degreeMap[note.id] = note.explicitLinks.length;
    }

    const links: GraphEdge[] = [];

    // 1. Explicit Links (Solid Cyan)
    for (const note of filteredNotes) {
      for (const targetId of note.explicitLinks) {
        if (filteredNoteIds.has(targetId)) {
          degreeMap[targetId] = (degreeMap[targetId] || 0) + 1;
          links.push({
            source: note.id,
            target: targetId,
            type: 'explicit',
            color: '#38bdf8',
            dashed: false,
          });
        }
      }
    }

    // 2. Synaptic Soft Links (Pulsing Violet)
    for (const syn of synapticLinks) {
      if (filteredNoteIds.has(syn.sourceId) && filteredNoteIds.has(syn.targetId)) {
        links.push({
          source: syn.sourceId,
          target: syn.targetId,
          type: 'synaptic',
          similarity: syn.similarity,
          color: '#a855f7',
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
      color: CLUSTER_COLORS[note.cluster] || '#94a3b8',
    }));

    return { nodes, links };
  },

  setSynthesisResult: (result) => set({ synthesisResult: result }),
  setIsAiSynthesizing: (loading) => set({ isAiSynthesizing: loading }),
}));
