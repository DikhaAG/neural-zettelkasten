import { NextResponse } from 'next/server';
import { getNotesAction, createNoteAction } from '@/actions/notes';

export async function GET() {
  const notes = await getNotesAction();
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createNoteAction(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
