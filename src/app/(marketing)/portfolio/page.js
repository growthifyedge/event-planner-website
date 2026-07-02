import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import CTASection from '@/components/sections/CTASection';
import { listMedia } from '@/lib/media-store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Portfolio',
  description:
    'Explore a gallery of luxury weddings, corporate galas, milestone birthdays and private celebrations designed and produced by Festigo.',
  alternates: { canonical: '/portfolio' },
};

// Admin-managed media (from the Portfolio Manager). Returns null when empty so
// the gallery falls back to its built-in curated set.
async function getPortfolioItems() {
  try {
    const media = await listMedia();
    if (media && media.length) {
      return media.map((m) => ({
        id: m._id,
        title: m.title,
        category: m.category,
        type: m.type,
        src: m.url,
        span: 'normal',
      }));
    }
  } catch {
    // ignore — fall through to the curated fallback
  }
  return null;
}

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

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
        <PortfolioGallery items={items || undefined} />
      </Section>

      <CTASection />
    </>
  );
}
