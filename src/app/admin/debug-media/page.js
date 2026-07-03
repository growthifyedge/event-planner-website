import { listMedia } from '@/lib/media-store';

// TEMPORARY DEBUG ROUTE — delete once /portfolio is confirmed working.
// Protected by the existing /admin middleware (same auth as /admin/portfolio).
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Debug Media',
  robots: { index: false, follow: false },
};

export default async function DebugMediaPage() {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);
  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '(local / not on Vercel)';

  let media = [];
  let errorMessage = null;
  try {
    media = await listMedia();
  } catch (err) {
    errorMessage = err?.message || String(err);
  }

  const first5 = (media || []).slice(0, 5);

  const Row = ({ label, value, ok }) => (
    <div className="flex items-center justify-between gap-4 border-b border-ink-200/60 py-2.5">
      <span className="text-[11px] uppercase tracking-widest text-ink-400">{label}</span>
      <span
        className={
          ok === true
            ? 'font-medium text-emerald-600'
            : ok === false
              ? 'font-medium text-red-600'
              : 'font-mono text-sm text-ink-900'
        }
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-red-700">
        Debug only · temporary
      </span>
      <h1 className="mt-4 font-display text-3xl text-ink-900">Media Debug</h1>
      <p className="mt-1 text-sm text-ink-500">
        This page calls the exact <code className="rounded bg-cream-100 px-1">listMedia()</code>{' '}
        used by <code className="rounded bg-cream-100 px-1">/portfolio</code> and{' '}
        <code className="rounded bg-cream-100 px-1">/admin/portfolio</code>. Delete this route after debugging.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm">
        <Row label="Live commit (Vercel)" value={commit} />
        <Row label="MONGODB_URI present" value={hasMongoUri ? 'YES' : 'NO'} ok={hasMongoUri} />
        <Row
          label="Total media count"
          value={media?.length ?? 0}
          ok={(media?.length ?? 0) > 0}
        />
        <Row label="listMedia error" value={errorMessage || 'none'} ok={!errorMessage} />
      </div>

      <h2 className="mt-8 font-display text-xl text-ink-900">First 5 media items</h2>
      {first5.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-ink-200 bg-white px-5 py-8 text-center text-sm text-ink-400">
          listMedia() returned no items. If the count above is 0 while /admin/portfolio shows
          media, the DB read here is not seeing the same data (check MONGODB_URI / connection on
          this deployment).
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {first5.map((m, i) => (
            <li
              key={m._id || i}
              className="rounded-xl border border-ink-200/70 bg-white p-4 text-sm shadow-sm"
            >
              <div className="font-display text-lg text-ink-900">{m.title || '(no title)'}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-gold-600">
                {m.type} · {m.category}
              </div>
              <div className="mt-2 break-all font-mono text-xs text-ink-600">{m.url}</div>
              <div className="mt-1 text-xs text-ink-400">
                created: {m.createdAt || 'n/a'}
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-10 text-center text-xs text-ink-400">
        /admin/debug-media — temporary debug route. Remove before final launch.
      </p>
    </div>
  );
}
