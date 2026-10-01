/**
 * Utility for parsing and extracting [[WikiLinks]] in atomic markdown notes.
 * Supports: [[NoteID]] and [[NoteID|Custom Label]]
 */

export interface WikiLinkMatch {
  raw: string;
  targetId: string;
  label: string;
}

export function parseWikiLinks(content: string): WikiLinkMatch[] {
  const regex = /\[\[(.*?)\]\]/g;
  const matches: WikiLinkMatch[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const raw = match[0];
    const inner = match[1].trim();
    if (!inner) continue;

    if (inner.includes('|')) {
      const [targetId, label] = inner.split('|').map((s) => s.trim());
      matches.push({ raw, targetId, label: label || targetId });
    } else {
      matches.push({ raw, targetId: inner, label: inner });
    }
  }

  return matches;
}

export function extractExplicitLinkIds(content: string): string[] {
  const matches = parseWikiLinks(content);
  return Array.from(new Set(matches.map((m) => m.targetId)));
}
