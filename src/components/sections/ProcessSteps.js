import Reveal from '@/components/ui/Reveal';
import { process } from '@/data/services';
import { cn } from '@/lib/utils';

export default function ProcessSteps({ dark = false }) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {process.map((p, i) => (
        <Reveal key={p.step} delay={i * 0.1}>
          <div className="relative">
            <div
              className={cn(
                'font-display text-6xl leading-none',
                dark ? 'text-cream-50/15' : 'text-ink-900/10'
              )}
            >
              {p.step}
            </div>
            <h3
              className={cn(
                'mt-4 font-display text-xl',
                dark ? 'text-cream-50' : 'text-ink-900'
              )}
            >
              {p.title}
            </h3>
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed',
                dark ? 'text-cream-200/65' : 'text-ink-500'
              )}
            >
              {p.description}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
