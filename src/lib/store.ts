import { create } from 'zustand';
import { ViewMode, ThemeMode } from '@/types/zettel';

interface ZettelUIState {
  activeNoteId: string | null;
  selectedNodeIds: string[]; // For multi-node AI synthesis
  viewMode: ViewMode;
  theme: ThemeMode;
  searchQuery: string;
  selectedCluster: string | null;
  synapticThreshold: number;
  isAiSynthesizing: boolean;
  synthesisResult: string | null;
  
  // Actions
  setActiveNoteId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCluster: (cluster: string | null) => void;
  setSynapticThreshold: (threshold: number) => void;
  toggleNodeSelection: (id: string) => void;
  clearNodeSelection: () => void;
  setSynthesisResult: (result: string | null) => void;
  setIsAiSynthesizing: (loading: boolean) => void;
}

export const useZettelStore = create<ZettelUIState>((set, get) => ({
  activeNoteId: '20261001-001',
  selectedNodeIds: [],
  viewMode: 'split',
  theme: 'dark',
  searchQuery: '',
  selectedCluster: null,
  synapticThreshold: 0.18,
  isAiSynthesizing: false,
  synthesisResult: null,

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },

  toggleTheme: (event) => {
    const currentTheme = get().theme;
    const nextTheme: ThemeMode = currentTheme === 'dark' ? 'light' : 'dark';

    // 2026 Circular View Transition animation
    if (
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      event
    ) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = (document as any).startViewTransition(() => {
        get().setTheme(nextTheme);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 450,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      get().setTheme(nextTheme);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCluster: (cluster) => set({ selectedCluster: cluster }),
  setSynapticThreshold: (threshold) => set({ synapticThreshold: threshold }),

  toggleNodeSelection: (id) => {
    const current = get().selectedNodeIds;
    if (current.includes(id)) {
      set({ selectedNodeIds: current.filter((item) => item !== id) });
    } else {
      set({ selectedNodeIds: [...current, id] });
    }
  },

  clearNodeSelection: () => set({ selectedNodeIds: [] }),
  setSynthesisResult: (result) => set({ synthesisResult: result }),
  setIsAiSynthesizing: (loading) => set({ isAiSynthesizing: loading }),
}));
