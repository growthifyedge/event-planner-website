import Reveal from '@/components/ui/Reveal';
import { stats } from '@/data/stats';
import { cn } from '@/lib/utils';

export default function StatStrip({ dark = false }) {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="text-center">
          <div
            className={cn(
              'font-display text-4xl sm:text-5xl',
              dark ? 'text-gold-300' : 'text-gold-600'
            )}
          >
            {s.value}
          </div>
          <div
            className={cn(
              'mt-2 text-[11px] uppercase tracking-widest',
              dark ? 'text-cream-200/60' : 'text-ink-400'
            )}
          >
            {s.label}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
