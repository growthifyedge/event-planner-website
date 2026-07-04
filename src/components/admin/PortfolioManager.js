'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import {
  LogOut,
  Trash2,
  Pencil,
  Check,
  X,
  UploadCloud,
  Film,
  Image as ImageIcon,
  Loader2,
  Inbox,
  Search,
  Plus,
  Star,
} from 'lucide-react';
import { site } from '@/data/site';
import { cn } from '@/lib/utils';
import { optimizedImage, videoPoster } from '@/lib/cloudinary-url';
import { HOMEPAGE_PLACEMENTS, placementLabel } from '@/data/placements';

const CATEGORIES = ['Weddings', 'Corporate', 'Birthdays', 'Private Parties'];
const TYPE_FILTERS = [
  { key: 'All', label: 'All' },
  { key: 'image', label: 'Images' },
  { key: 'video', label: 'Videos' },
];
const PAGE_SIZE = 24;
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function PortfolioManager() {
  const router = useRouter();

  // Upload form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);

  // List + query
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters / search / sort
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [sort, setSort] = useState('newest');

  // Row/bulk state
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);
  const [editPlacement, setEditPlacement] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null); // { ids, bulk }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (pg = 1, replace = true) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          category: catFilter,
          type: typeFilter,
          sort,
          page: String(pg),
          pageSize: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/admin/media?${params}`, { cache: 'no-store' });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (!res.ok) throw new Error('load failed');
        const json = await res.json();
        setItems((prev) => (replace ? json.media || [] : [...prev, ...(json.media || [])]));
        setTotal(json.total ?? 0);
        setHasMore(Boolean(json.hasMore));
        setPage(pg);
      } catch {
        setError('Failed to load media. Please refresh.');
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, catFilter, typeFilter, sort, router]
  );

  // Reload page 1 whenever a filter/search/sort changes.
  useEffect(() => {
    setSelected(new Set());
    load(1, true);
  }, [load]);

  async function handleUploaded(info) {
    if (!info?.secure_url) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || info.original_filename || 'Untitled',
          category,
          type: info.resource_type === 'video' ? 'video' : 'image',
          url: info.secure_url,
          publicId: info.public_id,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Failed to save media.');
        return;
      }
      setTitle('');
      await load(1, true);
    } catch {
      setError('Failed to save media.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item) {
    setEditingId(item._id);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditPlacement(item.homepagePlacement || '');
  }
  async function saveEdit(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          homepagePlacement: editPlacement,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await load(1, true);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function runDelete() {
    if (!confirm) return;
    const { ids, bulk } = confirm;
    setBusyId(bulk ? '__bulk__' : ids[0]);
    try {
      if (bulk) {
        await fetch('/api/admin/media/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', ids }),
        });
      } else {
        await fetch(`/api/admin/media/${ids[0]}`, { method: 'DELETE' });
      }
      setConfirm(null);
      setSelected(new Set());
      await load(1, true);
    } finally {
      setBusyId(null);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  const chip = (activeCond) =>
    cn(
      'rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-widest transition',
      activeCond
        ? 'border-gold-500 bg-gold-gradient text-ink-900'
        : 'border-ink-200 bg-white text-ink-500 hover:border-gold-400 hover:text-gold-700'
    );

  return (
    <div>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-50/10 bg-ink-950 text-cream-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <span className="font-display text-xl uppercase tracking-[0.22em]">{site.name}</span>
          <nav className="flex items-center gap-1 text-[11px] uppercase tracking-widest">
            <Link href="/admin" className="rounded-full px-3 py-2 text-cream-200/70 transition hover:text-gold-300">
              Inquiries
            </Link>
            <Link href="/admin/portfolio" className="rounded-full bg-cream-50/10 px-3 py-2 text-gold-300">
              Portfolio
            </Link>
            <button
              type="button"
              onClick={logout}
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-cream-50/20 px-4 py-2 transition hover:border-gold-400 hover:text-gold-300"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Portfolio Manager</h1>
        <p className="mt-1 text-sm text-ink-500">
          Upload, organize and manage your public portfolio gallery ({total} item{total === 1 ? '' : 's'}).
        </p>

        {/* Upload panel */}
        <div className="mt-8 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm">
          {!cloudName ? (
            <div className="text-sm text-ink-600">
              <p className="font-medium text-ink-900">Cloudinary is not configured yet.</p>
              <p className="mt-1">
                Add <code className="rounded bg-cream-100 px-1">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>,{' '}
                <code className="rounded bg-cream-100 px-1">NEXT_PUBLIC_CLOUDINARY_API_KEY</code> and{' '}
                <code className="rounded bg-cream-100 px-1">CLOUDINARY_API_SECRET</code> to enable uploads.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <div>
                <label htmlFor="m-title" className="form-label">Title</label>
                <input
                  id="m-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Ballroom Wedding"
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="m-cat" className="form-label">Category</label>
                <select id="m-cat" value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <CldUploadWidget
                signatureEndpoint="/api/admin/upload-signature"
                options={{
                  folder: 'festigo/portfolio',
                  resourceType: 'auto',
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  maxFileSize: 104857600,
                }}
                onSuccess={(result) => handleUploaded(result?.info)}
                onError={() => setError('Upload failed. Please try again.')}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} disabled={saving} className="btn-gold">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" /> Upload media
                      </>
                    )}
                  </button>
                )}
              </CldUploadWidget>
            </div>
          )}
        </div>

        {/* Toolbar: search + sort */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              className="form-input pl-10"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="form-input w-auto">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Quick filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTypeFilter(t.key)} className={chip(typeFilter === t.key)}>
              {t.label}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-ink-200 sm:block" />
          <button type="button" onClick={() => setCatFilter('All')} className={chip(catFilter === 'All')}>
            All categories
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCatFilter(c)} className={chip(catFilter === c)}>
              {c}
            </button>
          ))}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3">
            <span className="text-sm text-ink-700">{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirm({ ids: [...selected], bulk: true })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-600 hover:border-gold-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="mt-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
          )}

          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
              <Inbox className="h-10 w-10 text-ink-300" />
              <p className="mt-4 font-display text-xl text-ink-900">No media found</p>
              <p className="mt-1 text-sm text-ink-400">Upload media above, or adjust your search / filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const isSelected = selected.has(item._id);
                const thumb =
                  item.type === 'video' ? videoPoster(item.url, 500) : optimizedImage(item.url, 500);
                return (
                  <div
                    key={item._id}
                    className={cn(
                      'overflow-hidden rounded-2xl border bg-white shadow-sm transition',
                      isSelected ? 'border-gold-500 ring-2 ring-gold-400/40' : 'border-ink-200/70',
                      busyId === item._id && 'opacity-60'
                    )}
                  >
                    <div className="relative aspect-[4/3] bg-ink-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => toggleSelect(item._id)}
                        aria-label={isSelected ? 'Deselect' : 'Select'}
                        className={cn(
                          'absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md border transition',
                          isSelected
                            ? 'border-gold-500 bg-gold-gradient text-ink-900'
                            : 'border-cream-50/70 bg-ink-950/40 text-transparent hover:text-cream-50'
                        )}
                      >
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </button>
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream-50">
                        {item.type === 'video' ? (
                          <>
                            <Film className="h-3 w-3" /> Video
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-3 w-3" /> Image
                          </>
                        )}
                      </span>
                    </div>
                    <div className="p-4">
                      {editingId === item._id ? (
                        <div className="space-y-2">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="form-input !py-2 text-sm"
                          />
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="form-input !py-2 text-sm"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {item.type === 'image' ? (
                            <select
                              value={editPlacement}
                              onChange={(e) => setEditPlacement(e.target.value)}
                              className="form-input !py-2 text-sm"
                              title="Pin this image to a homepage hero slot"
                            >
                              {HOMEPAGE_PLACEMENTS.map((p) => (
                                <option key={p.value || 'none'} value={p.value}>
                                  {p.value ? `Homepage: ${p.label}` : 'Homepage placement: None'}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-[11px] text-ink-400">
                              Homepage placement is available for images only.
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(item._id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-3 py-1.5 text-xs text-cream-50"
                            >
                              <Check className="h-3.5 w-3.5" /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600"
                            >
                              <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-display text-lg text-ink-900">{item.title}</div>
                          <div className="text-[11px] uppercase tracking-widest text-gold-600">{item.category}</div>
                          {item.homepagePlacement ? (
                            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gold-700">
                              <Star className="h-3 w-3 fill-current" /> {placementLabel(item.homepagePlacement)}
                            </div>
                          ) : null}
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirm({ ids: [item._id], bulk: false })}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => load(page + 1, false)}
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
      </div>

      {/* Delete confirmation dialog */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm"
          onClick={() => setConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-luxe"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl text-ink-900">
              Delete {confirm.bulk ? `${confirm.ids.length} items` : 'this item'}?
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              This permanently removes the media from the gallery and from Cloudinary. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-full border border-ink-200 px-5 py-2.5 text-sm text-ink-600 hover:border-gold-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runDelete}
                disabled={busyId !== null}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
                {busyId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
