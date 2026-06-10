'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  RefreshCw,
  Trash2,
  X,
  Mail,
  Phone,
  Calendar,
  Users,
  Wallet,
  Clock,
  Loader2,
  Inbox,
} from 'lucide-react';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { site } from '@/data/site';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'booked', label: 'Booked' },
  { key: 'archived', label: 'Archived' },
];
const STATUS_OPTIONS = ['new', 'contacted', 'booked', 'archived'];

const statusStyle = {
  new: 'bg-gold-100 text-gold-800 border-gold-300',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  booked: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archived: 'bg-ink-100 text-ink-500 border-ink-200',
};

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-400">{label}</div>
        <div className="text-ink-800">{value}</div>
      </div>
    </div>
  );
}

export default function InquiryDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState({
    inquiries: [],
    counts: { total: 0, new: 0, contacted: 0, booked: 0, archived: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async (status) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/inquiries?status=${status}`, { cache: 'no-store' });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (!res.ok) throw new Error('load failed');
        setData(await res.json());
      } catch {
        setError('Failed to load inquiries. Please refresh.');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function changeStatus(id, status) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await load(filter);
        setSelected((s) => (s && s._id === id ? { ...s, status } : s));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this inquiry permanently? This cannot be undone.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelected(null);
        await load(filter);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  const c = data.counts;
  const cards = [
    { label: 'Total inquiries', value: c.total },
    { label: 'New', value: c.new },
    { label: 'Contacted', value: c.contacted },
    { label: 'Booked', value: c.booked },
  ];

  return (
    <div>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-cream-50/10 bg-ink-950 text-cream-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl uppercase tracking-[0.22em]">{site.name}</span>
            <span className="hidden text-[10px] uppercase tracking-luxe text-gold-400 sm:inline">
              Admin Suite
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 px-4 py-2 text-xs uppercase tracking-widest transition hover:border-gold-400 hover:text-gold-300"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Inquiries</h1>
            <p className="mt-1 text-sm text-ink-500">
              Manage and respond to event inquiries from the website.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(filter)}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-xs uppercase tracking-widest text-ink-600 transition hover:border-gold-400 hover:text-gold-700"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm">
              <div className="text-3xl font-display text-ink-900">{card.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-400">
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs uppercase tracking-widest transition',
                filter === f.key
                  ? 'border-gold-500 bg-gold-gradient text-ink-900'
                  : 'border-ink-200 bg-white text-ink-500 hover:border-gold-400 hover:text-gold-700'
              )}
            >
              {f.label}
              {f.key !== 'all' && c[f.key] > 0 && (
                <span className="ml-1.5 text-gold-600">{c[f.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-ink-200/60 bg-white py-20 text-ink-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : data.inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
              <Inbox className="h-10 w-10 text-ink-300" />
              <p className="mt-4 font-display text-xl text-ink-900">No inquiries yet</p>
              <p className="mt-1 text-sm text-ink-400">
                New submissions from the booking form will appear here.
              </p>
            </div>
          ) : (
            data.inquiries.map((q) => (
              <div
                key={q._id}
                className={cn(
                  'rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm transition',
                  busyId === q._id && 'opacity-60'
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-ink-900">{q.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                      <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1 hover:text-gold-700">
                        <Mail className="h-3.5 w-3.5" /> {q.email}
                      </a>
                      <a href={`tel:${q.phone}`} className="inline-flex items-center gap-1 hover:text-gold-700">
                        <Phone className="h-3.5 w-3.5" /> {q.phone}
                      </a>
                    </div>
                  </div>
                  <span className="rounded-full border border-ink-200 bg-cream-100 px-3 py-1 text-[11px] uppercase tracking-widest text-ink-600">
                    {q.eventType}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Meta icon={Calendar} label="Event date" value={formatDate(q.eventDate)} />
                  <Meta icon={Users} label="Guests" value={q.guestCount ?? '—'} />
                  <Meta icon={Wallet} label="Budget" value={q.budget || '—'} />
                  <Meta icon={Clock} label="Received" value={formatDate(q.createdAt)} />
                </div>

                {q.message && (
                  <p className="mt-3 line-clamp-2 text-sm text-ink-500">{q.message}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-ink-400">Status</span>
                    <select
                      value={q.status}
                      disabled={busyId === q._id}
                      onChange={(e) => changeStatus(q._id, e.target.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium capitalize outline-none',
                        statusStyle[q.status]
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(q)}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs text-ink-600 transition hover:border-gold-400 hover:text-gold-700"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(q._id)}
                      disabled={busyId === q._id}
                      aria-label="Delete inquiry"
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-luxe sm:rounded-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-2xl text-ink-900">{selected.name}</h3>
                <span className="mt-1 inline-block rounded-full border border-ink-200 bg-cream-100 px-3 py-0.5 text-[11px] uppercase tracking-widest text-ink-600">
                  {selected.eventType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="rounded-full p-2 text-ink-400 hover:bg-cream-100 hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Meta icon={Mail} label="Email" value={<a href={`mailto:${selected.email}`} className="hover:text-gold-700">{selected.email}</a>} />
              <Meta icon={Phone} label="Phone" value={<a href={`tel:${selected.phone}`} className="hover:text-gold-700">{selected.phone}</a>} />
              <Meta icon={Calendar} label="Event date" value={formatDate(selected.eventDate)} />
              <Meta icon={Users} label="Guests" value={selected.guestCount ?? '—'} />
              <Meta icon={Wallet} label="Budget" value={selected.budget || '—'} />
              <Meta icon={Clock} label="Received" value={formatDateTime(selected.createdAt)} />
            </div>

            {selected.message && (
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-widest text-ink-400">Message</div>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-cream-100/70 p-4 text-sm leading-relaxed text-ink-700">
                  {selected.message}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-ink-400">Status</span>
                <select
                  value={selected.status}
                  disabled={busyId === selected._id}
                  onChange={(e) => changeStatus(selected._id, e.target.value)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium capitalize outline-none',
                    statusStyle[selected.status]
                  )}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => remove(selected._id)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
