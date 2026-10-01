'use client';

import React, { useState, useMemo } from 'react';
import { useZettelStore } from '@/lib/store';
import { useNotes, useUpdateNote, useDeleteNote } from '@/lib/hooks/useNotes';
import { Note } from '@/types/zettel';
import { discoverSynapticLinks } from '@/lib/synapse';
import { getClusterColor } from '@/lib/clusterColors';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  FileText, Link2, Tag, Folder, Plus, Trash2, 
  Eye, Edit3, Split, ArrowUpRight, Sparkles, Check, X
} from 'lucide-react';

export default function AtomicEditor() {
  const { 
    activeNoteId, 
    setActiveNoteId,
    synapticThreshold,
  } = useZettelStore();

  const { data: notes = [] } = useNotes();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const [editorMode, setEditorMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isAddingCustomCluster, setIsAddingCustomCluster] = useState(false);
  const [customClusterInput, setCustomClusterInput] = useState('');

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId) || (notes.length > 0 ? notes[0] : null),
    [notes, activeNoteId]
  );

  // Dynamic extraction of unique clusters from all notes
  const availableClusters = useMemo(() => {
    const set = new Set(notes.map((n) => n.cluster).filter(Boolean));
    if (activeNote?.cluster) {
      set.add(activeNote.cluster);
    }
    return Array.from(set);
  }, [notes, activeNote]);

  const synapticLinks = useMemo(
    () => discoverSynapticLinks(notes, synapticThreshold),
    [notes, synapticThreshold]
  );

  // Incoming explicit backlinks (Notes that link to this note)
  const incomingExplicitNotes = useMemo(() => {
    if (!activeNote) return [];
    return notes.filter((n) => n.id !== activeNote.id && (n.explicitLinks || []).includes(activeNote.id));
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
  }, [notes, synapticLinks, activeNote]);

  if (!activeNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] text-[var(--muted)] p-6">
        <FileText className="w-12 h-12 mb-3 opacity-30 animate-pulse text-cyan-500" />
        <p className="text-sm font-medium">Pilih catatan atau buat atomik baru di sidebar.</p>
      </div>
    );
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!activeNote.tags.includes(cleanTag)) {
      updateNoteMutation.mutate({
        id: activeNote.id,
        updates: { tags: [...activeNote.tags, cleanTag] },
      });
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNoteMutation.mutate({
      id: activeNote.id,
      updates: { tags: activeNote.tags.filter((t) => t !== tagToRemove) },
    });
  };

  const handleSaveCustomCluster = () => {
    if (!customClusterInput.trim()) {
      setIsAddingCustomCluster(false);
      return;
    }
    updateNoteMutation.mutate({
      id: activeNote.id,
      updates: { cluster: customClusterInput.trim() },
    });
    setCustomClusterInput('');
    setIsAddingCustomCluster(false);
  };

  // Convert [[ID]] or [[Title]] into clickable links in Markdown
  const renderInteractiveMarkdown = (content: string) => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, noteTarget) => {
      const targetNote = notes.find(
        (n) => n.id.toLowerCase() === noteTarget.toLowerCase() || n.title.toLowerCase() === noteTarget.toLowerCase()
      );
      if (targetNote) {
        return `[${targetNote.title}](#zettel-${targetNote.id})`;
      }
      return match;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--background)] overflow-hidden transition-colors duration-300">
      {/* Top Meta Bar */}
      <div className="p-4 border-b border-[var(--card-border)] bg-[var(--card)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/30">
              {activeNote.id}
            </span>
            <span className="text-xs text-[var(--muted)] flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block shadow-sm" 
                style={{ backgroundColor: getClusterColor(activeNote.cluster) }}
              />
              <span className="font-medium text-[var(--foreground)]">{activeNote.cluster}</span>
            </span>
          </div>

          {/* View Mode Switcher & Delete */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--input-bg)] rounded-lg p-0.5 border border-[var(--card-border)]">
              <button
                onClick={() => setEditorMode('edit')}
                className={`p-1.5 rounded-md text-xs transition ${
                  editorMode === 'edit'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title="Editor Mode"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditorMode('split')}
                className={`p-1.5 rounded-md text-xs transition ${
                  editorMode === 'split'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title="Split Mode"
              >
                <Split className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`p-1.5 rounded-md text-xs transition ${
                  editorMode === 'preview'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                title="Preview Mode"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('Hapus catatan atomik ini?')) {
                  deleteNoteMutation.mutate(activeNote.id);
                }
              }}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition"
              title="Hapus Catatan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNoteMutation.mutate({ id: activeNote.id, updates: { title: e.target.value } })}
          placeholder="Judul Catatan Atomik..."
          className="w-full bg-transparent text-lg font-bold text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-0"
        />

        {/* Dynamic Tags & Cluster Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
          {/* Cluster Selector / Creator */}
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <Folder className="w-3.5 h-3.5" />
            {isAddingCustomCluster ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customClusterInput}
                  onChange={(e) => setCustomClusterInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCustomCluster()}
                  placeholder="Nama kluster baru..."
                  autoFocus
                  className="w-36 bg-[var(--input-bg)] border border-cyan-500 rounded px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none"
                />
                <button
                  onClick={handleSaveCustomCluster}
                  className="p-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white"
                  title="Simpan Kluster"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsAddingCustomCluster(false)}
                  className="p-1 bg-transparent hover:bg-[var(--card-hover)] rounded text-[var(--muted)]"
                  title="Batal"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <select
                value={activeNote.cluster}
                onChange={(e) => {
                  if (e.target.value === '__NEW_CUSTOM__') {
                    setIsAddingCustomCluster(true);
                  } else {
                    updateNoteMutation.mutate({ id: activeNote.id, updates: { cluster: e.target.value } });
                  }
                }}
                className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded px-2 py-0.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-cyan-500 transition"
              >
                {availableClusters.map((clusterName) => (
                  <option key={clusterName} value={clusterName}>
                    📁 {clusterName}
                  </option>
                ))}
                <option value="__NEW_CUSTOM__">➕ + Tambah Kluster Baru...</option>
              </select>
            )}
          </div>

          {/* Tags List */}
          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            <Tag className="w-3.5 h-3.5 text-[var(--muted)]" />
            {activeNote.tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--muted)] text-[11px]"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-500 transition"
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
                  className="w-16 bg-[var(--input-bg)] border border-cyan-500 rounded px-1.5 py-0.5 text-[11px] text-[var(--foreground)] focus:outline-none"
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
                className="p-0.5 text-[var(--muted)] hover:text-cyan-500 transition"
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
          <div className={`h-full flex flex-col ${editorMode === 'split' ? 'w-1/2 border-r border-[var(--card-border)]' : 'w-full'}`}>
            <textarea
              value={activeNote.content}
              onChange={(e) => updateNoteMutation.mutate({ id: activeNote.id, updates: { content: e.target.value } })}
              placeholder="Tulis ide atomik di sini... Ketik [[ID-Catatan]] untuk menautkan gagasan."
              className="flex-1 w-full p-6 bg-transparent text-[var(--foreground)] font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-[var(--muted)]"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className={`h-full overflow-y-auto p-6 max-w-none ${editorMode === 'split' ? 'w-1/2 bg-[var(--card)]' : 'w-full'}`}>
            <div className="prose dark:prose-invert max-w-none">
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
                          className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 transition align-baseline my-0.5 font-semibold"
                        >
                          {children}
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-500 underline">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {renderInteractiveMarkdown(activeNote.content)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Backlinks & Synaptic Explorer Panel */}
      <div className="border-t border-[var(--card-border)] bg-[var(--card)] max-h-48 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          {/* Explicit Backlinks */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-2">
              <Link2 className="w-3.5 h-3.5" />
              <span>Hard Backlinks ({incomingExplicitNotes.length})</span>
            </div>
            {incomingExplicitNotes.length === 0 ? (
              <p className="text-[11px] text-[var(--muted)] italic">Belum ada catatan yang menautkan secara manual</p>
            ) : (
              <div className="flex flex-col gap-1">
                {incomingExplicitNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className="flex items-center justify-between text-left p-1.5 rounded-md bg-[var(--input-bg)] hover:bg-[var(--card-hover)] text-xs text-[var(--foreground)] transition border border-[var(--card-border)]"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 ml-2">{note.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Synaptic Discoveries */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sinapsis AI ({relevantSynapses.length})</span>
            </div>
            {relevantSynapses.length === 0 ? (
              <p className="text-[11px] text-[var(--muted)] italic">Tidak ada kemiripan semantik di atas threshold</p>
            ) : (
              <div className="flex flex-col gap-1">
                {relevantSynapses.slice(0, 3).map(({ note, similarity }) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className="flex items-center justify-between text-left p-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-[var(--foreground)] transition"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400 font-semibold ml-2">
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
