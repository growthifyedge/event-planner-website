import { MapPin, CalendarDays, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Photo from '@/components/ui/Photo';
import { dailyBrand, dailyWhatsAppHref, formatTime } from '@/data/daily-meals';

/**
 * Festigo Daily hero. Server component (composes the client Photo/Reveal).
 * Uses the site's premium black-and-gold treatment; the food image degrades
 * gracefully to an elegant branded placeholder when no photo file exists.
 */
export default function DailyMealsHero({ settings }) {
  const opening = formatTime(settings?.operatingHours?.opening) || '7:00 AM';
  const closing = formatTime(settings?.operatingHours?.closing) || '7:00 PM';
  const area = settings?.serviceArea || 'Karachi';

  const badges = [
    { icon: MapPin, label: `${area} only` },
    { icon: CalendarDays, label: 'Monday – Saturday' },
    { icon: Clock, label: `${opening} – ${closing}` },
  ];

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-ink-900 pb-20 pt-36 text-cream-50 sm:min-h-[76vh]">
      <Photo
        src="/images/daily/hero.jpg"
        alt="Freshly prepared office lunches by Festigo Daily"
        label="Festigo Daily"
        priority
        className="absolute inset-0 h-full w-full"
        imgClassName="animate-ken-burns"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/78 via-ink-950/60 to-ink-950/92" />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <Reveal>
            <span className="eyebrow text-gold-300 before:bg-gold-300">
              {dailyBrand.name} · {dailyBrand.parent}
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
              {dailyBrand.subtitle}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream-200/80 text-pretty">
              {dailyBrand.heroMessage}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {badges.map(({ icon: BadgeIcon, label }) => (
                <li key={label} className="inline-flex items-center gap-2 text-sm text-cream-200/85">
                  <BadgeIcon className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={dailyWhatsAppHref()}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
              </a>
              <a href="#weekly-menu" className="btn-outline-light">
                View this week’s menu <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
