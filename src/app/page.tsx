import { getNotesAction } from '@/actions/notes';
import QueryProvider from '@/components/providers/QueryProvider';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Neural Zettelkasten — Living Brain Knowledge Graph',
  description: 'AI-Powered Second Brain and Atomic Knowledge Graph with PostgreSQL & Synaptic Embeddings',
};

// ⚡ Server Component: Fetches directly from PostgreSQL before sending HTML to browser
export default async function Home() {
  const initialNotes = await getNotesAction();

  return (
    <QueryProvider>
      <AppShell initialNotes={initialNotes} />
    </QueryProvider>
  );
}
