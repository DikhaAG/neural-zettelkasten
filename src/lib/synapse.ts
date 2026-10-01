import { Note, SynapticLink } from '@/types/zettel';

/**
 * Calculates term frequency vector and cosine similarity between atomic notes.
 * Generates soft/synaptic latent connections based on semantic overlap.
 */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function calculateTF(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  const total = tokens.length || 1;
  for (const key in tf) {
    tf[key] = tf[key] / total;
  }
  return tf;
}

export function computeCosineSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const tfA = calculateTF(tokensA);
  const tfB = calculateTF(tokensB);

  const allWords = Array.from(new Set([...Object.keys(tfA), ...Object.keys(tfB)]));

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const word of allWords) {
    const vA = tfA[word] || 0;
    const vB = tfB[word] || 0;
    dotProduct += vA * vB;
    normA += vA * vA;
    normB += vB * vB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Discovers soft synaptic links across the whole Zettelkasten knowledge base.
 */
export function discoverSynapticLinks(
  notes: Note[],
  threshold = 0.18
): SynapticLink[] {
  const links: SynapticLink[] = [];

  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const noteA = notes[i];
      const noteB = notes[j];

      // Skip if already explicitly linked
      if (
        noteA.explicitLinks.includes(noteB.id) ||
        noteB.explicitLinks.includes(noteA.id)
      ) {
        continue;
      }

      // Compute similarity across title + content + tags
      const textA = `${noteA.title} ${noteA.tags.join(' ')} ${noteA.content}`;
      const textB = `${noteB.title} ${noteB.tags.join(' ')} ${noteB.content}`;

      const similarity = computeCosineSimilarity(textA, textB);

      if (similarity >= threshold) {
        links.push({
          sourceId: noteA.id,
          targetId: noteB.id,
          similarity: parseFloat(similarity.toFixed(3)),
          reason: `Semantic overlap on keywords: ${getSharedKeywords(noteA, noteB).join(', ')}`,
        });
      }
    }
  }

  return links;
}

function getSharedKeywords(a: Note, b: Note): string[] {
  const tokensA = new Set(tokenize(`${a.title} ${a.tags.join(' ')}`));
  const tokensB = new Set(tokenize(`${b.title} ${b.tags.join(' ')}`));
  return Array.from(tokensA).filter((t) => tokensB.has(t)).slice(0, 3);
}
