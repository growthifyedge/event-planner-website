'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, Inbox, Pencil, Trash2, Eye, EyeOff, X, Check } from 'lucide-react';
import StudioShell from './StudioShell';
import { ConfirmDialog } from './MealsManager';
import { cn } from '@/lib/utils';
import { MEAL_TYPES } from '@/data/meal-constants';
import { MEAL_TYPE_LABEL, pkr } from './studio-labels';

const EMPTY = {
  name: '', slug: '', description: '', mealType: '', startingPrice: '', minimumOrder: '',
  planDuration: '', deliveryInfo: '', ctaLabel: '', inclusions: '', displayOrder: '', isPublished: false,
};

export default function PackagesManager() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/meal-studio/packages?pageSize=100', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/admin/login');
      if (!res.ok) throw new Error('load');
      setItems((await res.json()).items || []);
    } catch { setError('Failed to load packages. Please refresh.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm(EMPTY); setFormError(''); setModal({ mode: 'create' }); }
  function openEdit(p) {
    setForm({
      name: p.name || '', slug: p.slug || '', description: p.description || '', mealType: p.mealType || '',
      startingPrice: p.startingPrice ?? '', minimumOrder: p.minimumOrder ?? '',
      planDuration: p.planDuration || '', deliveryInfo: p.deliveryInfo || '', ctaLabel: p.ctaLabel || '',
      inclusions: (p.inclusions || []).join(', '), displayOrder: p.displayOrder ?? '', isPublished: !!p.isPublished,
    });
    setFormError(''); setModal({ mode: 'edit', id: p._id });
  }

  function buildPayload() {
    const payload = { name: form.name.trim(), currency: 'PKR', isPublished: form.isPublished };
    ['slug', 'description', 'planDuration', 'deliveryInfo', 'ctaLabel'].forEach((k) => { if (form[k].trim()) payload[k] = form[k].trim(); });
    if (form.mealType) payload.mealType = form.mealType;
    const inclusions = form.inclusions.split(',').map((s) => s.trim()).filter(Boolean);
    if (inclusions.length) payload.inclusions = inclusions;
    if (String(form.startingPrice).trim() !== '') payload.startingPrice = Number(form.startingPrice);
    if (String(form.minimumOrder).trim() !== '') payload.minimumOrder = Number(form.minimumOrder);
    if (String(form.displayOrder).trim() !== '') payload.displayOrder = Number(form.displayOrder);
    return payload;
  }

  async function save() {
    if (!form.name.trim()) { setFormError('Package name is required.'); return; }
    setSaving(true); setFormError('');
    try {
      const isEdit = modal.mode === 'edit';
      const res = await fetch(isEdit ? `/api/admin/meal-studio/packages/${modal.id}` : '/api/admin/meal-studio/packages', {
        method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormError(data.error || 'Could not save the package.'); return; }
      setModal(null); await load();
    } catch { setFormError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  async function togglePublish(p) {
    setBusyId(p._id);
    try {
      const res = await fetch(`/api/admin/meal-studio/packages/${p._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !p.isPublished }),
      });
      if (res.status === 401) return router.replace('/admin/login');
      if (res.ok) await load();
    } finally { setBusyId(null); }
  }

  async function remove() {
    if (!confirmDel) return;
    setBusyId(confirmDel._id); setError('');
    try {
      const res = await fetch(`/api/admin/meal-studio/packages/${confirmDel._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Could not delete.'); setConfirmDel(null); return; }
      setConfirmDel(null); await load();
    } finally { setBusyId(null); }
  }

  return (
    <StudioShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Meal Packages</h1>
          <p className="mt-1 text-sm text-ink-500">Corporate meal plans &amp; pricing (PKR).</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-gold"><Plus className="h-4 w-4" /> New package</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
            <Inbox className="h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-xl text-ink-900">No packages yet</p>
            <p className="mt-1 text-sm text-ink-400">Create your first corporate meal plan.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div key={p._id} className={cn('flex flex-col rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm', busyId === p._id && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-display text-lg text-ink-900">{p.name}</div>
                  <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest',
                    p.isPublished ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-ink-200 bg-ink-50 text-ink-500')}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-gold-700">{p.startingPrice ? `From ${pkr(p.startingPrice)}` : 'Price on request'}</div>
                {p.description && <p className="mt-2 line-clamp-2 text-sm text-ink-500">{p.description}</p>}
                <div className="mt-2 text-xs text-ink-400">
                  {p.minimumOrder ? `Min ${p.minimumOrder} meals` : ''}{p.minimumOrder && p.planDuration ? ' · ' : ''}{p.planDuration || ''}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  <button type="button" onClick={() => openEdit(p)} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button type="button" onClick={() => togglePublish(p)} disabled={busyId === p._id} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700">
                    {p.isPublished ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                  </button>
                  <button type="button" onClick={() => setConfirmDel(p)} aria-label="Delete package" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !saving && setModal(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-luxe sm:rounded-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink-900">{modal.mode === 'edit' ? 'Edit package' : 'New package'}</h3>
              <button type="button" onClick={() => !saving && setModal(null)} aria-label="Close" className="rounded-full p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className="form-label">Package name <span className="text-gold-600">*</span></span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Team Lunch — Weekly" className="form-input" />
              </div>
              <div className="sm:col-span-2">
                <span className="form-label">Description</span>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input resize-none" placeholder="What this plan includes." />
              </div>
              <div>
                <span className="form-label">Starting price (PKR)</span>
                <input type="number" min="0" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} placeholder="e.g. 1200" className="form-input" />
              </div>
              <div>
                <span className="form-label">Minimum order (meals)</span>
                <input type="number" min="1" value={form.minimumOrder} onChange={(e) => setForm({ ...form, minimumOrder: e.target.value })} placeholder="e.g. 10" className="form-input" />
              </div>
              <div>
                <span className="form-label">Meal type</span>
                <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })} className="form-input">
                  <option value="">— None —</option>
                  {MEAL_TYPES.map((t) => <option key={t} value={t}>{MEAL_TYPE_LABEL[t] || t}</option>)}
                </select>
              </div>
              <div>
                <span className="form-label">Display order</span>
                <input type="number" min="0" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} placeholder="0" className="form-input" />
              </div>
              <div>
                <span className="form-label">Plan duration</span>
                <input value={form.planDuration} onChange={(e) => setForm({ ...form, planDuration: e.target.value })} placeholder="e.g. Weekly (Mon–Sat)" className="form-input" />
              </div>
              <div>
                <span className="form-label">Delivery info</span>
                <input value={form.deliveryInfo} onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })} placeholder="e.g. Karachi offices" className="form-input" />
              </div>
              <div>
                <span className="form-label">CTA label</span>
                <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="e.g. Get this plan" className="form-input" />
              </div>
              <div>
                <span className="form-label">Slug (optional)</span>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="team-lunch-weekly" className="form-input" />
              </div>
              <div className="sm:col-span-2">
                <span className="form-label">Inclusions (comma separated)</span>
                <input value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} placeholder="1 main dish, 1 side, rotating weekly menu" className="form-input" />
              </div>
              <label className="flex items-center gap-3 sm:col-span-2">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-gold-600 focus:ring-gold-500" />
                <span className="text-sm text-ink-700">Published (visible on the public site)</span>
              </label>
            </div>
            {formError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</p>}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-5">
              <button type="button" onClick={() => setModal(null)} disabled={saving} className="rounded-full border border-ink-200 px-5 py-2.5 text-sm text-ink-600 hover:border-gold-400">Cancel</button>
              <button type="button" onClick={save} disabled={saving} className="btn-gold">{saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save package</>}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog title={`Delete “${confirmDel.name}”?`} body="This permanently removes the package. This cannot be undone."
          confirmLabel="Delete package" busy={busyId === confirmDel._id} onCancel={() => setConfirmDel(null)} onConfirm={remove} />
      )}
    </StudioShell>
  );
}
