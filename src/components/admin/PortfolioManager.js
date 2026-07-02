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
} from 'lucide-react';
import { site } from '@/data/site';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Weddings', 'Corporate', 'Birthdays', 'Private Parties'];
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function PortfolioManager() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[0]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('load failed');
      const json = await res.json();
      setItems(json.media || []);
    } catch {
      setError('Failed to load media. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
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
      await load();
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
  }

  async function saveEdit(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, category: editCategory }),
      });
      if (res.ok) {
        setEditingId(null);
        await load();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this media permanently? It is also removed from Cloudinary.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div>
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
          Upload images and videos to your public portfolio gallery.
        </p>

        {/* Media Library upload panel */}
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
                <select
                  id="m-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                >
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
                  <button
                    type="button"
                    onClick={() => open()}
                    disabled={saving}
                    className="btn-gold"
                  >
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
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
          )}
        </div>

        {/* Manager grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
              <Inbox className="h-10 w-10 text-ink-300" />
              <p className="mt-4 font-display text-xl text-ink-900">No media yet</p>
              <p className="mt-1 max-w-md text-sm text-ink-400">
                Upload images or videos above. Your public portfolio shows the curated default
                gallery until you add your own.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={cn(
                    'overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-sm transition',
                    busyId === item._id && 'opacity-60'
                  )}
                >
                  <div className="relative aspect-[4/3] bg-ink-100">
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream-50">
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
                        <div className="text-[11px] uppercase tracking-widest text-gold-600">
                          {item.category}
                        </div>
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
                            onClick={() => remove(item._id)}
                            disabled={busyId === item._id}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
