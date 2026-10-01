'use client';

import React, { useState, useMemo } from 'react';
import { useZettelStore } from '@/lib/store';
import { Note } from '@/types/zettel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  FileText, Link2, Tag, Folder, Plus, Trash2, 
  Eye, Edit3, Split, ArrowUpRight, Sparkles, Check
} from 'lucide-react';
import { CLUSTER_COLORS } from '@/lib/initialData';

export default function AtomicEditor() {
  const { 
    notes, 
    activeNoteId, 
    updateNote, 
    deleteNote, 
    setActiveNoteId,
    synapticLinks 
  } = useZettelStore();

  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || null,
    [notes, activeNoteId]
  );

  // Incoming explicit backlinks (Notes that link to this note)
  const incomingExplicitNotes = useMemo(() => {
    if (!activeNote) return [];
    return notes.filter((n) => n.id !== activeNote.id && n.explicitLinks.includes(activeNote.id));
  }, [notes, activeNote]);

  // Incoming synaptic soft links
  const relevantSynapses = useMemo(() => {
    if (!activeNote) return [];
    const results: Array<{ note: Note; similarity: number; reason?: string }> = [];
    for (const s of synapticLinks) {
      if (s.sourceId === activeNote.id || s.targetId === activeNote.id) {
        const otherId = s.sourceId === activeNote.id ? s.targetId : s.sourceId;
        const otherNote = notes.find((n) => n.id === otherId);
        if (otherNote) {
          results.push({
            note: otherNote,
            similarity: s.similarity,
            reason: s.reason,
          });
        }
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity);
  }, [activeNote, synapticLinks, notes]);

  if (!activeNote) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-slate-500 glass-panel p-6">
        <FileText className="w-12 h-12 mb-3 text-slate-600 animate-pulse-subtle" />
        <p className="text-sm font-medium">Pilih catatan atomik untuk mulai membaca atau mengedit</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (newTagInput.trim() && !activeNote.tags.includes(newTagInput.trim())) {
      updateNote(activeNote.id, {
        tags: [...activeNote.tags, newTagInput.trim().toLowerCase()],
      });
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNote(activeNote.id, {
      tags: activeNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  // Convert [[wikilinks]] in markdown to clickable interactive elements
  const renderInteractiveMarkdown = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, (match, inner) => {
      const parts = inner.split('|');
      const targetId = parts[0].trim();
      const label = parts[1]?.trim() || targetId;
      return `[🔗 ${label}](#zettel-${targetId})`;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#070d19]/80 backdrop-blur-xl border-l border-slate-800/80 overflow-hidden text-slate-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-semibold">
            {activeNote.id}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <span 
              className="w-2 h-2 rounded-full inline-block" 
              style={{ backgroundColor: CLUSTER_COLORS[activeNote.cluster] || '#94a3b8' }}
            />
            {activeNote.cluster}
          </span>
        </div>

        {/* View Mode Switcher & Delete */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 text-slate-400">
            <button
              onClick={() => setEditorMode('edit')}
              className={`p-1.5 rounded-md transition ${
                editorMode === 'edit' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-slate-200'
              }`}
              title="Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditorMode('split')}
              className={`p-1.5 rounded-md transition ${
                editorMode === 'split' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-slate-200'
              }`}
              title="Split Mode"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              className={`p-1.5 rounded-md transition ${
                editorMode === 'preview' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-slate-200'
              }`}
              title="Preview Mode"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => deleteNote(activeNote.id)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            title="Hapus Catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Title & Metadata Controls */}
      <div className="px-6 pt-4 pb-3 border-b border-slate-800/40 bg-slate-900/20">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
          placeholder="Judul Catatan Atomik..."
          className="w-full bg-transparent text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-0"
        />

        {/* Tags & Cluster Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Folder className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={activeNote.cluster}
              onChange={(e) => updateNote(activeNote.id, { cluster: e.target.value })}
              className="bg-slate-900/80 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="PKM Methodology">PKM Methodology</option>
              <option value="Systems & Complexity">Systems & Complexity</option>
              <option value="Neuroscience & AI">Neuroscience & AI</option>
              <option value="Cognition & Creativity">Cognition & Creativity</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {activeNote.tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px]"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition"
                >
                  ×
                </button>
              </span>
            ))}

            {showTagInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="tag..."
                  autoFocus
                  className="w-16 bg-slate-900 border border-cyan-500/50 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none"
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="p-0.5 text-slate-500 hover:text-cyan-400 transition"
                title="Tambah Tag"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Split / Edit / Preview) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Textarea */}
        {(editorMode === 'edit' || editorMode === 'split') && (
          <div className={`h-full flex flex-col ${editorMode === 'split' ? 'w-1/2 border-r border-slate-800/60' : 'w-full'}`}>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Tulis ide atomik di sini... Ketik [[ID-Catatan]] untuk menautkan gagasan."
              className="flex-1 w-full p-6 bg-transparent text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-slate-600"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className={`h-full overflow-y-auto p-6 prose prose-invert max-w-none ${editorMode === 'split' ? 'w-1/2 bg-slate-950/20' : 'w-full'}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                a: ({ href, children }) => {
                  if (href?.startsWith('#zettel-')) {
                    const targetId = href.replace('#zettel-', '');
                    return (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveNoteId(targetId);
                        }}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 transition align-baseline my-0.5"
                      >
                        {children}
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    );
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {renderInteractiveMarkdown(activeNote.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Backlinks & Synaptic Explorer Panel */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 max-h-48 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          {/* Explicit Backlinks */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
              <Link2 className="w-3.5 h-3.5" />
              <span>Hard Backlinks ({incomingExplicitNotes.length})</span>
            </div>
            {incomingExplicitNotes.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Belum ada catatan yang menautkan secara manual</p>
            ) : (
              <div className="flex flex-col gap-1">
                {incomingExplicitNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className="flex items-center justify-between text-left p-1.5 rounded-md bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 hover:text-cyan-300 transition"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400 ml-2">{note.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Synaptic Discoveries */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sinapsis AI Tersembunyi ({relevantSynapses.length})</span>
            </div>
            {relevantSynapses.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">Tidak ada kemiripan semantik laten di atas threshold</p>
            ) : (
              <div className="flex flex-col gap-1">
                {relevantSynapses.slice(0, 3).map(({ note, similarity }) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className="flex items-center justify-between text-left p-1.5 rounded-md bg-purple-950/20 hover:bg-purple-900/40 border border-purple-800/30 text-xs text-purple-200 transition"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="font-mono text-[10px] text-purple-400 font-semibold ml-2">
                      {Math.round(similarity * 100)}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
