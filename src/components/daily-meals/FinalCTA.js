import { MessageCircle, Phone, MapPin, CalendarDays } from 'lucide-react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Photo from '@/components/ui/Photo';
import { site } from '@/data/site';
import { dailyBrand, dailyWhatsAppHref } from '@/data/daily-meals';

/**
 * Closing premium CTA. Contact details come from the centralized site.js (phone
 * via site.phoneHref; WhatsApp number reused via the daily helper).
 */
export default function FinalCTA({ settings }) {
  const area = settings?.serviceArea || 'Karachi';

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-28">
      <Photo
        src="/images/daily/cta.jpg"
        alt="Festigo Daily meal delivery"
        label="Festigo Daily"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-ink-950/85" />
      <div className="absolute inset-0 [background:radial-gradient(110%_80%_at_50%_50%,transparent_45%,rgba(10,8,11,0.7)_100%)]" />

      <Container className="relative z-10 text-center">
        <Reveal>
          <span className="eyebrow text-gold-300 before:bg-gold-300">Get started today</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl">
            Fresh meals for your team, made simple
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-200/80">
            Tell us your headcount and schedule on WhatsApp — we’ll handle the rest, freshly
            prepared and delivered across {area}.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={dailyWhatsAppHref()} target="_blank" rel="noreferrer" className="btn-gold">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
            </a>
            <a href={site.phoneHref} className="btn-outline-light">
              <Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cream-200/65">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold-400" aria-hidden="true" /> {area} only
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold-400" aria-hidden="true" /> Monday – Saturday
            </span>
            <span className="inline-flex items-center gap-1.5">
              {dailyBrand.name} · part of {dailyBrand.parent}
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
