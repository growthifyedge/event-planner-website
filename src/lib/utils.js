import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** "June 14, 2026" */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/** "Jun 14, 2026 · 3:42 PM" */
export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

/** Build an absolute URL from the configured site origin. */
export function absoluteUrl(path = '') {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
