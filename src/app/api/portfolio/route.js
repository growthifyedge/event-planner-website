import { NextResponse } from 'next/server';
import { getPortfolioMedia } from '@/lib/media-store';

// Public, read-only, paginated portfolio feed (published media only).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Math.min(48, parseInt(searchParams.get('pageSize') || '12', 10) || 12);

  try {
    const result = await getPortfolioMedia({ category, page, pageSize, sort: 'newest' });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/portfolio]', err);
    // Graceful: return an empty page rather than a 500 (the page keeps its fallback).
    return NextResponse.json(
      { items: [], total: 0, page, pageSize, hasMore: false },
      { status: 200 }
    );
  }
}
