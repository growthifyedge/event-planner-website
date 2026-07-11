import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import DailyMealsHero from '@/components/daily-meals/DailyMealsHero';
import OperationalHighlights from '@/components/daily-meals/OperationalHighlights';
import ServiceCategories from '@/components/daily-meals/ServiceCategories';
import WeeklyMenuSection from '@/components/daily-meals/WeeklyMenuSection';
import PackagesSection from '@/components/daily-meals/PackagesSection';
import HowItWorks from '@/components/daily-meals/HowItWorks';
import CorporateCTA from '@/components/daily-meals/CorporateCTA';
import DailyFAQ from '@/components/daily-meals/DailyFAQ';
import FinalCTA from '@/components/daily-meals/FinalCTA';
import { getActivePublishedMenu } from '@/lib/weekly-menu-store';
import { getPublishedMealPackages } from '@/lib/meal-packages-store';
import { getMealSettingsOrDefaults } from '@/lib/meal-settings-store';
import { classifyActiveMenu } from '@/lib/daily-menu-view';
import { buildDailyFaqs, dailyBrand } from '@/data/daily-meals';
import { MENU_DAYS, FESTIGO_DAILY_DEFAULTS } from '@/data/meal-constants';
import { site } from '@/data/site';

// Read fresh each request so a newly published menu/packages appear immediately
// (mirrors the existing DB-backed pages).
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'Festigo Daily — Office Lunches & Balanced Meal Plans, Karachi',
  description:
    'Festigo Daily delivers freshly prepared office lunches, balanced meal plans and corporate meal service across Karachi. SFA licensed · Monday to Saturday. Order on WhatsApp.',
  keywords: [
    'office lunch delivery Karachi',
    'balanced meal plans Karachi',
    'corporate meal service Karachi',
    'office meal plans',
    'Festigo Daily',
  ],
  alternates: { canonical: '/daily-meals' },
  openGraph: {
    type: 'website',
    url: '/daily-meals',
    title: 'Festigo Daily — Office Lunches & Balanced Meal Plans, Karachi',
    description:
      'Freshly prepared office lunches, balanced meal plans and corporate meal service across Karachi. SFA licensed · Monday to Saturday.',
  },
};

// Settings fallback used only if the settings read throws (e.g. prod DB down);
// keeps the page accurate without hiding the logged infrastructure error.
const FALLBACK_SETTINGS = {
  serviceName: FESTIGO_DAILY_DEFAULTS.serviceName,
  serviceArea: FESTIGO_DAILY_DEFAULTS.serviceArea,
  operatingDays: [...FESTIGO_DAILY_DEFAULTS.operatingDays],
  sundayClosed: FESTIGO_DAILY_DEFAULTS.sundayClosed,
  operatingHours: { ...FESTIGO_DAILY_DEFAULTS.operatingHours },
  maximumDailyCapacity: FESTIGO_DAILY_DEFAULTS.maximumDailyCapacity,
  sfaLicensed: FESTIGO_DAILY_DEFAULTS.sfaLicensed,
  orderingCutoff: null,
};

// Fetch each dataset independently so one failure never crashes the page.
async function safe(promise, fallback, label) {
  try {
    return await promise;
  } catch (err) {
    console.error(`[daily-meals] ${label} load failed:`, err);
    return fallback;
  }
}

function buildJsonLd(settings) {
  const opens = settings?.operatingHours?.opening || FESTIGO_DAILY_DEFAULTS.operatingHours.opening;
  const closes = settings?.operatingHours?.closing || FESTIGO_DAILY_DEFAULTS.operatingHours.closing;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: dailyBrand.name,
    serviceType: 'Office lunch and meal plan delivery',
    description: metadata.description,
    url: `${site.url}/daily-meals`,
    areaServed: { '@type': 'City', name: settings?.serviceArea || 'Karachi' },
    provider: { '@type': 'Organization', name: site.legalName, url: site.url },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: MENU_DAYS,
      opens,
      closes,
    },
  };
}

export default async function DailyMealsPage() {
  const now = new Date();

  const [menuRaw, packagesRes, settingsRaw] = await Promise.all([
    safe(getActivePublishedMenu(), null, 'weekly menu'),
    safe(getPublishedMealPackages({ page: 1, pageSize: 12 }), { items: [] }, 'packages'),
    safe(getMealSettingsOrDefaults(), FALLBACK_SETTINGS, 'settings'),
  ]);

  const settings = settingsRaw || FALLBACK_SETTINGS;

  // Safe public labeling: only present a menu that covers today ("This Week’s
  // Menu") or a future one ("Upcoming Weekly Menu"). A stale/past menu is never
  // shown as current — the section falls back to its empty state.
  const { state, label } = classifyActiveMenu(menuRaw, now);
  const menu = state === 'current' || state === 'upcoming' ? menuRaw : null;

  const packages = Array.isArray(packagesRes?.items) ? packagesRes.items : [];
  const faqs = buildDailyFaqs(settings);
  const jsonLd = buildJsonLd(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <DailyMealsHero settings={settings} />
      <OperationalHighlights settings={settings} />
      <ServiceCategories />
      <WeeklyMenuSection menu={menu} label={label} />
      <PackagesSection packages={packages} />
      <HowItWorks />
      <CorporateCTA />

      <Section>
        <SectionHeading
          eyebrow="Good to know"
          title="Frequently asked questions"
          description="Everything you need to know about Festigo Daily. Have another question? Message us on WhatsApp."
        />
        <div className="mt-12">
          <DailyFAQ items={faqs} />
        </div>
      </Section>

      <FinalCTA settings={settings} />
    </>
  );
}
