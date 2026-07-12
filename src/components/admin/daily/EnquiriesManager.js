'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Inbox, Search, RefreshCw, X, Phone, Mail, MessageCircle, MapPin, Users, CalendarDays, Wallet, Building2,
} from 'lucide-react';
import StudioShell from './StudioShell';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { MEAL_INQUIRY_STATUSES, ENQUIRY_STATUS_LABEL, ENQUIRY_STATUS_STYLE, pkr } from './studio-labels';

const digits = (v) => String(v || '').replace(/\D/g, '');
const waHref = (q) => {
  const d = digits(q.whatsapp || q.phone);
  return d ? `https://wa.me/${d}` : null;
};

export default function EnquiriesManager() {
  const router = useRouter();
  const [data, setData] = useState({ items: [], counts: { total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ pageSize: '100' });
      if (status !== 'all') params.set('status', status);
      const res = await fetch(`/api/admin/meal-studio/enquiries?${params}`, { cache: 'no-store' });
      if (res.status === 401) return router.replace('/admin/login');
      if (!res.ok) throw new Error('load');
      setData(await res.json());
    } catch { setError('Failed to load enquiries. Please refresh.'); }
    finally { setLoading(false); }
  }, [status, router]);

  useEffect(() => { load(); }, [load]);

  const term = search.trim().toLowerCase();
  const visible = (data.items || []).filter((q) => {
    if (!term) return true;
    return [q.companyName, q.contactName, q.phone, q.whatsapp, q.email, q.officeLocation]
      .some((v) => String(v || '').toLowerCase().includes(term));
  });

  async function changeStatus(id, next) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/meal-studio/enquiries/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }),
      });
      if (res.status === 401) return router.replace('/admin/login');
      if (res.ok) {
        await load();
        setSelected((s) => (s && s._id === id ? { ...s, status: next } : s));
      }
    } finally { setBusy(false); }
  }

  const c = data.counts || {};
  const cards = [
    { label: 'Total', value: c.total ?? 0 },
    { label: 'New', value: c.new ?? 0 },
    { label: 'Contacted', value: c.contacted ?? 0 },
    { label: 'Converted', value: c.converted ?? 0 },
  ];

  return (
    <StudioShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Corporate Enquiries</h1>
          <p className="mt-1 text-sm text-ink-500">Festigo Daily corporate meal enquiries only — separate from event enquiries.</p>
        </div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-xs uppercase tracking-widest text-ink-600 transition hover:border-gold-400 hover:text-gold-700">
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm">
            <div className="font-display text-3xl text-ink-900">{card.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, contact, phone, email, area…" className="form-input pl-10" aria-label="Search enquiries" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setStatus('all')} className={chip(status === 'all')}>All</button>
          {MEAL_INQUIRY_STATUSES.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={chip(status === s)}>{ENQUIRY_STATUS_LABEL[s]}</button>
          ))}
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center">
            <Inbox className="h-10 w-10 text-ink-300" />
            <p className="mt-4 font-display text-xl text-ink-900">No enquiries</p>
            <p className="mt-1 text-sm text-ink-400">Corporate enquiries from the public page will appear here.</p>
          </div>
        ) : (
          visible.map((q) => (
            <div key={q._id} className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-display text-lg text-ink-900"><Building2 className="h-4 w-4 text-gold-600" /> {q.companyName || '—'}</div>
                  <div className="mt-0.5 text-sm text-ink-500">{q.contactName}{q.officeLocation ? ` · ${q.officeLocation}` : ''}</div>
                </div>
                <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-widest', ENQUIRY_STATUS_STYLE[q.status])}>
                  {ENQUIRY_STATUS_LABEL[q.status] || q.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                {q.mealsCount != null && <span>{q.mealsCount} meals/day</span>}
                {q.employeesCount != null && <span>{q.employeesCount} employees</span>}
                {Array.isArray(q.serviceTypes) && q.serviceTypes.length > 0 && <span>{q.serviceTypes.join(', ')}</span>}
                <span>Received {formatDate(q.createdAt)}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
                <ContactLinks q={q} />
                <button type="button" onClick={() => setSelected(q)} className="ml-auto rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700">View</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-luxe sm:rounded-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl text-ink-900">{selected.companyName || selected.contactName}</h3>
                <p className="mt-0.5 text-sm text-ink-500">{selected.contactName}{selected.designation ? ` · ${selected.designation}` : ''}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-full p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2"><ContactLinks q={selected} big /></div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Detail icon={MapPin} label="Karachi area" value={selected.officeLocation} />
              <Detail icon={Users} label="Employees" value={selected.employeesCount ?? '—'} />
              <Detail icon={CalendarDays} label="Meals / day" value={selected.mealsCount ?? '—'} />
              <Detail icon={CalendarDays} label="Service days" value={selected.requiredDays ?? '—'} />
              <Detail icon={CalendarDays} label="Preferred start" value={selected.expectedStartDate ? formatDate(selected.expectedStartDate) : '—'} />
              <Detail icon={Wallet} label="Monthly budget" value={pkr(selected.monthlyBudget)} />
            </div>

            {selected.address && <Block label="Address" value={selected.address} />}
            {Array.isArray(selected.serviceTypes) && selected.serviceTypes.length > 0 && <Block label="Services" value={selected.serviceTypes.join(', ')} />}
            {selected.dietaryPreferences && <Block label="Dietary preferences" value={selected.dietaryPreferences} />}
            {selected.message && <Block label="Notes" value={selected.message} pre />}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-ink-400">Status</span>
                <select value={selected.status} disabled={busy} onChange={(e) => changeStatus(selected._id, e.target.value)}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium outline-none', ENQUIRY_STATUS_STYLE[selected.status])}>
                  {MEAL_INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{ENQUIRY_STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <span className="text-xs text-ink-400">Received {formatDateTime(selected.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    </StudioShell>
  );
}

function chip(active) {
  return cn('rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-widest transition',
    active ? 'border-gold-500 bg-gold-gradient text-ink-900' : 'border-ink-200 bg-white text-ink-500 hover:border-gold-400');
}

function ContactLinks({ q, big }) {
  const wa = waHref(q);
  const size = big ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-xs';
  return (
    <>
      {q.phone && (
        <a href={`tel:${q.phone}`} className={cn('inline-flex items-center gap-1.5 rounded-lg border border-ink-200 text-ink-600 transition hover:border-gold-400 hover:text-gold-700', size)}>
          <Phone className="h-3.5 w-3.5" /> Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" className={cn('inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50', size)}>
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
      )}
      {q.email && (
        <a href={`mailto:${q.email}`} className={cn('inline-flex items-center gap-1.5 rounded-lg border border-ink-200 text-ink-600 transition hover:border-gold-400 hover:text-gold-700', size)}>
          <Mail className="h-3.5 w-3.5" /> Email
        </a>
      )}
    </>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-400">{label}</div>
        <div className="text-ink-800">{value}</div>
      </div>
    </div>
  );
}

function Block({ label, value, pre }) {
  return (
    <div className="mt-5">
      <div className="text-[10px] uppercase tracking-widest text-ink-400">{label}</div>
      <p className={cn('mt-1.5 rounded-xl bg-cream-100/70 p-3 text-sm text-ink-700', pre && 'whitespace-pre-wrap')}>{value}</p>
    </div>
  );
}
