'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types/zettel';
import { getNotesAction, createNoteAction, updateNoteAction, deleteNoteAction } from '@/actions/notes';

export const NOTES_QUERY_KEY = ['notes'];

/**
 * Hook to retrieve all atomic notes with Server Component initial data and background revalidation.
 */
export function useNotes(initialData?: Note[]) {
  return useQuery<Note[]>({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => {
      const notes = await getNotesAction();
      return notes;
    },
    initialData,
    staleTime: 1000 * 60 * 2, // 2 minutes stale time
  });
}

/**
 * Hook to create a new note with optimistic cache update.
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partial: Partial<Note>) => {
      return await createNoteAction(partial);
    },
    onMutate: async (newNotePartial) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY) || [];

      const optimisticNote: Note = {
        id: newNotePartial.id || `${Date.now()}`,
        title: newNotePartial.title || 'Untitled Thought',
        content: newNotePartial.content || 'Start drafting your atomic thought here. Use [[NoteID]] to link.',
        tags: newNotePartial.tags || ['inbox'],
        cluster: newNotePartial.cluster || 'PKM Methodology',
        explicitLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) => [optimisticNote, ...old]);

      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

/**
 * Hook to update a note with optimistic cache update.
 */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      return await updateNoteAction(id, updates);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY) || [];

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) =>
        old.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note))
      );

      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a note with optimistic cache update.
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteNoteAction(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previousNotes = queryClient.getQueryData<Note[]>(NOTES_QUERY_KEY) || [];

      queryClient.setQueryData<Note[]>(NOTES_QUERY_KEY, (old = []) => old.filter((n) => n.id !== id));

      return { previousNotes };
    },
    onError: (err, id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_QUERY_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
