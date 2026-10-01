import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarNotesAction } from '@/actions/vectorSearch';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, limit = 5, excludeId } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required' }, { status: 400 });
    }

    const results = await searchSimilarNotesAction(query, limit, excludeId);
    return NextResponse.json({
      success: true,
      query,
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error('Vector search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
