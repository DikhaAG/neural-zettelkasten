'use server';

import { prisma } from '@/lib/db';
import { Note } from '@/types/zettel';
import { INITIAL_NOTES } from '@/lib/initialData';
import { extractExplicitLinkIds } from '@/lib/wikilinks';
import { generateDenseEmbedding, formatPgVector } from '@/lib/embeddings';

// Convert DB Note model to Application Note interface
function formatDbNote(dbNote: any): Note {
  return {
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    tags: Array.isArray(dbNote.tags) ? dbNote.tags : [],
    cluster: dbNote.cluster,
    explicitLinks: Array.isArray(dbNote.explicitLinks) ? dbNote.explicitLinks : [],
    createdAt: dbNote.createdAt.toISOString(),
    updatedAt: dbNote.updatedAt.toISOString(),
  };
}

/**
 * Retrieves all notes from PostgreSQL Database.
 * Auto-seeds with INITIAL_NOTES and persists 768-dim embeddings.
 */
export async function getNotesAction(): Promise<Note[]> {
  try {
    const count = await prisma.note.count();

    if (count === 0) {
      // Seed initial notes with 768-dim embeddings
      for (const note of INITIAL_NOTES) {
        const fullText = `${note.title} ${note.tags.join(' ')} ${note.content}`;
        const embedding = generateDenseEmbedding(fullText);
        const vectorStr = formatPgVector(embedding);

        await prisma.$executeRawUnsafe(
          `
          INSERT INTO "Note" ("id", "title", "content", "tags", "cluster", "explicitLinks", "embedding", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8, $9);
          `,
          note.id,
          note.title,
          note.content,
          note.tags,
          note.cluster,
          note.explicitLinks,
          vectorStr,
          new Date(note.createdAt),
          new Date(note.updatedAt)
        );
      }
    } else {
      // Backfill any existing notes that do not have pgvector embeddings yet
      const unindexed = await prisma.$queryRaw<any[]>`
        SELECT id, title, content, tags FROM "Note" WHERE embedding IS NULL LIMIT 50;
      `;
      for (const n of unindexed) {
        const fullText = `${n.title} ${(n.tags || []).join(' ')} ${n.content}`;
        const embedding = generateDenseEmbedding(fullText);
        const vectorStr = formatPgVector(embedding);
        await prisma.$executeRawUnsafe(
          `UPDATE "Note" SET embedding = $1::vector WHERE id = $2;`,
          vectorStr,
          n.id
        );
      }
    }

    const dbNotes = await prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return dbNotes.map(formatDbNote);
  } catch (error) {
    console.error('Failed to get notes from database:', error);
    return INITIAL_NOTES;
  }
}

/**
 * Creates a new note in PostgreSQL database and computes its pgvector 768-dim embedding.
 */
export async function createNoteAction(noteData: Partial<Note>): Promise<Note> {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const id = noteData.id || `${timestamp.slice(0, 8)}-${timestamp.slice(8)}`;
  const title = noteData.title || 'Untitled Thought';
  const content = noteData.content || 'Start drafting your atomic thought here. Use [[NoteID]] to link.';
  const tags = noteData.tags || ['inbox'];
  const cluster = noteData.cluster || 'PKM Methodology';
  const explicitLinks = extractExplicitLinkIds(content);

  const fullText = `${title} ${tags.join(' ')} ${content}`;
  const embedding = generateDenseEmbedding(fullText);
  const vectorStr = formatPgVector(embedding);

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO "Note" ("id", "title", "content", "tags", "cluster", "explicitLinks", "embedding", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7::vector, $8, $9);
    `,
    id,
    title,
    content,
    tags,
    cluster,
    explicitLinks,
    vectorStr,
    now,
    now
  );

  const created = await prisma.note.findUniqueOrThrow({ where: { id } });
  return formatDbNote(created);
}

/**
 * Updates an existing note in PostgreSQL database and synchronizes its pgvector embedding.
 */
export async function updateNoteAction(
  id: string,
  updates: Partial<Note>
): Promise<Note | null> {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) return null;

  const title = updates.title !== undefined ? updates.title : existing.title;
  const content = updates.content !== undefined ? updates.content : existing.content;
  const tags = updates.tags || existing.tags;
  const cluster = updates.cluster !== undefined ? updates.cluster : existing.cluster;
  const explicitLinks = extractExplicitLinkIds(content);
  const now = new Date();

  const fullText = `${title} ${tags.join(' ')} ${content}`;
  const embedding = generateDenseEmbedding(fullText);
  const vectorStr = formatPgVector(embedding);

  await prisma.$executeRawUnsafe(
    `
    UPDATE "Note"
    SET "title" = $1, "content" = $2, "tags" = $3, "cluster" = $4, "explicitLinks" = $5, "embedding" = $6::vector, "updatedAt" = $7
    WHERE "id" = $8;
    `,
    title,
    content,
    tags,
    cluster,
    explicitLinks,
    vectorStr,
    now,
    id
  );

  const updated = await prisma.note.findUnique({ where: { id } });
  return updated ? formatDbNote(updated) : null;
}

/**
 * Deletes a note from PostgreSQL database.
 */
export async function deleteNoteAction(id: string): Promise<boolean> {
  try {
    await prisma.note.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error(`Failed to delete note ${id}:`, error);
    return false;
  }
}
