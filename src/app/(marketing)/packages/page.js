import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import PackagesGrid from '@/components/sections/PackagesGrid';
import FAQ from '@/components/sections/FAQ';
import CTASection from '@/components/sections/CTASection';
import { packagesNote } from '@/data/packages';

export const metadata = {
  title: 'Packages & Pricing',
  description:
    'Transparent luxury event planning packages — from month-of coordination to fully bespoke destination productions. Every event is tailored to you.',
  alternates: { canonical: '/packages' },
};

export default function PackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Investment"
        title="Packages crafted around you"
        description="A transparent starting point for every kind of celebration. Your final proposal is always bespoke."
        image="/images/portfolio-venue.jpg"
        imageLabel="The Grand Ballroom"
      />

      <Section>
        <SectionHeading
          eyebrow="Choose your level of support"
          title="Curated planning packages"
          description={packagesNote}
        />
        <div className="mt-16">
          <PackagesGrid />
        </div>
      </Section>

      <Section className="bg-cream-100/40">
        <SectionHeading
          eyebrow="Good to know"
          title="Frequently asked questions"
          description="A few of the questions we hear most often. Have another? Just ask."
        />
        <div className="mt-12">
          <FAQ />
        </div>
      </Section>

      <CTASection />
    </>
  );
}
