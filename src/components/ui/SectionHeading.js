import Reveal from './Reveal';
import { cn } from '@/lib/utils';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  light = false,
  className,
}) {
  return (
    <div
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {eyebrow && (
        <Reveal>
          <span className={cn('eyebrow', light && 'text-gold-300 before:bg-gold-300')}>
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2
          className={cn(
            'mt-5 font-display text-4xl leading-tight text-balance sm:text-5xl',
            light ? 'text-cream-50' : 'text-ink-900'
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              'mt-5 text-base leading-relaxed text-pretty sm:text-lg',
              light ? 'text-cream-200/70' : 'text-ink-500'
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
      {align === 'center' && (
        <Reveal delay={0.18}>
          <div className="mx-auto mt-7 rule-gold" />
        </Reveal>
      )}
    </div>
  );
}
