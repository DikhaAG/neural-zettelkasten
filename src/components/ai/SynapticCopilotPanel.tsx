'use client';

import React, { useState } from 'react';
import { useZettelStore } from '@/lib/store';
import { useNotes, useCreateNote } from '@/lib/hooks/useNotes';
import { searchSimilarNotesAction } from '@/actions/vectorSearch';
import { 
  Sparkles, Brain, Wand2, RefreshCw, Check, Copy, 
  MessageSquare, Send, Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

export default function SynapticCopilotPanel() {
  const { 
    selectedNodeIds, 
    clearNodeSelection,
    setActiveNoteId,
  } = useZettelStore();

  const { data: notes = [] } = useNotes();
  const createNoteMutation = useCreateNote();

  const [activeTab, setActiveTab] = useState<'synthesis' | 'chat'>('synthesis');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Neural RAG Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [isSearchingVector, setIsSearchingVector] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya AI Synaptic Copilot yang terhubung dengan **PostgreSQL pgvector (768-dim HNSW)**. Anda bisa bertanya tentang seluruh isi ide catatan Anda atau memilih beberapa catatan di graf untuk disintesis menjadi wawasan baru.',
    },
  ]);

  const selectedNotes = notes.filter((n) => selectedNodeIds.includes(n.id));

  const handleSynthesize = () => {
    if (selectedNotes.length < 2) return;
    setIsAiSynthesizing(true);
    setSynthesisResult(null);

    setTimeout(() => {
      const titles = selectedNotes.map((n) => `[[${n.id}]] "${n.title}"`).join(' dan ');
      const keyPoints = selectedNotes
        .map((n) => `- **${n.title}**: ${n.content.slice(0, 120)}...`)
        .join('\n');

      const result = `### 💡 Sintesis Gagasan Emergen\n\n**Persimpangan Konsep antara:** ${titles}\n\n${keyPoints}\n\n---\n\n#### ⚡ Hipotesis Orisinal:\nKetika prinsip-prinsip di atas dipadukan dalam satu sistem heterarkis, muncul dinamika baru di mana proses belajar dan penataan pengetahuan tidak lagi bersifat linier. Struktur saraf yang saling beresonansi memungkinkan transfer gagasan lintas domain secara spontan.\n\n*Rekomendasi Eksplorasi Lanjutan:* Hubungkan sintesis ini dengan kluster pengetahuan aktif Anda.`;

      setSynthesisResult(result);
      setIsAiSynthesizing(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }, 1200);
  };

  const handleSaveSynthesisAsNote = () => {
    if (!synthesisResult) return;
    createNoteMutation.mutate({
      title: `Sintesis: ${selectedNotes.map((n) => n.title).slice(0, 2).join(' + ')}`,
      content: `${synthesisResult}\n\n**Sumber:**\n${selectedNotes.map((n) => `- [[${n.id}]]`).join('\n')}`,
      tags: ['synthesis', 'ai-generated', 'pgvector'],
      cluster: 'Cognition & Creativity',
    });
    setSynthesisResult(null);
    clearNodeSelection();
  };

  const handleSendChat = async () => {
    if (!chatQuery.trim() || isSearchingVector) return;
    const userMsg = chatQuery.trim();
    setChatQuery('');
    setIsSearchingVector(true);

    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);

    try {
      // High-performance pgvector Cosine similarity query using HNSW index
      const matched = await searchSimilarNotesAction(userMsg, 3);

      let reply = '';
      if (matched.length > 0 && matched[0].similarity > 0.05) {
        const topMatch = matched[0];
        reply = `Berdasarkan pencarian vektor **pgvector (HNSW Index)** di database PostgreSQL Anda:\n\nPertanyaan Anda sangat beresonansi dengan catatan **[${topMatch.title}](#zettel-${topMatch.id})** (\`[[${topMatch.id}]]\`, Skor Kemiripan Vektor: **${Math.round(topMatch.similarity * 100)}%**).\n\n> *"${topMatch.content.slice(0, 220).replace(/\n/g, ' ')}..."*\n\n${
          matched.length > 1
            ? `\n**Catatan Terkait Lainnya:**\n` +
              matched
                .slice(1)
                .map((m) => `- **[${m.title}](#zettel-${m.id})** (\`[[${m.id}]]\`, ${Math.round(m.similarity * 100)}% Match)`)
                .join('\n')
            : ''
        }`;
      } else {
        reply = `Berdasarkan pemindaian indeks vektor **pgvector** di database PostgreSQL (${notes.length} catatan), query *"${userMsg}"* belum memiliki catatan spesifik yang identik. \n\nCobalah membuat catatan atomik baru untuk konsep ini agar dapat otomatis terindeks ke dalam ruang vektor 768-dimensi!`;
      }

      setChatHistory([...newHistory, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Neural RAG error:', err);
      setChatHistory([
        ...newHistory,
        {
          role: 'assistant',
          text: 'Terjadi kesalahan saat memindai indeks pgvector. Pastikan database PostgreSQL tetap terhubung.',
        },
      ]);
    } finally {
      setIsSearchingVector(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--card)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header Tabs */}
      <div className="p-3 border-b border-[var(--card-border)] flex items-center justify-between">
        <div className="flex bg-[var(--input-bg)] p-0.5 rounded-lg border border-[var(--card-border)]">
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'synthesis' ? 'bg-purple-600 text-white shadow' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Sintesis</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'chat' ? 'bg-cyan-600 text-white shadow' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Neural RAG (pgvector)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-500" />
          <span className="font-semibold">pgvector 768d</span>
        </div>
      </div>

      {/* Tab 1: Synthesis Engine */}
      {activeTab === 'synthesis' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-[var(--foreground)]">
              <h4 className="font-semibold flex items-center gap-1.5 text-purple-600 dark:text-purple-300 mb-1">
                <Brain className="w-4 h-4" /> Multi-Node Idea Synthesis
              </h4>
              <p className="text-[var(--muted)] text-[11px] leading-relaxed">
                Pilih 2 atau lebih node pada graf (<span className="text-cyan-500 font-mono">Shift + Klik</span>) untuk menggabungkan perspektifnya menjadi wawasan baru.
              </p>
            </div>

            {/* Selected Nodes List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Catatan Terpilih ({selectedNodeIds.length})</span>
                {selectedNodeIds.length > 0 && (
                  <button
                    onClick={clearNodeSelection}
                    className="text-[var(--muted)] hover:text-red-500 text-[11px] transition"
                  >
                    Reset Pilihan
                  </button>
                )}
              </div>

              {selectedNotes.length === 0 ? (
                <div className="p-6 border border-dashed border-[var(--card-border)] rounded-xl text-center text-[var(--muted)] text-xs">
                  <p>Belum ada node yang dipilih.</p>
                  <p className="text-[10px] mt-1 text-[var(--muted)] opacity-75">Klik node di graf sambil menahan Shift</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                  {selectedNotes.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                    >
                      <span className="truncate">{n.title}</span>
                      <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 ml-2">{n.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleSynthesize}
              disabled={selectedNotes.length < 2 || isAiSynthesizing}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                selectedNotes.length >= 2 && !isAiSynthesizing
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 active:scale-95'
                  : 'bg-[var(--input-bg)] text-[var(--muted)] cursor-not-allowed border border-[var(--card-border)]'
              }`}
            >
              {isAiSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mensintesis Ide...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Sintesiskan {selectedNotes.length} Catatan Ini</span>
                </>
              )}
            </button>

            {/* Synthesis Result */}
            {synthesisResult && (
              <div className="p-4 rounded-xl bg-[var(--card)] border border-purple-500/40 text-xs space-y-3 shadow-md">
                <div className="prose dark:prose-invert text-xs">
                  <ReactMarkdown>{synthesisResult}</ReactMarkdown>
                </div>
                <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(synthesisResult);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={handleSaveSynthesisAsNote}
                    className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-medium transition"
                  >
                    Simpan Sebagai Catatan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Neural RAG Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                      : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] rounded-bl-none shadow-sm'
                  }`}
                >
                  <ReactMarkdown
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
                              className="text-cyan-500 underline font-semibold hover:text-cyan-400"
                            >
                              {children}
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
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card)]">
            <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-1.5 focus-within:border-cyan-500">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Tanya seluruh Zettelkasten via pgvector HNSW..."
                disabled={isSearchingVector}
                className="flex-1 bg-transparent px-2 text-xs text-[var(--foreground)] focus:outline-none placeholder-[var(--muted)] disabled:opacity-50"
              />
              <button
                onClick={handleSendChat}
                disabled={isSearchingVector || !chatQuery.trim()}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg text-white transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
