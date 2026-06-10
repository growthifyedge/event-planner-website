import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import { packages } from '@/data/packages';
import { cta } from '@/data/site';
import { cn } from '@/lib/utils';

export default function PackagesGrid() {
  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-3">
      {packages.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.1} className="h-full">
          <div
            className={cn(
              'flex h-full flex-col rounded-2xl border p-8 transition-all duration-500 ease-luxe',
              p.featured
                ? 'border-gold-400/70 bg-ink-900 text-cream-50 shadow-luxe lg:-my-4 lg:py-12'
                : 'border-ink-200/60 bg-white text-ink-900 shadow-card hover:-translate-y-1'
            )}
          >
            {p.featured && (
              <span className="mb-4 inline-flex w-fit rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-ink-900">
                Most loved
              </span>
            )}
            <h3 className="font-display text-2xl">{p.name}</h3>
            <p className={cn('mt-1 text-sm', p.featured ? 'text-cream-200/70' : 'text-ink-500')}>
              {p.tagline}
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span
                className={cn(
                  'text-[11px] uppercase tracking-widest',
                  p.featured ? 'text-gold-300' : 'text-gold-600'
                )}
              >
                from
              </span>
              <span className="font-display text-4xl">{p.priceFrom}</span>
            </div>
            <p
              className={cn(
                'mt-4 text-sm leading-relaxed',
                p.featured ? 'text-cream-200/70' : 'text-ink-500'
              )}
            >
              {p.description}
            </p>
            <ul
              className={cn(
                'mt-6 space-y-3 border-t pt-6 text-sm',
                p.featured ? 'border-cream-50/15' : 'border-ink-200/70'
              )}
            >
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      p.featured ? 'text-gold-300' : 'text-gold-600'
                    )}
                  />
                  <span className={p.featured ? 'text-cream-100/85' : 'text-ink-600'}>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Link href={cta.href} className={cn('w-full', p.featured ? 'btn-gold' : 'btn-outline')}>
                Begin Planning <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
