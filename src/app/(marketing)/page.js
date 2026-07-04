import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Hero from '@/components/home/Hero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Photo from '@/components/ui/Photo';
import StatStrip from '@/components/sections/StatStrip';
import EventTypesGrid from '@/components/sections/EventTypesGrid';
import ServicesGrid from '@/components/sections/ServicesGrid';
import ProcessSteps from '@/components/sections/ProcessSteps';
import PackagesGrid from '@/components/sections/PackagesGrid';
import TestimonialsGrid from '@/components/sections/TestimonialsGrid';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import CTASection from '@/components/sections/CTASection';
import TrustBar from '@/components/sections/TrustBar';
import Stars from '@/components/ui/Stars';
import { socialProof } from '@/data/site';
import { aboutStory } from '@/data/about';
import { packagesNote } from '@/data/packages';

// "What we create" category cards resolve to uploaded media at request time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CenterLink = ({ href, children }) => (
  <Reveal className="mt-12 flex justify-center">
    <Link href={href} className="btn-outline">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  </Reveal>
);

export default function HomePage() {
  return (
    <>
      <Hero />

      <TrustBar />

      <Section className="!py-14">
        <StatStrip />
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What we create"
          title="Celebrations for every chapter"
          description="From the most intimate gatherings to grand productions, we bring the same obsessive care to every occasion."
        />
        <div className="mt-12">
          <EventTypesGrid />
        </div>
      </Section>

      {/* About teaser */}
      <Section dark className="overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Photo
              src="/images/about.jpg"
              label="Our Studio"
              className="aspect-[4/5] w-full rounded-2xl"
            />
          </Reveal>
          <div>
            <Reveal>
              <span className="eyebrow text-gold-300 before:bg-gold-300">{aboutStory.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mt-5 font-display text-4xl leading-tight text-balance sm:text-5xl">
                {aboutStory.title}
              </h2>
            </Reveal>
            {aboutStory.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.12 + i * 0.06}>
                <p className="mt-5 leading-relaxed text-cream-200/75">{p}</p>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="mt-6 font-display text-lg italic text-gold-300">
                — {aboutStory.signature}
              </p>
            </Reveal>
            <Reveal delay={0.36}>
              <Link href="/about" className="btn-outline-light mt-8">
                Our Story <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Our services"
          title="Everything, handled with grace"
          description="A full suite of capabilities under one roof — so your celebration is cohesive, calm and unforgettable."
        />
        <div className="mt-12">
          <ServicesGrid />
        </div>
        <CenterLink href="/services">Explore all services</CenterLink>
      </Section>

      <Section className="bg-cream-100/40">
        <SectionHeading
          eyebrow="Selected work"
          title="A glimpse of our portfolio"
          description="A few of the celebrations we've had the honour to design and produce."
        />
        <div className="mt-12">
          <PortfolioGallery preview />
        </div>
        <CenterLink href="/portfolio">View full portfolio</CenterLink>
      </Section>

      <Section dark>
        <SectionHeading
          light
          eyebrow="How we work"
          title="A seamless journey, start to finish"
          description="Our refined four-step process keeps the experience calm, transparent and entirely enjoyable for you."
        />
        <div className="mt-12">
          <ProcessSteps dark />
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Investment"
          title="Curated planning packages"
          description={packagesNote}
        />
        <div className="mt-12">
          <PackagesGrid />
        </div>
      </Section>

      <Section className="bg-cream-100/40">
        <SectionHeading
          eyebrow="Kind words"
          title="Loved by our clients"
          description="Nothing means more to us than the trust of the families and brands we serve."
        />
        <div className="mt-8 flex items-center justify-center gap-3">
          <Stars count={5} />
          <span className="text-sm text-ink-500">
            <strong className="font-display text-lg text-ink-900">{socialProof.ratingValue}</strong> · {socialProof.ratingCaption}
          </span>
        </div>
        <div className="mt-10">
          <TestimonialsGrid limit={3} />
        </div>
        <CenterLink href="/testimonials">Read more stories</CenterLink>
      </Section>

      <CTASection />
    </>
  );
}
