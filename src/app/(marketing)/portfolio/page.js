import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import CTASection from '@/components/sections/CTASection';

export const metadata = {
  title: 'Portfolio',
  description:
    'Explore a gallery of luxury weddings, corporate galas, milestone birthdays and private celebrations designed and produced by Festigo.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="A gallery of unforgettable moments"
        description="A curated selection of the celebrations we've had the privilege to bring to life."
        image="/images/portfolio-reception.jpg"
        imageLabel="Selected Work"
      />

      <Section>
        <PortfolioGallery />
      </Section>

      <CTASection />
    </>
  );
}
