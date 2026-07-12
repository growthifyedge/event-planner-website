'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { navLinks, cta, site } from '@/data/site';
import { cn } from '@/lib/utils';

// Public Festigo Daily link — only rendered when admin visibility settings
// enable it (see MarketingLayout). Defined here so the label/href stay in one
// place for both the desktop and mobile menus.
const DAILY_MEALS_LINK = { label: 'Daily Meals', href: '/daily-meals' };

export default function Navbar({ showDailyMeals = false }) {
  const pathname = usePathname();

  // Insert Daily Meals just before the trailing Contact link so the existing
  // ordering is preserved. When disabled, the centralized navLinks are used
  // unchanged — no layout or design change.
  const links = showDailyMeals
    ? [...navLinks.slice(0, -1), DAILY_MEALS_LINK, navLinks[navLinks.length - 1]]
    : navLinks;

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (!open) {
        if (y > 200 && y > last + 4) setHidden(true);
        else if (y < last - 4) setHidden(false);
      }
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe',
        solid
          ? 'bg-cream-50/90 py-3 shadow-[0_1px_24px_-12px_rgba(18,16,19,0.35)] backdrop-blur-md'
          : 'bg-transparent py-5',
        hidden && !open ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="container-luxe flex items-center justify-between gap-6">
        <Logo light={!solid} />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'group relative text-[12.5px] uppercase tracking-widest transition-colors duration-300',
                  solid
                    ? 'text-ink-600 hover:text-gold-700'
                    : 'text-cream-50/80 hover:text-gold-300',
                  active && (solid ? 'text-gold-700' : 'text-gold-300')
                )}
              >
                {l.label}
                <span
                  className={cn(
                    'absolute -bottom-1.5 left-0 h-px transition-all duration-300 ease-luxe',
                    solid ? 'bg-gold-600' : 'bg-gold-300',
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link href={cta.href} className={solid ? 'btn-gold' : 'btn-outline-light'}>
            {cta.label}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          className={cn(
            'inline-flex items-center justify-center rounded-full p-2 transition-colors lg:hidden',
            solid ? 'text-ink-900' : 'text-cream-50'
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={cn(
          'overflow-hidden transition-[max-height] duration-500 ease-luxe lg:hidden',
          open ? 'max-h-[90vh]' : 'max-h-0'
        )}
      >
        <div className="container-luxe pb-8 pt-2">
          <nav className="flex flex-col divide-y divide-ink-200/50">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'py-3.5 font-display text-2xl transition-colors',
                  isActive(l.href) ? 'text-gold-700' : 'text-ink-900'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={cta.href} className="btn-gold mt-6 w-full">
            {cta.label}
          </Link>
          <div className="mt-6 space-y-1 text-sm text-ink-500">
            <a href={site.phoneHref} className="block hover:text-gold-700">
              {site.phone}
            </a>
            <a href={site.emailHref} className="block hover:text-gold-700">
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
