import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { site } from '@/data/site';
import { getMealSettingsOrDefaults } from '@/lib/meal-settings-store';

// Rendered per request so the Festigo Daily nav link reflects the current
// admin visibility settings site-wide (never a build-time snapshot). The
// settings read is a single lightweight singleton lookup and never writes.
export const dynamic = 'force-dynamic';

// Organization / LocalBusiness structured data for richer search results.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.legalName,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phone,
  priceRange: '$$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.line1,
    addressLocality: 'Karachi',
    addressRegion: 'Sindh',
    addressCountry: 'PK',
  },
  areaServed: 'Pakistan',
  foundingDate: String(site.founded),
};

export default async function MarketingLayout({ children }) {
  // Show the Daily Meals nav link only when the public page is enabled AND the
  // owner opted it into navigation. Fail closed (hidden) if settings can't be
  // read. serialize() already gates showInNavigation on publicPageEnabled.
  let showDailyMeals = false;
  try {
    const settings = await getMealSettingsOrDefaults();
    showDailyMeals = settings?.showInNavigation === true;
  } catch {
    showDailyMeals = false;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar showDailyMeals={showDailyMeals} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
