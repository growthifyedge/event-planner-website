import Container from './Container';
import Reveal from './Reveal';
import Photo from './Photo';
import { cn } from '@/lib/utils';

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageLabel,
  align = 'center',
}) {
  return (
    <section className="relative flex min-h-[58vh] items-center overflow-hidden bg-ink-900 pb-16 pt-32 text-cream-50 sm:min-h-[62vh]">
      <Photo
        src={image}
        label={imageLabel}
        priority
        className="absolute inset-0 h-full w-full"
        imgClassName="animate-ken-burns"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/55 to-ink-950/90" />
      <Container className={cn('relative z-10', align === 'center' && 'text-center')}>
        <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
          {eyebrow && (
            <Reveal>
              <span className="eyebrow text-gold-300 before:bg-gold-300">{eyebrow}</span>
            </Reveal>
          )}
          <Reveal delay={0.06}>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          {description && (
            <Reveal delay={0.12}>
              <p
                className={cn(
                  'mt-5 text-lg leading-relaxed text-cream-200/75 text-pretty',
                  align === 'center' && 'mx-auto max-w-2xl'
                )}
              >
                {description}
              </p>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
