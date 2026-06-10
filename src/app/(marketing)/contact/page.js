import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import Icon from '@/components/ui/Icon';
import ContactForm from '@/components/forms/ContactForm';
import { site } from '@/data/site';

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch with Lumière Events. Call, email or send us a message — our atelier responds within one business day.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's begin a conversation"
        description="Have a date in mind, or simply exploring ideas? We'd love to hear from you."
        image="/images/private-party.jpg"
        imageLabel="Get in Touch"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="eyebrow">Reach us</span>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ink-900 sm:text-5xl">
              We&apos;d love to hear from you
            </h2>
            <p className="mt-5 leading-relaxed text-ink-500">
              Whether your celebration is a year away or just a spark of an idea, our team is
              here to help. Reach out and we&apos;ll respond within one business day.
            </p>

            <ul className="mt-8 space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-gold-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="text-ink-700">
                  <span className="block text-[11px] uppercase tracking-widest text-ink-400">Studio</span>
                  {site.address.line1}
                  <br />
                  {site.address.line2}
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-gold-600">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="text-ink-700">
                  <span className="block text-[11px] uppercase tracking-widest text-ink-400">Call</span>
                  <a href={site.phoneHref} className="hover:text-gold-700">{site.phone}</a>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-gold-600">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="text-ink-700">
                  <span className="block text-[11px] uppercase tracking-widest text-ink-400">Email</span>
                  <a href={site.emailHref} className="hover:text-gold-700">{site.email}</a>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-gold-600">
                  <Clock className="h-5 w-5" />
                </span>
                <span className="text-ink-700">
                  <span className="block text-[11px] uppercase tracking-widest text-ink-400">Hours</span>
                  {site.hours}
                </span>
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              {site.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-700"
                >
                  <Icon name={s.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-ink-200/60 bg-cream-100/50 p-6">
              <p className="text-sm text-ink-600">
                Planning a specific event? Our booking form helps us prepare for a richer first
                conversation.
              </p>
              <Link href="/booking" className="btn-ink mt-4">
                Start an event inquiry <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="relative rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card sm:p-8">
              <h3 className="font-display text-2xl text-ink-900">Send us a message</h3>
              <p className="mt-1 text-sm text-ink-500">We&apos;ll get back to you shortly.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
