import { Phone, Mail, MessageCircle, Check } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import BookingForm from '@/components/forms/BookingForm';
import { site, trustBadges } from '@/data/site';

export const metadata = {
  title: 'Plan Your Event',
  description:
    'Start planning your luxury wedding, corporate event, birthday or private party with Festigo. Share your details for a complimentary, bespoke proposal.',
  alternates: { canonical: '/booking' },
};

const steps = [
  {
    n: '01',
    t: 'Share your vision',
    d: 'Tell us about your event, your dates and what matters most to you.',
  },
  {
    n: '02',
    t: 'We design a proposal',
    d: 'Within one business day we reach out to schedule a complimentary consultation.',
  },
  {
    n: '03',
    t: 'We bring it to life',
    d: 'From design to flawless execution, we handle everything — so you can simply enjoy it.',
  },
];

export default function BookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Plan Your Event"
        title="Tell us about your celebration"
        description="Share a few details and we'll craft a bespoke proposal — the first conversation is always complimentary."
        image="/images/hero.jpg"
        imageLabel="Begin the Journey"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <span className="eyebrow">What happens next</span>
            <h2 className="mt-5 font-display text-3xl leading-tight text-ink-900 sm:text-4xl">
              From first message to your big day
            </h2>
            <p className="mt-4 leading-relaxed text-ink-500">
              Every great celebration begins with a simple conversation. Here&apos;s how the
              journey unfolds once you reach out.
            </p>

            <ul className="mt-6 space-y-2.5">
              {trustBadges.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-ink-600">
                  <Check className="h-4 w-4 shrink-0 text-gold-500" /> {b}
                </li>
              ))}
            </ul>

            <ol className="mt-8 space-y-6">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-5">
                  <span className="font-display text-2xl text-gold-500">{s.n}</span>
                  <div>
                    <h3 className="font-display text-lg text-ink-900">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 rounded-2xl bg-ink-900 p-6 text-cream-50">
              <p className="text-sm text-cream-200/70">Prefer to talk it through?</p>
              <a
                href={site.phoneHref}
                className="mt-2 flex items-center gap-2 font-display text-xl text-gold-300 hover:text-gold-200"
              >
                <Phone className="h-4 w-4" /> {site.phone}
              </a>
              <a
                href={site.emailHref}
                className="mt-2 flex items-center gap-2 text-sm text-cream-200/80 hover:text-gold-200"
              >
                <Mail className="h-4 w-4" /> {site.email}
              </a>
              <a
                href={site.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-2 text-sm text-cream-200/80 hover:text-gold-200"
              >
                <MessageCircle className="h-4 w-4" /> Quick WhatsApp inquiry
              </a>
            </div>
          </div>

          <Reveal delay={0.1} className="lg:col-span-3">
            <BookingForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
