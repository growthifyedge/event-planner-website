'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import {
  Plus, Search, Loader2, Inbox, Pencil, Trash2, Eye, EyeOff, X, Check, UploadCloud, AlertTriangle,
} from 'lucide-react';
import StudioShell from './StudioShell';
import { cn } from '@/lib/utils';
import { MEAL_TYPES, SPICE_LEVELS } from '@/data/meal-constants';
import { MEAL_TYPE_LABEL } from './studio-labels';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PUB_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Unpublished' },
];
const EMPTY = {
  name: '', slug: '', mealType: 'regular', category: '', mainDish: '', base: '', side: '',
  vegetarianAlternative: '', allergens: '', spiceLevel: 'not-applicable', description: '',
  isPublished: false, image: null,
};

export default function MealsManager() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pub, setPub] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const [modal, setModal] = useState(null); // { mode:'create'|'edit', id? }
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ search: debounced, sort: 'newest', pageSize: '60' });
      const res = await fetch(`/api/admin/meal-studio/meals?${params}`, { cache: 'no-store' });
      if (res.status === 401) return router.replace('/admin/login');
      if (!res.ok) throw new Error('load');
      const json = await res.json();
      setItems(json.items || []);
    } catch {
      setError('Failed to load meals. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [debounced, router]);

  useEffect(() => { load(); }, [load]);

  const visible = items.filter((m) =>
    pub === 'all' ? true : pub === 'published' ? m.isPublished : !m.isPublished
  );

  function openCreate() {
    setForm(EMPTY);
    setFormError('');
    setModal({ mode: 'create' });
  }
  function openEdit(m) {
    setForm({
      name: m.name || '', slug: m.slug || '', mealType: m.mealType || 'regular',
      category: m.category || '', mainDish: m.mainDish || '', base: m.base || '', side: m.side || '',
      vegetarianAlternative: m.vegetarianAlternative || '',
      allergens: (m.allergens || []).join(', '), spiceLevel: m.spiceLevel || 'not-applicable',
      description: m.description || '', isPublished: !!m.isPublished, image: m.image || null,
    });
    setFormError('');
    setModal({ mode: 'edit', id: m._id });
  }

  function buildPayload() {
    const payload = {
      name: form.name.trim(),
      mealType: form.mealType,
      spiceLevel: form.spiceLevel,
      isPublished: form.isPublished,
    };
    const optionals = ['slug', 'category', 'mainDish', 'base', 'side', 'vegetarianAlternative', 'description'];
    optionals.forEach((k) => { if (form[k].trim()) payload[k] = form[k].trim(); });
    const allergens = form.allergens.split(',').map((s) => s.trim()).filter(Boolean);
    if (allergens.length) payload.allergens = allergens;
    if (form.image?.url) payload.image = { url: form.image.url, publicId: form.image.publicId || '', alt: form.image.alt || form.name.trim() };
    return payload;
  }

  async function save() {
    if (!form.name.trim()) { setFormError('Meal name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const isEdit = modal.mode === 'edit';
      const res = await fetch(
        isEdit ? `/api/admin/meal-studio/meals/${modal.id}` : '/api/admin/meal-studio/meals',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        }
      );
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || 'Could not save the meal.');
        return;
      }
      setModal(null);
      await load();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(m) {
    setBusyId(m._id);
    try {
      const res = await fetch(`/api/admin/meal-studio/meals/${m._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !m.isPublished }),
      });
      if (res.status === 401) return router.replace('/admin/login');
      if (res.ok) await load();
    } finally { setBusyId(null); }
  }

  async function remove() {
    if (!confirmDel) return;
    setBusyId(confirmDel._id);
    setError('');
    try {
      const res = await fetch(`/api/admin/meal-studio/meals/${confirmDel._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Could not delete the meal.'); setConfirmDel(null); return; }
      setConfirmDel(null);
      await load();
    } finally { setBusyId(null); }
  }

  return (
    <StudioShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Meals</h1>
          <p className="mt-1 text-sm text-ink-500">Manage Festigo Daily Pakistani meals — office lunches &amp; balanced options.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-gold">
          <Plus className="h-4 w-4" /> New meal
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meals…" className="form-input pl-10" aria-label="Search meals" />
        </div>
        <div className="flex flex-wrap gap-2">
          {PUB_FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => setPub(f.key)}
              className={cn('rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-widest transition',
                pub === f.key ? 'border-gold-500 bg-gold-gradient text-ink-900' : 'border-ink-200 bg-white text-ink-500 hover:border-gold-400')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
            <Inbox className="h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-xl text-ink-900">No meals yet</p>
            <p className="mt-1 text-sm text-ink-400">Add your first meal — e.g. Chicken Biryani or Daal Chawal.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m) => (
              <div key={m._id} className={cn('rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm', busyId === m._id && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-ink-900">{m.name}</div>
                    <div className="text-[11px] uppercase tracking-widest text-gold-600">
                      {MEAL_TYPE_LABEL[m.mealType] || m.mealType}{m.category ? ` · ${m.category}` : ''}
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest',
                    m.isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-ink-200 bg-ink-50 text-ink-500')}>
                    {m.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                {(m.mainDish || m.base || m.side) && (
                  <p className="mt-2 text-sm text-ink-500">{[m.mainDish, m.base, m.side].filter(Boolean).join(' · ')}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <button type="button" onClick={() => openEdit(m)} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => togglePublish(m)} disabled={busyId === m._id}
                    className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700">
                    {m.isPublished ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                  </button>
                  <button type="button" onClick={() => setConfirmDel(m)} aria-label="Delete meal"
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !saving && setModal(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-luxe sm:rounded-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink-900">{modal.mode === 'edit' ? 'Edit meal' : 'New meal'}</h3>
              <button type="button" onClick={() => !saving && setModal(null)} aria-label="Close" className="rounded-full p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Meal name" required>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken Biryani" className="form-input" />
              </Field>
              <Field label="Meal type" required>
                <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} className="form-input">
                  {MEAL_TYPES.map((t) => <option key={t} value={t}>{MEAL_TYPE_LABEL[t] || t}</option>)}
                </select>
              </Field>
              <Field label="Main dish">
                <input value={form.mainDish} onChange={(e) => setForm({ ...form, mainDish: e.target.value })} placeholder="e.g. Chicken Karahi" className="form-input" />
              </Field>
              <Field label="Category">
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Rice · Curry" className="form-input" />
              </Field>
              <Field label="Base">
                <input value={form.base} onChange={(e) => setForm({ ...form, base: e.target.value })} placeholder="e.g. Basmati Rice" className="form-input" />
              </Field>
              <Field label="Side">
                <input value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })} placeholder="e.g. Raita · Salad" className="form-input" />
              </Field>
              <Field label="Vegetarian alternative">
                <input value={form.vegetarianAlternative} onChange={(e) => setForm({ ...form, vegetarianAlternative: e.target.value })} placeholder="e.g. Daal Chawal" className="form-input" />
              </Field>
              <Field label="Spice level">
                <select value={form.spiceLevel} onChange={(e) => setForm({ ...form, spiceLevel: e.target.value })} className="form-input capitalize">
                  {SPICE_LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Allergens (comma separated)">
                <input value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} placeholder="e.g. dairy, gluten" className="form-input" />
              </Field>
              <Field label="Slug (optional)">
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="chicken-biryani" className="form-input" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input resize-none" placeholder="Freshly prepared, no medical or calorie claims." />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <span className="form-label">Meal image (optional)</span>
                <div className="flex items-center gap-3">
                  {form.image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image.url} alt={form.name || 'meal'} className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-cream-100 text-ink-300"><UploadCloud className="h-5 w-5" /></span>
                  )}
                  {CLOUD ? (
                    <CldUploadWidget signatureEndpoint="/api/admin/upload-signature?purpose=daily-meal"
                      options={{ folder: 'festigo-daily/meals', resourceType: 'image', clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'], sources: ['local', 'url', 'camera'], multiple: false, maxFileSize: 10485760 }}
                      onSuccess={(r) => { const i = r?.info; if (i?.secure_url) setForm((f) => ({ ...f, image: { url: i.secure_url, publicId: i.public_id, alt: f.name } })); }}
                      onError={() => setFormError('Image upload failed.')}>
                      {({ open }) => (
                        <button type="button" onClick={() => open()} className="btn-outline !py-2 text-xs">Upload image</button>
                      )}
                    </CldUploadWidget>
                  ) : (
                    <span className="text-xs text-ink-400">Cloudinary not configured — images optional.</span>
                  )}
                  {form.image?.url && (
                    <button type="button" onClick={() => setForm({ ...form, image: null })} className="text-xs text-red-600 hover:underline">Remove</button>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-gold-600 focus:ring-gold-500" />
                <span className="text-sm text-ink-700">Published (visible on the public site &amp; selectable for menus)</span>
              </label>
            </div>

            {formError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-5">
              <button type="button" onClick={() => setModal(null)} disabled={saving} className="rounded-full border border-ink-200 px-5 py-2.5 text-sm text-ink-600 hover:border-gold-400">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="btn-gold">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save meal</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <ConfirmDialog
          title={`Delete “${confirmDel.name}”?`}
          body="This permanently removes the meal. Published weekly menus keep their frozen snapshots and are unaffected."
          confirmLabel="Delete meal"
          busy={busyId === confirmDel._id}
          onCancel={() => setConfirmDel(null)}
          onConfirm={remove}
        />
      )}
    </StudioShell>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <span className="form-label">{label}{required && <span className="text-gold-600"> *</span>}</span>
      {children}
    </div>
  );
}

export function ConfirmDialog({ title, body, confirmLabel, busy, danger = true, onCancel, onConfirm, icon: Icon = AlertTriangle }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-luxe" onClick={(e) => e.stopPropagation()}>
        <span className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-full', danger ? 'bg-red-50 text-red-600' : 'bg-gold-100 text-gold-700')}>
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-xl text-ink-900">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{body}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-ink-200 px-5 py-2.5 text-sm text-ink-600 hover:border-gold-400">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className={cn('inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white disabled:opacity-60', danger ? 'bg-red-600 hover:bg-red-700' : 'bg-ink-900 hover:bg-ink-800')}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
