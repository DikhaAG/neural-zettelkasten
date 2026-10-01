# Neural Zettelkasten — Product Requirement Document (PRD)

## 1. Vision & Overview
Neural Zettelkasten adalah aplikasi manajemen pengetahuan (PKM) generasi berikutnya yang menggabungkan metode Zettelkasten klasik (Niklas Luhmann) dengan topologi jaringan saraf (neural networks) dan kecerdasan buatan (AI).

Sistem ini tidak hanya menyimpan catatan atomik, tetapi memvisualisasikan seluruh gudang ide sebagai sebuah "otak hidup" (Living Brain Graph), di mana:
- **Hard Links (Tautan Manual)**: Hubungan struktural `[[ID-Catatan]]` yang dibuat pengguna.
- **Synaptic Links (Tautan Semantik)**: Hubungan implisit yang ditemukan AI berdasarkan kedekatan makna (Cosine Similarity Vector Embeddings).
- **Neural Pulse**: Jalur pemikiran yang menyala secara visual ketika pengguna mencari ide atau meminta sintesis artikel baru dari AI.

---

## 2. Core Functional Modules

### A. Atomic Note Engine (Editor)
- Markdown WYSIWYG / Split Editor dengan KaTeX math & syntax highlighting.
- Auto-complete `[[` untuk menautkan catatan secara instan.
- Panel Backlinks (Explicit Links & Unlinked Mentions).
- Luhmann-style tree branching & Unique Zettel IDs.

### B. Neural Graph Explorer (Visualizer)
- 2D & 3D Force-Directed Graph (Three.js / Canvas).
- Visual Nodes: Ukuran node berdasarkan jumlah sinapsis/koneksi (pagerank/degree).
- Synaptic Edges: Garis solid untuk hard-links, garis berpendar / berkedip untuk AI soft-links.
- Interactive Physics: Zoom, pan, node pinning, focus isolate, dan cluster filtering.

### C. AI Synaptic Copilot
- **Synaptic Suggestion**: Menampilkan ide-ide yang relevan dari masa lalu saat sedang mengetik catatan baru.
- **Idea Synthesis Engine**: Memilih beberapa node di graf untuk di-sintesis menjadi esai / kesimpulan baru.
- **Emergent Cluster Naming**: AI memberi nama otomatis untuk kluster ide yang terbentuk.
- **Neural RAG Search**: Tanya jawab berbasis percakapan dengan seluruh isi Zettelkasten.

---

## 3. UI/UX Aesthetic Guidelines
- **Theme**: Bioluminescent Cybernetic Dark Mode (Slate 950 base, Neon Cyan/Violet/Emerald accents).
- **Feel**: Snappy, fluid, glassmorphism, responsive micro-animations.
- **Typography**: Inter / Outfit untuk UI, JetBrains Mono untuk code/math.
