import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Photo from '@/components/ui/Photo';
import ServicesGrid from '@/components/sections/ServicesGrid';
import ProcessSteps from '@/components/sections/ProcessSteps';
import CTASection from '@/components/sections/CTASection';
import { eventTypes } from '@/data/eventTypes';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Services',
  description:
    'Full-service luxury event planning, design and production for weddings, corporate events, birthdays and private parties.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Everything, exquisitely handled"
        description="From first idea to final farewell — a complete atelier of capabilities, all under one roof."
        image="/images/corporate.jpg"
        imageLabel="Corporate Events"
      />

      <Section>
        <SectionHeading
          eyebrow="Capabilities"
          title="A full suite of services"
          description="Choose full-service planning or the precise support you need — we tailor our role to you."
        />
        <div className="mt-14">
          <ServicesGrid />
        </div>
      </Section>

      <Section className="bg-cream-100/40">
        <SectionHeading
          eyebrow="By occasion"
          title="Celebrations we specialise in"
          description="Every event type carries its own rhythm. Here's how we approach each."
        />
        <div className="mt-16 space-y-20 lg:space-y-28">
          {eventTypes.map((e, i) => (
            <div
              key={e.slug}
              id={e.slug}
              className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal className={cn(i % 2 === 1 && 'lg:order-2')}>
                <Photo src={e.image} label={e.title} className="aspect-[4/3] w-full rounded-2xl" />
              </Reveal>
              <Reveal delay={0.08}>
                <span className="eyebrow">{e.tagline}</span>
                <h3 className="mt-4 font-display text-3xl text-ink-900 sm:text-4xl">{e.title}</h3>
                <p className="mt-4 leading-relaxed text-ink-500">{e.description}</p>
                <ul className="mt-6 space-y-3">
                  {e.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3 text-ink-700">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-gradient" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href="/booking" className="btn-ink mt-8">
                  Plan your {e.title.toLowerCase()} <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </Section>

      <Section dark>
        <SectionHeading
          light
          eyebrow="How we work"
          title="A seamless, four-step journey"
          description="Transparent, calm and entirely enjoyable — the way planning should feel."
        />
        <div className="mt-14">
          <ProcessSteps dark />
        </div>
      </Section>

      <CTASection />
    </>
  );
}
