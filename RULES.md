# Vibe Coding & Architectural Guidelines

## 1. Core Principles for AI-Assisted Vibe Coding
- **Keep it Working & Hot-Reloading**: Setiap perubahan harus langsung dapat diuji di browser tanpa build error.
- **Rich Aesthetics by Default**: Gunakan tema dark bioluminescent dengan glassmorphism, border glow halus, dan palet warna HSL modern. Jangan pernah membuat UI mentah tanpa styling.
- **Type-Safety & Robust Models**: Selalu gunakan TypeScript strict interfaces untuk Node, Link, Note, dan AI Stream responses.
- **No Mock Placeholders in UI**: Gunakan data seed yang realistis dan kontekstual mengenai AI, kognisi, dan filsafat.

## 2. Tech Stack Conventions
- **Framework**: Next.js 16 (App Router), React 19 / Server & Client Components.
- **Graphing Engine**: `three.js` / `@react-three/fiber` / `3d-force-graph` atau `react-force-graph-2d/3d` untuk visualisasi sinapsis.
- **Iconography**: `lucide-react`.
- **Styling**: Tailwind CSS v4 / Vanilla CSS variables dengan backdrop-blur dan border semitransparan.
- **Markdown & Math**: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`.

## 3. Data Model Conventions
- Catatan atomik memiliki:
  - `id`: string (UUID atau Zettel timestamp `YYYYMMDDHHMMSS`)
  - `title`: string
  - `content`: markdown text
  - `tags`: string[]
  - `explicitLinks`: string[] (ID catatan target dari `[[ID]]`)
  - `synapticScore`: record kemiripan vektor AI dengan catatan lain
  - `cluster`: string (kategori / topik temuan AI)
