'use client';

import React from 'react';
import { useZettelStore } from '@/lib/store';
import { Plus, Search, Brain, Hash, Network, Layers, Sparkles } from 'lucide-react';
import { CLUSTER_COLORS } from '@/lib/initialData';

export default function NotesSidebar() {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    searchQuery,
    setSearchQuery,
    selectedCluster,
    setSelectedCluster,
  } = useZettelStore();

  const clusters = ['PKM Methodology', 'Systems & Complexity', 'Neuroscience & AI', 'Cognition & Creativity'];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      searchQuery === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCluster = selectedCluster === null || n.cluster === selectedCluster;

    return matchesSearch && matchesCluster;
  });

  return (
    <aside className="w-80 h-full flex flex-col bg-[#050a14] border-r border-slate-800/80 text-slate-300">
      {/* Brand & Action Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">Neural Zettel</h1>
            <p className="text-[10px] text-cyan-400 font-mono">Living Brain v2.0</p>
          </div>
        </div>

        <button
          onClick={() => createNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/20 transition active:scale-95"
          title="Buat Catatan Baru"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ide, sinapsis, tag..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Cluster Filter Pills */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          <button
            onClick={() => setSelectedCluster(null)}
            className={`px-2 py-0.5 rounded-full text-[10px] transition ${
              selectedCluster === null
                ? 'bg-slate-700 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900'
            }`}
          >
            Semua ({notes.length})
          </button>
          {clusters.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCluster(selectedCluster === c ? null : c)}
              className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 transition ${
                selectedCluster === c
                  ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: CLUSTER_COLORS[c] || '#94a3b8' }}
              />
              {c.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <p>Tidak ada catatan ditemukan</p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isActive = note.id === activeNoteId;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`w-full text-left p-3 rounded-xl transition group relative border ${
                  isActive
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/40 text-white'
                    : 'bg-slate-950/40 border-transparent hover:bg-slate-900/50 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-cyan-400">{note.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                      <Network className="w-3 h-3 text-slate-500" />
                      {note.explicitLinks.length}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CLUSTER_COLORS[note.cluster] || '#94a3b8' }}
                    />
                  </div>
                </div>

                <h3 className="text-xs font-semibold line-clamp-1 group-hover:text-cyan-300 transition">
                  {note.title || 'Untitled Thought'}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {note.content.replace(/\[\[(.*?)\]\]/g, '$1')}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 text-cyan-400">
          <Sparkles className="w-3 h-3" /> Heterarchy Synapse
        </span>
        <span className="font-mono">{notes.length} Atom Nodes</span>
      </div>
    </aside>
  );
}
