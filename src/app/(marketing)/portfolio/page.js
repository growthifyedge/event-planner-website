import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import PortfolioGallery from '@/components/sections/PortfolioGallery';
import CTASection from '@/components/sections/CTASection';
import { listMedia } from '@/lib/media-store';
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

// Uploaded media (Cloudinary + MongoDB) normalized to the gallery item shape.
// Returns [] on empty/error.
async function getDbItems() {
  try {
    const media = await listMedia();
    console.log(`[portfolio] listMedia returned ${media?.length ?? 0} item(s)`);
    if (media && media.length) {
      return media.map((m) => ({
        id: m._id,
        title: m.title,
        category: m.category,
        type: m.type,
        src: m.url,
        span: 'normal',
        // Uploaded media is any aspect ratio → show the full image (contain).
        fit: 'contain',
      }));
    }
  } catch (err) {
    console.error('[portfolio] failed to load media from database:', err);
  }
  return [];
}

export default async function PortfolioPage() {
  const dbItems = await getDbItems();

  // The SERVER decides the final list: uploaded media when present, otherwise
  // the curated fallback. The gallery renders exactly this list — it has no
  // fallback of its own, so DB items can never be replaced by the static set.
  const items = dbItems.length > 0 ? dbItems : staticPortfolioItems;
  console.log(
    `[portfolio] rendering ${items.length} item(s) from ${dbItems.length > 0 ? 'DATABASE' : 'fallback'}`
  );

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
        <PortfolioGallery items={items} />
      </Section>

      <CTASection />
    </>
  );
}
