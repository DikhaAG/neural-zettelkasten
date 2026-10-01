'use server';

import { prisma } from '@/lib/db';
import { generateDenseEmbedding, formatPgVector } from '@/lib/embeddings';

export interface VectorSearchResult {
  id: string;
  title: string;
  cluster: string;
  tags: string[];
  content: string;
  similarity: number;
}

/**
 * Searches for semantically nearest atomic notes using pgvector cosine distance `<=>` and HNSW index.
 * Scales efficiently to millions of vector records.
 */
export async function searchSimilarNotesAction(
  queryText: string,
  limit = 5,
  excludeId?: string
): Promise<VectorSearchResult[]> {
  try {
    const embedding = generateDenseEmbedding(queryText);
    const vectorStr = formatPgVector(embedding);

    const results = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        id, 
        title, 
        cluster, 
        tags, 
        content,
        1 - (embedding <=> $1::vector) AS similarity
      FROM "Note"
      WHERE embedding IS NOT NULL 
        ${excludeId ? `AND id != '${excludeId.replace(/'/g, "''")}'` : ''}
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $2;
      `,
      vectorStr,
      limit
    );

    return results.map((r) => ({
      id: r.id,
      title: r.title,
      cluster: r.cluster,
      tags: Array.isArray(r.tags) ? r.tags : [],
      content: r.content,
      similarity: parseFloat(Number(r.similarity).toFixed(4)),
    }));
  } catch (error) {
    console.error('pgvector semantic search failed:', error);
    return [];
  }
}

/**
 * Backfills neural 768-dim embeddings for all existing notes that do not have embeddings yet.
 */
export async function backfillEmbeddingsAction(): Promise<number> {
  try {
    const notesWithoutEmbedding = await prisma.$queryRaw<any[]>`
      SELECT id, title, content, tags FROM "Note" WHERE embedding IS NULL;
    `;

    for (const note of notesWithoutEmbedding) {
      const fullText = `${note.title} ${(note.tags || []).join(' ')} ${note.content}`;
      const embedding = generateDenseEmbedding(fullText);
      const vectorStr = formatPgVector(embedding);

      await prisma.$executeRawUnsafe(
        `UPDATE "Note" SET embedding = $1::vector WHERE id = $2;`,
        vectorStr,
        note.id
      );
    }

    return notesWithoutEmbedding.length;
  } catch (error) {
    console.error('Failed to backfill embeddings:', error);
    return 0;
  }
}
