'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-cream-50/15 bg-ink-950/50 px-4 py-3 text-cream-50 outline-none transition placeholder:text-cream-200/30 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Invalid credentials.');
        setLoading(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-[11px] uppercase tracking-widest text-cream-200/60">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-[11px] uppercase tracking-widest text-cream-200/60">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-gold w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          <>
            Sign In <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
