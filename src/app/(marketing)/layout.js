import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { site } from '@/data/site';

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

export default function MarketingLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
