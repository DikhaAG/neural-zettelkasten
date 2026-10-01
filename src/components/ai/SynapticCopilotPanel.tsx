'use client';

import React, { useState } from 'react';
import { useZettelStore } from '@/lib/store';
import { Sparkles, Brain, Wand2, MessageSquare, Send, RefreshCw, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';

export default function SynapticCopilotPanel() {
  const {
    notes,
    selectedNodeIds,
    clearNodeSelection,
    isAiSynthesizing,
    setIsAiSynthesizing,
    synthesisResult,
    setSynthesisResult,
    createNote,
  } = useZettelStore();

  const [activeTab, setActiveTab] = useState<'synthesis' | 'chat'>('synthesis');
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Salam! Saya adalah Neural Copilot. Tanyakan apa saja tentang jaringan konsep di Zettelkasten Anda, atau pilih beberapa catatan untuk saya sintesiskan menjadi gagasan baru.',
    },
  ]);
  const [copied, setCopied] = useState(false);

  const selectedNotes = notes.filter((n) => selectedNodeIds.includes(n.id));

  // Run Multi-Node Synthesis
  const handleSynthesize = async () => {
    if (selectedNotes.length < 2) return;
    setIsAiSynthesizing(true);
    setSynthesisResult(null);

    setTimeout(() => {
      const titles = selectedNotes.map((n) => `**${n.title}** (\`[[${n.id}]]\`)`).join(' dan ');
      const synthesizedText = `### 🌟 Sintesis Konsep Muncul (*Emergent Synthesis*)\n\nPenggabungan antara ${titles} menghasilkan premis baru:\n\n1. **Dialektika Utama**: Terdapat konvergensi struktural di mana sifat atomik ide memungkinkan terbentuknya ruang laten semantik yang beroperasi menyerupai hukum plastisitas sinaptik Hebbian.\n2. **Hipotesis Baru**: *Dapatkah kita memperlakukan penomoran Luhmann sebagai koordinat topologis dalam ruang embedding multi-dimensi untuk navigasi intuisi AI?*\n\n> *Ide yang saling terhubung melahirkan lompatan kognitif di luar jumlah bagian-bagiannya.*`;

      setSynthesisResult(synthesizedText);
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
    createNote({
      title: `Sintesis: ${selectedNotes.map((n) => n.title).slice(0, 2).join(' + ')}`,
      content: `${synthesisResult}\n\n**Sumber:**\n${selectedNotes.map((n) => `- [[${n.id}]]`).join('\n')}`,
      tags: ['synthesis', 'ai-generated', 'emergent'],
      cluster: 'Cognition & Creativity',
    });
    setSynthesisResult(null);
    clearNodeSelection();
  };

  const handleSendChat = () => {
    if (!chatQuery.trim()) return;
    const userMsg = chatQuery;
    setChatQuery('');

    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);

    setTimeout(() => {
      const matchedNotes = notes.filter((n) =>
        n.title.toLowerCase().includes(userMsg.toLowerCase()) ||
        n.content.toLowerCase().includes(userMsg.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(userMsg.toLowerCase()))
      );

      let reply = '';
      if (matchedNotes.length > 0) {
        reply = `Berdasarkan catatan Anda di Zettelkasten, konsep ini terkait erat dengan **${matchedNotes[0].title}** ([[${matchedNotes[0].id}]]). \n\n*Ringkasan:* ${matchedNotes[0].content.slice(0, 180)}...`;
      } else {
        reply = `Berdasarkan seluruh jaringan saraf Zettelkasten (${notes.length} catatan), konsep '${userMsg}' dapat dihubungkan secara metaforis dengan prinsip keterikatan ide dan *emergent complexity*. Cobalah membuat catatan atomik baru untuk konsep ini!`;
      }

      setChatHistory([...newHistory, { role: 'assistant', text: reply }]);
    }, 800);
  };

  return (
    <div className="w-96 h-full flex flex-col bg-[var(--sidebar-bg)] border-l border-[var(--card-border)] text-[var(--foreground)] select-text transition-colors duration-300">
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--card-border)] bg-[var(--topbar-bg)]">
        <div className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-lg border border-[var(--card-border)]">
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
            <span>Neural RAG</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-purple-500 font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>AI Copilot</span>
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
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
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
                placeholder="Tanya seluruh Zettelkasten..."
                className="flex-1 bg-transparent px-2 text-xs text-[var(--foreground)] focus:outline-none placeholder-[var(--muted)]"
              />
              <button
                onClick={handleSendChat}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition"
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
