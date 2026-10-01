'use server';

import { prisma } from '@/lib/db';
import { Note } from '@/types/zettel';
import { INITIAL_NOTES } from '@/lib/initialData';
import { extractExplicitLinkIds } from '@/lib/wikilinks';

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
 * Auto-seeds with INITIAL_NOTES on first launch if DB is empty.
 */
export async function getNotesAction(): Promise<Note[]> {
  try {
    const count = await prisma.note.count();

    if (count === 0) {
      // Seed initial notes
      for (const note of INITIAL_NOTES) {
        await prisma.note.create({
          data: {
            id: note.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            cluster: note.cluster,
            explicitLinks: note.explicitLinks,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
          },
        });
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
 * Creates a new note in PostgreSQL database.
 */
export async function createNoteAction(noteData: Partial<Note>): Promise<Note> {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const id = noteData.id || `${timestamp.slice(0, 8)}-${timestamp.slice(8)}`;
  const content = noteData.content || 'Start drafting your atomic thought here. Use [[NoteID]] to link.';
  const explicitLinks = extractExplicitLinkIds(content);

  const created = await prisma.note.create({
    data: {
      id,
      title: noteData.title || 'Untitled Thought',
      content,
      tags: noteData.tags || ['inbox'],
      cluster: noteData.cluster || 'PKM Methodology',
      explicitLinks,
      createdAt: now,
      updatedAt: now,
    },
  });

  return formatDbNote(created);
}

/**
 * Updates an existing note in PostgreSQL database.
 */
export async function updateNoteAction(
  id: string,
  updates: Partial<Note>
): Promise<Note | null> {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) return null;

  const content = updates.content !== undefined ? updates.content : existing.content;
  const explicitLinks = extractExplicitLinkIds(content);

  const updated = await prisma.note.update({
    where: { id },
    data: {
      title: updates.title !== undefined ? updates.title : existing.title,
      content,
      tags: updates.tags || existing.tags,
      cluster: updates.cluster !== undefined ? updates.cluster : existing.cluster,
      explicitLinks,
      updatedAt: new Date(),
    },
  });

  return formatDbNote(updated);
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
