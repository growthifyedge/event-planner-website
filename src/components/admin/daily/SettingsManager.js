'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Check, Info } from 'lucide-react';
import StudioShell from './StudioShell';
import { cn } from '@/lib/utils';
import { MENU_DAYS } from '@/data/meal-constants';

export default function SettingsManager() {
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/meal-studio/settings', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/admin/login');
      if (!res.ok) throw new Error('load');
      const json = await res.json();
      const s = json.settings || {};
      setExists(!!json.exists);
      setForm({
        serviceName: s.serviceName || 'Festigo Daily',
        serviceArea: s.serviceArea || 'Karachi',
        karachiOnly: s.karachiOnly !== false,
        operatingDays: Array.isArray(s.operatingDays) && s.operatingDays.length ? s.operatingDays : [...MENU_DAYS],
        sundayClosed: s.sundayClosed !== false,
        opening: s.operatingHours?.opening || '07:00',
        closing: s.operatingHours?.closing || '19:00',
        deliveryWindows: (s.deliveryWindows || []).join(', '),
        maximumDailyCapacity: s.maximumDailyCapacity ?? 500,
        sfaLicensed: s.sfaLicensed !== false,
        orderingCutoff: s.orderingCutoff || '',
        regularOrdersEnabled: s.regularOrdersEnabled !== false,
        balancedOrdersEnabled: s.balancedOrdersEnabled !== false,
        corporateTrialsEnabled: s.corporateTrialsEnabled !== false,
        isPublished: s.isPublished === true,
      });
    } catch { setError('Failed to load settings. Please refresh.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  function toggleDay(day) {
    setForm((f) => {
      const has = f.operatingDays.includes(day);
      const next = has ? f.operatingDays.filter((d) => d !== day) : [...MENU_DAYS].filter((d) => f.operatingDays.includes(d) || d === day);
      return { ...f, operatingDays: next };
    });
  }

  async function save() {
    setError(''); setSaved(false);
    if (!form.serviceArea.trim()) { setError('Service area cannot be empty.'); return; }
    if (!/karachi/i.test(form.serviceArea)) { setError('Service area must be within Karachi.'); return; }
    if (!Number.isInteger(Number(form.maximumDailyCapacity)) || Number(form.maximumDailyCapacity) <= 0) {
      setError('Daily capacity must be a whole number greater than zero.'); return;
    }
    if (form.opening >= form.closing) { setError('Opening time must be before closing time.'); return; }
    setSaving(true);
    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        serviceArea: form.serviceArea.trim(),
        karachiOnly: form.karachiOnly,
        operatingDays: form.operatingDays,
        sundayClosed: form.sundayClosed,
        operatingHours: { opening: form.opening, closing: form.closing },
        deliveryWindows: form.deliveryWindows.split(',').map((s) => s.trim()).filter(Boolean),
        maximumDailyCapacity: Number(form.maximumDailyCapacity),
        sfaLicensed: form.sfaLicensed,
        orderingCutoff: form.orderingCutoff.trim(),
        regularOrdersEnabled: form.regularOrdersEnabled,
        balancedOrdersEnabled: form.balancedOrdersEnabled,
        corporateTrialsEnabled: form.corporateTrialsEnabled,
        isPublished: form.isPublished,
      };
      const res = await fetch('/api/admin/meal-studio/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (res.status === 401) return router.replace('/admin/login');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || 'Could not save settings.'); return; }
      setExists(true); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  }

  if (loading || !form) {
    return (
      <StudioShell>
        <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
      </StudioShell>
    );
  }

  return (
    <StudioShell>
      <div>
        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Meal Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Festigo Daily operational settings · Karachi only · Monday–Saturday.</p>
      </div>

      {!exists && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-300/60 bg-gold-50 p-4 text-sm text-ink-600">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" />
          <p>No saved settings yet — showing the confirmed defaults. Nothing is written until you press <strong>Save settings</strong>.</p>
        </div>
      )}

      <div className="mt-6 space-y-6">
        <Card title="Service">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FieldText label="Service name" value={form.serviceName} onChange={(v) => setForm({ ...form, serviceName: v })} />
            <FieldText label="Service area" required value={form.serviceArea} onChange={(v) => setForm({ ...form, serviceArea: v })} />
          </div>
          <div className="mt-4 space-y-2">
            <Toggle label="Karachi-only service" checked={form.karachiOnly} onChange={(v) => setForm({ ...form, karachiOnly: v })} />
            <Toggle label="SFA licensed" checked={form.sfaLicensed} onChange={(v) => setForm({ ...form, sfaLicensed: v })} />
          </div>
        </Card>

        <Card title="Operating days & hours">
          <span className="form-label">Operating days (Sunday is always closed)</span>
          <div className="flex flex-wrap gap-2">
            {MENU_DAYS.map((day) => {
              const on = form.operatingDays.includes(day);
              return (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={cn('rounded-full border px-3.5 py-1.5 text-xs transition',
                    on ? 'border-gold-500 bg-gold-gradient text-ink-900' : 'border-ink-200 bg-white text-ink-500 hover:border-gold-400')}>
                  {day}
                </button>
              );
            })}
            <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-xs text-ink-400">Sunday · Closed</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <span className="form-label">Opening</span>
              <input type="time" value={form.opening} onChange={(e) => setForm({ ...form, opening: e.target.value })} className="form-input" />
            </div>
            <div>
              <span className="form-label">Closing</span>
              <input type="time" value={form.closing} onChange={(e) => setForm({ ...form, closing: e.target.value })} className="form-input" />
            </div>
            <FieldText label="Ordering cut-off" value={form.orderingCutoff} onChange={(v) => setForm({ ...form, orderingCutoff: v })} placeholder="e.g. 6 PM the day before" />
          </div>
          <div className="mt-4"><Toggle label="Sunday closed" checked={form.sundayClosed} onChange={(v) => setForm({ ...form, sundayClosed: v })} /></div>
        </Card>

        <Card title="Capacity & delivery">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <span className="form-label">Maximum daily capacity (meals)</span>
              <input type="number" min="0" value={form.maximumDailyCapacity} onChange={(e) => setForm({ ...form, maximumDailyCapacity: e.target.value })} className="form-input" />
            </div>
            <FieldText label="Delivery windows (comma separated)" value={form.deliveryWindows} onChange={(v) => setForm({ ...form, deliveryWindows: v })} placeholder="e.g. 12:00–1:00 PM, 1:00–2:00 PM" />
          </div>
        </Card>

        <Card title="Availability toggles">
          <div className="space-y-2">
            <Toggle label="Regular office lunches enabled" checked={form.regularOrdersEnabled} onChange={(v) => setForm({ ...form, regularOrdersEnabled: v })} />
            <Toggle label="Balanced meal plans enabled" checked={form.balancedOrdersEnabled} onChange={(v) => setForm({ ...form, balancedOrdersEnabled: v })} />
            <Toggle label="Corporate trials enabled" checked={form.corporateTrialsEnabled} onChange={(v) => setForm({ ...form, corporateTrialsEnabled: v })} />
            <Toggle label="Settings published" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
          </div>
        </Card>
      </div>

      {error && <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={save} disabled={saving} className="btn-gold">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save settings</>}
        </button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><Check className="h-4 w-4" /> Saved</span>}
      </div>
    </StudioShell>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg text-ink-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function FieldText({ label, value, onChange, required, placeholder }) {
  return (
    <div>
      <span className="form-label">{label}{required && <span className="text-gold-600"> *</span>}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="form-input" />
    </div>
  );
}
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-gold-600 focus:ring-gold-500" />
      <span className="text-sm text-ink-700">{label}</span>
    </label>
  );
}
