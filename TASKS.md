# Implementation Checklist & Tasks

- [x] **Phase 1: Project Initialization & Theme Setup**
  - [x] Initialize Next.js App Router workspace
  - [x] Install dependencies: `lucide-react`, `react-markdown`, `canvas-confetti`, `three`, `react-force-graph-2d`, `zustand`, `motion`
  - [x] Configure Dark Bioluminescent CSS variables & theme tokens
  - [x] Setup unified App Layout (Sidebar, Canvas Viewport, Topbar, AI Panel)

- [x] **Phase 2: Atomic Note & Link Engine**
  - [x] Implement Markdown Editor with live markdown rendering & KaTeX math
  - [x] Implement `[[wikilink]]` extraction & interactive jumping
  - [x] Build bi-directional backlinks detector (Explicit vs Synaptic)
  - [x] Implement Seed Data loader (rich interconnected notes on AI, cognition, systems)

- [x] **Phase 3: 2D/3D Neural Force Graph Visualizer**
  - [x] Render interactive Force-Directed Graph canvas
  - [x] Differentiate Hard Links (solid neon cyan) and Soft Synaptic Links (dashed/pulsing violet)
  - [x] Implement hover tooltip, node click preview, and focus spotlight
  - [x] Add physics controls and synaptic threshold slider

- [x] **Phase 4: AI Synaptic Engine & Synthesis**
  - [x] In-memory Cosine Similarity calculator for real-time synapse discovery
  - [x] Multi-node Synthesis generator (combine selected notes into a synthesis essay)
  - [x] Neural RAG Chat Copilot over the Zettelkasten knowledge base

- [ ] **Phase 5: Polish & Vibe Enhancements**
  - [ ] Command Palette (`Cmd + K`) for instant navigation
  - [ ] Sound/Micro-animation feedback on node connection
  - [ ] Export / Import graph data (JSON / Markdown folder)
