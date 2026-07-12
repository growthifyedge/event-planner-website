'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Loader2, Inbox, Pencil, Trash2, Eye, Archive, Send, X, Check, ArrowLeft, CalendarDays, AlertTriangle,
} from 'lucide-react';
import StudioShell from './StudioShell';
import { ConfirmDialog } from './MealsManager';
import { cn } from '@/lib/utils';
import { MENU_DAYS } from '@/data/meal-constants';
import { classifyActiveMenu, formatWeekRange, MENU_SLOTS } from '@/lib/daily-menu-view';
import { MEAL_TYPE_LABEL, MENU_STATUS_STYLE } from './studio-labels';

const emptyDays = () => Object.fromEntries(MENU_DAYS.map((d) => [d, { regular: '', balanced: '', vegetarian: '' }]));
const rangesOverlap = (aS, aE, bS, bE) => new Date(aS) <= new Date(bE) && new Date(aE) >= new Date(bS);

export default function WeeklyMenuManager() {
  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'builder'
  const [builder, setBuilder] = useState(null); // { id?, title, weekStart, weekEnd, days }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null); // published menu snapshot preview
  const [confirmPublish, setConfirmPublish] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [mRes, mealRes] = await Promise.all([
        fetch('/api/admin/meal-studio/weekly-menus?pageSize=100', { cache: 'no-store' }),
        fetch('/api/admin/meal-studio/meals?pageSize=60&sort=newest', { cache: 'no-store' }),
      ]);
      if (mRes.status === 401 || mealRes.status === 401) return router.replace('/admin/login');
      if (!mRes.ok || !mealRes.ok) throw new Error('load');
      setMenus((await mRes.json()).items || []);
      setMeals((await mealRes.json()).items || []);
    } catch { setError('Failed to load weekly menus. Please refresh.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const mealById = (id) => meals.find((m) => m._id === id);

  function startCreate() {
    setBuilder({ title: '', weekStart: '', weekEnd: '', days: emptyDays() });
    setFormError(''); setView('builder');
  }
  function startEdit(menu) {
    const days = emptyDays();
    (menu.days || []).forEach((d) => {
      if (!days[d.day]) return;
      MENU_SLOTS.forEach(({ key }) => { if (d[key]?.mealId) days[d.day][key] = d[key].mealId; });
    });
    setBuilder({
      id: menu._id, title: menu.title || '',
      weekStart: (menu.weekStart || '').slice(0, 10), weekEnd: (menu.weekEnd || '').slice(0, 10), days,
    });
    setFormError(''); setView('builder');
  }

  function buildPayload() {
    const days = MENU_DAYS
      .map((day) => {
        const slots = builder.days[day];
        const entry = { day };
        let has = false;
        MENU_SLOTS.forEach(({ key }) => { if (slots[key]) { entry[key] = { mealId: slots[key] }; has = true; } });
        return has ? entry : null;
      })
      .filter(Boolean);
    return { title: builder.title.trim(), weekStart: builder.weekStart, weekEnd: builder.weekEnd, days };
  }

  async function saveDraft() {
    if (!builder.title.trim()) { setFormError('Please give the menu a title.'); return; }
    if (!builder.weekStart || !builder.weekEnd) { setFormError('Please set the week start and end dates.'); return; }
    if (builder.weekStart >= builder.weekEnd) { setFormError('Week start must be before week end.'); return; }
    setSaving(true); setFormError('');
    try {
      const isEdit = !!builder.id;
      const res = await fetch(isEdit ? `/api/admin/meal-studio/weekly-menus/${builder.id}` : '/api/admin/meal-studio/weekly-menus', {
        method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload()),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormError(data.error || 'Could not save the menu.'); return; }
      setView('list'); setBuilder(null); await load();
    } catch { setFormError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  async function doPublish() {
    if (!confirmPublish) return;
    setBusyId(confirmPublish._id);
    try {
      const res = await fetch(`/api/admin/meal-studio/weekly-menus/${confirmPublish._id}/publish`, { method: 'POST' });
      if (res.status === 401) return router.replace('/admin/login');
      setConfirmPublish(null);
      if (res.ok) await load();
    } finally { setBusyId(null); }
  }
  async function doArchive() {
    if (!confirmArchive) return;
    setBusyId(confirmArchive._id);
    try {
      const res = await fetch(`/api/admin/meal-studio/weekly-menus/${confirmArchive._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'archive' }),
      });
      setConfirmArchive(null);
      if (res.ok) await load();
    } finally { setBusyId(null); }
  }
  async function doDelete() {
    if (!confirmDel) return;
    setBusyId(confirmDel._id);
    try {
      const res = await fetch(`/api/admin/meal-studio/weekly-menus/${confirmDel._id}`, { method: 'DELETE' });
      setConfirmDel(null);
      if (res.ok) await load();
    } finally { setBusyId(null); }
  }

  // Which published menus would this publish archive (overlap)?
  const overlapWarning = (menu) => {
    const others = menus.filter(
      (m) => m._id !== menu._id && m.status === 'published' && rangesOverlap(menu.weekStart, menu.weekEnd, m.weekStart, m.weekEnd)
    );
    return others.length;
  };

  if (view === 'builder' && builder) {
    return (
      <StudioShell>
        <button type="button" onClick={() => { setView('list'); setBuilder(null); }} className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" /> Back to menus
        </button>
        <h1 className="mt-3 font-display text-3xl text-ink-900 sm:text-4xl">{builder.id ? 'Edit draft menu' : 'New weekly menu'}</h1>
        <p className="mt-1 text-sm text-ink-500">Monday–Saturday only. Assign published meals to each slot, then save as a draft. Publishing freezes a snapshot.</p>

        <div className="mt-6 grid grid-cols-1 gap-5 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm sm:grid-cols-3">
          <div className="sm:col-span-3">
            <span className="form-label">Menu title <span className="text-gold-600">*</span></span>
            <input value={builder.title} onChange={(e) => setBuilder({ ...builder, title: e.target.value })} placeholder="e.g. Week of 14 July" className="form-input" />
          </div>
          <div>
            <span className="form-label">Week start <span className="text-gold-600">*</span></span>
            <input type="date" value={builder.weekStart} onChange={(e) => setBuilder({ ...builder, weekStart: e.target.value })} className="form-input" />
          </div>
          <div>
            <span className="form-label">Week end <span className="text-gold-600">*</span></span>
            <input type="date" value={builder.weekEnd} onChange={(e) => setBuilder({ ...builder, weekEnd: e.target.value })} className="form-input" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {MENU_DAYS.map((day) => (
            <div key={day} className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gold-600" />
                <h3 className="font-display text-lg text-ink-900">{day}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {MENU_SLOTS.map(({ key, label }) => (
                  <div key={key}>
                    <span className="form-label">{label}</span>
                    <select value={builder.days[day][key]}
                      onChange={(e) => setBuilder((b) => ({ ...b, days: { ...b.days, [day]: { ...b.days[day], [key]: e.target.value } } }))}
                      className="form-input" aria-label={`${day} ${label} meal`}>
                      <option value="">— None —</option>
                      {meals.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}{m.isPublished ? '' : ' (draft)'}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formError && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{formError}</p>}

        {/* Draft preview — live meal data */}
        <div className="mt-6 rounded-2xl border border-gold-300/60 bg-gold-50/50 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-700">Draft preview — live meal data (frozen on publish)</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_DAYS.map((day) => {
              const slots = builder.days[day];
              const any = MENU_SLOTS.some(({ key }) => slots[key]);
              return (
                <div key={day} className="rounded-xl border border-ink-200/60 bg-white p-3">
                  <div className="font-display text-ink-900">{day}</div>
                  {any ? MENU_SLOTS.map(({ key, label }) => {
                    const meal = slots[key] && mealById(slots[key]);
                    if (!meal) return null;
                    return <div key={key} className="mt-1 text-xs text-ink-600"><span className="text-gold-700">{label}:</span> {meal.name}</div>;
                  }) : <div className="mt-1 text-xs italic text-ink-400">To be announced</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={() => { setView('list'); setBuilder(null); }} disabled={saving} className="rounded-full border border-ink-200 px-5 py-2.5 text-sm text-ink-600 hover:border-gold-400">Cancel</button>
          <button type="button" onClick={saveDraft} disabled={saving} className="btn-gold">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save draft</>}
          </button>
        </div>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Weekly Menu</h1>
          <p className="mt-1 text-sm text-ink-500">Draft, preview and publish the Monday–Saturday menu. Publishing freezes a snapshot.</p>
        </div>
        <button type="button" onClick={startCreate} className="btn-gold"><Plus className="h-4 w-4" /> New draft</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
            <Inbox className="h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-xl text-ink-900">No weekly menus yet</p>
            <p className="mt-1 text-sm text-ink-400">Create your first draft to plan the week.</p>
          </div>
        ) : (
          menus.map((menu) => {
            const cls = classifyActiveMenu(menu);
            const tag = menu.status === 'published' ? (cls.state === 'current' ? 'This week' : cls.state === 'upcoming' ? 'Upcoming' : 'Past') : null;
            return (
              <div key={menu._id} className={cn('rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm', busyId === menu._id && 'opacity-60')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg text-ink-900">{menu.title}</div>
                    <div className="mt-0.5 text-sm text-ink-500">{formatWeekRange(menu.weekStart, menu.weekEnd) || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tag && <span className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-gold-700">{tag}</span>}
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest', MENU_STATUS_STYLE[menu.status])}>{menu.status}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                  {menu.status === 'published' ? (
                    <button type="button" onClick={() => setPreview(menu)} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700"><Eye className="h-3.5 w-3.5" /> View snapshot</button>
                  ) : (
                    <button type="button" onClick={() => startEdit(menu)} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  )}
                  {menu.status === 'draft' && (
                    <button type="button" onClick={() => setConfirmPublish(menu)} className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 transition hover:bg-emerald-100"><Send className="h-3.5 w-3.5" /> Publish</button>
                  )}
                  {menu.status !== 'archived' && (
                    <button type="button" onClick={() => setConfirmArchive(menu)} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400"><Archive className="h-3.5 w-3.5" /> Archive</button>
                  )}
                  <button type="button" onClick={() => setConfirmDel(menu)} aria-label="Delete menu" className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Published snapshot preview */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-luxe sm:rounded-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl text-ink-900">{preview.title}</h3>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">Published — frozen snapshot</p>
              </div>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close" className="rounded-full p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MENU_DAYS.map((day) => {
                const entry = (preview.days || []).find((d) => d.day === day);
                const slots = MENU_SLOTS.map(({ key, label }) => ({ label, snap: entry?.[key]?.snapshot })).filter((s) => s.snap?.name);
                return (
                  <div key={day} className="rounded-xl border border-ink-200/60 bg-cream-50/60 p-3">
                    <div className="font-display text-ink-900">{day}</div>
                    {slots.length ? slots.map((s) => (
                      <div key={s.label} className="mt-1 text-xs text-ink-600"><span className="text-gold-700">{s.label}:</span> {s.snap.name}{s.snap.base ? ` · ${s.snap.base}` : ''}</div>
                    )) : <div className="mt-1 text-xs italic text-ink-400">To be announced</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {confirmPublish && (
        <ConfirmDialog
          title={`Publish “${confirmPublish.title}”?`}
          body={
            overlapWarning(confirmPublish) > 0
              ? `This freezes a snapshot from the current meals and will ARCHIVE ${overlapWarning(confirmPublish)} overlapping published menu(s) for the same dates.`
              : 'This freezes a display snapshot from the currently selected meals. Later meal edits will not change this published menu.'
          }
          confirmLabel="Publish menu" danger={false} icon={Send}
          busy={busyId === confirmPublish._id} onCancel={() => setConfirmPublish(null)} onConfirm={doPublish}
        />
      )}
      {confirmArchive && (
        <ConfirmDialog title={`Archive “${confirmArchive.title}”?`} body="Archived menus are hidden from the public site. You can still view them here."
          confirmLabel="Archive" danger={false} icon={Archive} busy={busyId === confirmArchive._id} onCancel={() => setConfirmArchive(null)} onConfirm={doArchive} />
      )}
      {confirmDel && (
        <ConfirmDialog title={`Delete “${confirmDel.title}”?`} body="This permanently removes the menu. This cannot be undone."
          confirmLabel="Delete menu" icon={AlertTriangle} busy={busyId === confirmDel._id} onCancel={() => setConfirmDel(null)} onConfirm={doDelete} />
      )}
    </StudioShell>
  );
}
