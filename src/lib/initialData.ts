import { Note } from '@/types/zettel';

export const INITIAL_NOTES: Note[] = [
  {
    "id": "20261001-001",
    "title": "Prinsip Atomisitas Zettelkasten",
    "content": "Setiap catatan Zettelkasten hanya boleh memuat **satu gagasan tunggal** (atomic thought). Dengan menjaga catatan tetap atomik, ide-ide dapat digabungkan kembali secara modular seperti blok lego konseptual.\n\nPrinsip ini mencegah kognitif overload dan memungkinkan pembentukan jaringan pemikiran non-linear [[20261001-002]].",
    "tags": ["pkm", "zettelkasten", "atomicity"],
    "cluster": "PKM Methodology",
    "explicitLinks": ["20261001-002"],
    "createdAt": "2026-10-01T08:00:00.000Z",
    "updatedAt": "2026-10-01T08:00:00.000Z"
  },
  {
    "id": "20261001-002",
    "title": "Emergent Properties dalam Jaringan Ide",
    "content": "Ketika catatan-catatan atomik saling bertaut tanpa hierarki ketat (*heterarchy*), wawasan baru yang tak terduga akan muncul (*emergent properties*).\n\nHal ini analog dengan bagaimana kesadaran (*consciousness*) muncul dari interaksi miliaran neuron sederhana [[20261001-003]] dan [[20261001-007]].",
    "tags": ["emergence", "complexity", "neural-networks"],
    "cluster": "Systems & Complexity",
    "explicitLinks": ["20261001-003", "20261001-007"],
    "createdAt": "2026-10-01T08:15:00.000Z",
    "updatedAt": "2026-10-01T08:15:00.000Z"
  },
  {
    "id": "20261001-003",
    "title": "Hebbian Learning: Neurons That Fire Together Wire Together",
    "content": "Hukum Donald Hebb (1949) menyatakan bahwa aktivasi simultan antar sel saraf memperkuat efisiensi transmisi sinaptik di antara keduanya.\n\nDalam sistem Zettelkasten cerdas, ketika dua ide sering dirujuk bersama dalam sebuah penalaran AI, terbentuklah **sinapsis buatan** [[20261001-004]].",
    "tags": ["neuroscience", "learning", "synapse"],
    "cluster": "Neuroscience & AI",
    "explicitLinks": ["20261001-004"],
    "createdAt": "2026-10-01T08:30:00.000Z",
    "updatedAt": "2026-10-01T08:30:00.000Z"
  },
  {
    "id": "20261001-004",
    "title": "Vector Embeddings sebagai Ruang Konseptual Laten",
    "content": "Model AI merepresentasikan teks ke dalam ruang vektor berdimensi tinggi ($V \\in \\mathbb{R}^d$).\n\nJarak kosinus (*cosine distance*):\n$$\\text{sim}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}$$\n\nKedekatan sudut merefleksikan kedekatan semantik, memungkinkan kita mendeteksi keterkaitan implisit antar catatan tanpa tautan manual [[20261001-005]].",
    "tags": ["ai", "embeddings", "vector-search", "math"],
    "cluster": "Neuroscience & AI",
    "explicitLinks": ["20261001-005"],
    "createdAt": "2026-10-01T08:45:00.000Z",
    "updatedAt": "2026-10-01T08:45:00.000Z"
  },
  {
    "id": "20261001-005",
    "title": "Serendipity Engine: Menghubungkan Ide Asosiatif",
    "content": "Kekuatan terbesar *Second Brain* bukan sekadar menyimpan ingatan, melainkan menciptakan kejutan kognitif (*serendipity*).\n\nAI berfungsi sebagai stimulator asosiasi bebas yang mempertemukan domain berbeda secara probabilistik [[20261001-001]] dan [[20261001-006]].",
    "tags": ["creativity", "cognition", "serendipity"],
    "cluster": "Cognition & Creativity",
    "explicitLinks": ["20261001-001", "20261001-006"],
    "createdAt": "2026-10-01T09:00:00.000Z",
    "updatedAt": "2026-10-01T09:00:00.000Z"
  },
  {
    "id": "20261001-006",
    "title": "Struktur Luhmann: Percabangan Ide tak Terbatas",
    "content": "Niklas Luhmann menggunakan penomoran alfanumerik (misal: `1.1a`, `1.1b`) untuk menyisipkan pemikiran baru di tengah rantai argumen tanpa merusak urutan.\n\nSifat fraktal ini membuat *slip-box* terus berkembang secara biologis.",
    "tags": ["luhmann", "indexing", "fractal-knowledge"],
    "cluster": "PKM Methodology",
    "explicitLinks": ["20261001-001"],
    "createdAt": "2026-10-01T09:15:00.000Z",
    "updatedAt": "2026-10-01T09:15:00.000Z"
  },
  {
    "id": "20261001-007",
    "title": "Heterarki vs Hierarki dalam Pemrosesan Pengetahuan",
    "content": "Berbeda dari pohon folder tradisional (hierarki kaku), heterarki memungkinkan setiap node menjadi pusat orientasi tergantung pada konteks pertanyaan yang diajukan [[20261001-002]].",
    "tags": ["heterarchy", "knowledge-graph", "systems"],
    "cluster": "Systems & Complexity",
    "explicitLinks": ["20261001-002"],
    "createdAt": "2026-10-01T09:30:00.000Z",
    "updatedAt": "2026-10-01T09:30:00.000Z"
  }
];

export const CLUSTER_COLORS: Record<string, string> = {
  "PKM Methodology": "#06b6d4",      // Cyan
  "Systems & Complexity": "#10b981", // Emerald
  "Neuroscience & AI": "#8b5cf6",    // Violet
  "Cognition & Creativity": "#f59e0b" // Amber
};
