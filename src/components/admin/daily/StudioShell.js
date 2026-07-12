'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  CalendarDays,
  Inbox,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin/daily-meals', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/daily-meals/meals', label: 'Meals', icon: UtensilsCrossed },
  { href: '/admin/daily-meals/packages', label: 'Packages', icon: Package },
  { href: '/admin/daily-meals/weekly-menu', label: 'Weekly Menu', icon: CalendarDays },
  { href: '/admin/daily-meals/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/daily-meals/settings', label: 'Settings', icon: Settings },
];

/**
 * Shared shell for the Festigo Daily Meal Studio: a premium black-and-gold top
 * bar + section nav + sign out. Reuses the existing admin logout endpoint and
 * session — it does not introduce any new auth.
 */
export default function StudioShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-cream-50/10 bg-ink-950 text-cream-50">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-xl uppercase tracking-[0.22em]">Festigo Daily</span>
              <span className="hidden text-[10px] uppercase tracking-luxe text-gold-400 sm:inline">
                Meal Studio
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] uppercase tracking-widest text-cream-200/60 transition hover:text-gold-300"
                title="Back to Event Planner admin"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Event Admin</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 px-4 py-2 text-[11px] uppercase tracking-widest transition hover:border-gold-400 hover:text-gold-300"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[11px] uppercase tracking-widest transition',
                    active
                      ? 'bg-gold-gradient text-ink-900'
                      : 'text-cream-200/70 hover:bg-cream-50/10 hover:text-gold-300'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
