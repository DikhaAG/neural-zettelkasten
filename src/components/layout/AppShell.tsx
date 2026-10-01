'use client';

import React, { useState } from 'react';
import { useZettelStore } from '@/lib/store';
import NotesSidebar from '../sidebar/NotesSidebar';
import NeuralGraph from '../graph/NeuralGraph';
import AtomicEditor from '../editor/AtomicEditor';
import SynapticCopilotPanel from '../ai/SynapticCopilotPanel';
import { Network, Columns2, Edit, Sparkles, Plus } from 'lucide-react';

export default function AppShell() {
  const { viewMode, setViewMode, createNote, notes, synapticLinks } = useZettelStore();
  const [showAiPanel, setShowAiPanel] = useState(true);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden select-none">
      {/* Universal Top Bar */}
      <header className="h-12 border-b border-slate-800/80 bg-[#050a14]/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
        {/* Left Status Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-mono text-slate-300">{notes.length} Nodes</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-purple-400">{synapticLinks.length} Sinapsis</span>
          </div>
        </div>

        {/* Center View Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/90 text-xs">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium ${
              viewMode === 'split' ? 'bg-cyan-600/90 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('graph-only')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium ${
              viewMode === 'graph-only' ? 'bg-cyan-600/90 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Neural Graph</span>
          </button>
          <button
            onClick={() => setViewMode('editor-only')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium ${
              viewMode === 'editor-only' ? 'bg-cyan-600/90 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Editor Focus</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition ${
              showAiPanel
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle AI Copilot Panel"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Panel</span>
          </button>

          <button
            onClick={() => createNote()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catatan Baru</span>
          </button>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <NotesSidebar />

        {/* Central Work Area according to View Mode */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'split' && (
            <>
              <div className="w-1/2 h-full border-r border-slate-800/80">
                <NeuralGraph />
              </div>
              <div className="w-1/2 h-full">
                <AtomicEditor />
              </div>
            </>
          )}

          {viewMode === 'graph-only' && (
            <div className="w-full h-full">
              <NeuralGraph />
            </div>
          )}

          {viewMode === 'editor-only' && (
            <div className="w-full h-full">
              <AtomicEditor />
            </div>
          )}
        </div>

        {/* Right AI Copilot Drawer */}
        {showAiPanel && <SynapticCopilotPanel />}
      </main>
    </div>
  );
}
