import { MessageCircle, HandPlatter } from 'lucide-react';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { corporateAudiences, dailyWhatsAppHref } from '@/data/daily-meals';

/**
 * Corporate call-to-action for offices, teams and organisations, highlighting
 * trial/tasting meals. WhatsApp/contact only — the Phase 3 enquiry form is not
 * built here.
 */
export default function CorporateCTA() {
  return (
    <Section className="bg-cream-100/50">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <span className="eyebrow">For businesses</span>
            <h2 className="mt-5 font-display text-3xl leading-tight text-ink-900 text-balance sm:text-4xl">
              Reliable meals for your whole team
            </h2>
            <p className="mt-5 leading-relaxed text-ink-500">
              Festigo Daily runs recurring meal programs for organisations across Karachi. Not sure
              yet? Request a trial or tasting meal and let your team try the menu first.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {corporateAudiences.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-ink-200/60 bg-white px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider text-ink-600"
                >
                  {a}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={dailyWhatsAppHref('Hello Festigo Daily! I’d like to discuss a corporate meal program for my team.')}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Discuss corporate meals
              </a>
              <a
                href={dailyWhatsAppHref('Hello Festigo Daily! We’d like to arrange a trial/tasting meal for our office.')}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
                <HandPlatter className="h-4 w-4" aria-hidden="true" /> Request a trial meal
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-2xl bg-ink-900 p-10 text-cream-50 shadow-luxe">
            <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_0%,rgba(200,162,74,0.18),transparent_55%)]" />
            <div className="relative">
              <HandPlatter className="h-9 w-9 text-gold-400" aria-hidden="true" />
              <p className="mt-5 font-display text-2xl leading-snug text-balance">
                Trial meals for businesses
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cream-200/75">
                Evaluate the quality, portioning and taste with your team before committing to a
                recurring program — a simple, low-commitment way to get started.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
