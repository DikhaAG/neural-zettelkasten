---
name: neural-zettelkasten-architect
description: Guides the design, parsing, and data modeling of Atomic Notes, [[wikilinks]], bidirectional graph structures, and Luhmann-style indexing for the Neural Zettelkasten project.
---

# Neural Zettelkasten Architect Skill

This skill defines the data architecture, parsing engine, and core knowledge principles for the Neural Zettelkasten application.

## 1. Zettelkasten Core Principles
1. **Atomicity**: One single concept per note (`id`, `title`, `content`, `tags`, `cluster`).
2. **Explicit Links (Hard Synapses)**: Direct connections using `[[NoteID]]` or `[[NoteID|Custom Label]]`.
3. **Implicit Links (Soft Synapses)**: Discovered by vector similarity between note embeddings.
4. **Backlinks & References**: When Note A links to Note B, Note B must dynamically compute and display Note A in its `incomingLinks`.

## 2. Wikilink Regex and Parser Rules
Use the standard regex to extract target IDs:
```typescript
export function extractWikiLinks(content: string): string[] {
  const matches = content.matchAll(/\[\[(.*?)\]\]/g);
  const links: string[] = [];
  for (const match of matches) {
    const raw = match[1];
    const targetId = raw.split('|')[0].trim();
    if (targetId) links.push(targetId);
  }
  return Array.from(new Set(links));
}
```

## 3. Luhmann Indexing & Unique ID Formats
- Format 1 (Timestamp): `YYYYMMDD-HHMM` (e.g., `20261001-1200`)
- Format 2 (Branching): `1.1a`, `1.1b`, `1.2` for branching thoughts.
