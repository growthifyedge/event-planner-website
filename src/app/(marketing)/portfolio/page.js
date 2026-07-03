import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import PortfolioBrowser from '@/components/sections/PortfolioBrowser';
import CTASection from '@/components/sections/CTASection';
import { getPortfolioMedia } from '@/lib/media-store';
import { staticPortfolioItems } from '@/data/portfolio';

// Always render fresh so newly uploaded media appears immediately (no caching).
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Portfolio',
  description:
    'Explore a gallery of luxury weddings, corporate galas, milestone birthdays and private celebrations designed and produced by Festigo.',
  alternates: { canonical: '/portfolio' },
};

const PAGE_SIZE = 12;

export default async function PortfolioPage() {
  // First page only (paginated) — the browser loads more on demand.
  let first = { items: [], total: 0, hasMore: false };
  try {
    first = await getPortfolioMedia({ category: 'All', page: 1, pageSize: PAGE_SIZE });
  } catch (err) {
    console.error('[portfolio] failed to load media from database:', err);
  }

  const hasMedia = first.total > 0;

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="A gallery of unforgettable moments"
        description="A curated selection of the celebrations we've had the privilege to bring to life."
        image="/images/portfolio-reception.jpg"
        imageLabel="Selected Work"
      />

      <Section className="!pt-8 sm:!pt-10 lg:!pt-12">
        {hasMedia ? (
          <PortfolioBrowser
            initialItems={first.items}
            initialHasMore={first.hasMore}
            pageSize={PAGE_SIZE}
          />
        ) : (
          // Fallback: no uploaded media yet → curated static set (unchanged).
          <PortfolioGallery items={staticPortfolioItems} />
        )}
      </Section>

      <CTASection />
    </>
  );
}
