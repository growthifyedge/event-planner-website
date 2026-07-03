'use client';

import { useState, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';
import PortfolioGallery from './PortfolioGallery';
import { categories } from '@/data/portfolio';
import { cn } from '@/lib/utils';

// Map a raw media record to the gallery's item shape (uploaded media = contain).
const toItem = (m) => ({
  id: m._id,
  title: m.title,
  category: m.category,
  type: m.type,
  src: m.url,
  fit: 'contain',
});

/**
 * Database-driven portfolio browser: category filtering and pagination happen
 * in MongoDB (not the client). Page 1 is server-rendered (SEO + no layout shift);
 * category changes and "Load more" fetch additional pages from /api/portfolio.
 */
export default function PortfolioBrowser({
  initialItems = [],
  initialHasMore = false,
  pageSize = 12,
}) {
  const [category, setCategory] = useState('All');
  const [items, setItems] = useState(() => initialItems.map(toItem));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (cat, pg, replace) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `/api/portfolio?category=${encodeURIComponent(cat)}&page=${pg}&pageSize=${pageSize}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const mapped = (data.items || []).map(toItem);
        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setHasMore(Boolean(data.hasMore));
        setPage(pg);
      } catch {
        setError('Could not load more items. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const changeCategory = (c) => {
    if (c === category || loading) return;
    setCategory(c);
    setItems([]);
    fetchPage(c, 1, true);
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => changeCategory(c)}
            className={cn(
              'rounded-full border px-5 py-2 text-[11px] uppercase tracking-widest transition-all duration-300',
              category === c
                ? 'border-gold-500 bg-gold-gradient text-ink-900'
                : 'border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-700'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {items.length === 0 && loading ? (
        <div className="flex items-center justify-center py-20 text-ink-300">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="mx-auto max-w-md rounded-2xl border border-dashed border-ink-200 bg-white/40 py-16 text-center text-sm text-ink-400">
          No items in this category yet.
        </p>
      ) : (
        <PortfolioGallery items={items} showFilters={false} />
      )}

      {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}

      {hasMore && items.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => fetchPage(category, page + 1, false)}
            disabled={loading}
            className="btn-outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </>
            ) : (
              <>
                Load more <Plus className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
