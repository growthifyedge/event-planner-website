import { Quote } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import Stars from '@/components/ui/Stars';
import { testimonials } from '@/data/testimonials';

export default function TestimonialsGrid({ limit }) {
  const items = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => (
        <Reveal key={t.name} delay={(i % 3) * 0.08} className="h-full">
          <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/60 bg-white p-8 shadow-card transition-all duration-500 ease-luxe hover:-translate-y-1.5 hover:shadow-luxe">
            <span className="absolute -right-4 -top-6 font-display text-[120px] leading-none text-gold-100 transition-colors duration-500 group-hover:text-gold-200/80">
              &rdquo;
            </span>
            <div className="relative flex items-center justify-between">
              <Quote className="h-8 w-8 text-gold-400" />
              <Stars count={t.rating} />
            </div>
            <blockquote className="relative mt-5 flex-1 text-[17px] leading-relaxed text-ink-700">
              {t.quote}
            </blockquote>
            <figcaption className="relative mt-7 flex items-center gap-4 border-t border-ink-200/60 pt-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-sm text-gold-300 ring-1 ring-gold-400/40 ring-offset-2 ring-offset-white">
                {t.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')}
              </span>
              <span>
                <span className="block font-display text-base text-ink-900">{t.name}</span>
                <span className="block text-[11px] uppercase tracking-widest text-gold-600">
                  {t.role}
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}
