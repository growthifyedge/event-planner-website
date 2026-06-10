import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Logo({ light = false, className }) {
  return (
    <Link
      href="/"
      aria-label="Lumière — home"
      className={cn('group inline-flex flex-col leading-none', className)}
    >
      <span
        className={cn(
          'font-display text-2xl tracking-[0.22em] transition-colors',
          light ? 'text-cream-50' : 'text-ink-900'
        )}
      >
        LUMIÈRE
      </span>
      <span
        className={cn(
          'mt-1 text-[8.5px] font-medium uppercase tracking-luxe',
          light ? 'text-gold-300' : 'text-gold-600'
        )}
      >
        Events &amp; Experiences
      </span>
    </Link>
  );
}
