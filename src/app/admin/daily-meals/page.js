import Link from 'next/link';
import {
  UtensilsCrossed,
  Package,
  CalendarDays,
  Inbox,
  Gauge,
  MapPin,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import StudioShell from '@/components/admin/daily/StudioShell';
import { queryMeals } from '@/lib/meals-store';
import { queryMealPackages, getPublishedMealPackages } from '@/lib/meal-packages-store';
import { queryWeeklyMenus, getActivePublishedMenu } from '@/lib/weekly-menu-store';
import { countMealInquiriesByStatus } from '@/lib/meal-inquiries-store';
import { getMealSettingsOrDefaults } from '@/lib/meal-settings-store';
import { classifyActiveMenu, formatWeekRange } from '@/lib/daily-menu-view';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meal Studio', robots: { index: false, follow: false } };

async function safe(promise, fallback, label) {
  try {
    return await promise;
  } catch (err) {
    console.error(`[admin/daily-meals dashboard] ${label} failed:`, err);
    return fallback;
  }
}

function StatCard({ icon: Icon, label, value, hint, href }) {
  const body = (
    <div className="flex h-full flex-col rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm transition hover:border-gold-400">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-gold-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        {href && <ArrowRight className="h-4 w-4 text-ink-300" aria-hidden="true" />}
      </div>
      <div className="mt-4 font-display text-3xl text-ink-900">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest text-ink-400">{label}</div>
      {hint && <div className="mt-1 text-xs text-ink-500">{hint}</div>}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export default async function MealStudioDashboard() {
  const [allMeals, pubMeals, allPkgs, pubPkgs, drafts, activeMenu, enquiryCounts, settings] =
    await Promise.all([
      safe(queryMeals({ page: 1, pageSize: 1 }), { total: 0 }, 'meals total'),
      safe(queryMeals({ publishedOnly: true, page: 1, pageSize: 1 }), { total: 0 }, 'meals published'),
      safe(queryMealPackages({ page: 1, pageSize: 1 }), { total: 0 }, 'packages total'),
      safe(getPublishedMealPackages({ page: 1, pageSize: 1 }), { total: 0 }, 'packages published'),
      safe(queryWeeklyMenus({ status: 'draft', page: 1, pageSize: 1 }), { total: 0 }, 'draft menus'),
      safe(getActivePublishedMenu(), null, 'active menu'),
      safe(countMealInquiriesByStatus(), { total: 0, new: 0 }, 'enquiry counts'),
      safe(getMealSettingsOrDefaults(), null, 'settings'),
    ]);

  const { state, label } = classifyActiveMenu(activeMenu);
  const menuValue =
    state === 'current' ? 'This week' : state === 'upcoming' ? 'Upcoming' : 'None live';
  const menuHint =
    activeMenu && (state === 'current' || state === 'upcoming')
      ? `${label} · ${formatWeekRange(activeMenu.weekStart, activeMenu.weekEnd) || ''}`
      : `${drafts.total} draft${drafts.total === 1 ? '' : 's'} in progress`;

  const capacity = settings?.maximumDailyCapacity ?? 500;
  const karachiOnly = settings?.karachiOnly !== false;
  const sfa = settings?.sfaLicensed !== false;
  const area = settings?.serviceArea || 'Karachi';

  return (
    <StudioShell>
      <div>
        <h1 className="font-display text-3xl text-ink-900 sm:text-4xl">Operations Overview</h1>
        <p className="mt-1 text-sm text-ink-500">
          Festigo Daily — office lunches &amp; balanced meal plans · {area} only · Monday–Saturday.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          icon={UtensilsCrossed}
          label="Meals"
          value={allMeals.total}
          hint={`${pubMeals.total} published`}
          href="/admin/daily-meals/meals"
        />
        <StatCard
          icon={Package}
          label="Packages"
          value={allPkgs.total}
          hint={`${pubPkgs.total} published`}
          href="/admin/daily-meals/packages"
        />
        <StatCard
          icon={CalendarDays}
          label="Weekly menu"
          value={menuValue}
          hint={menuHint}
          href="/admin/daily-meals/weekly-menu"
        />
        <StatCard
          icon={Inbox}
          label="New enquiries"
          value={enquiryCounts.new ?? 0}
          hint={`${enquiryCounts.total ?? 0} total`}
          href="/admin/daily-meals/enquiries"
        />
        <StatCard
          icon={Gauge}
          label="Daily capacity"
          value={capacity}
          hint="combined meals / day"
          href="/admin/daily-meals/settings"
        />
        <StatCard
          icon={karachiOnly ? MapPin : BadgeCheck}
          label="Service"
          value={karachiOnly ? `${area} only` : area}
          hint={sfa ? 'SFA licensed' : 'SFA status: off'}
          href="/admin/daily-meals/settings"
        />
      </div>

      <p className="mt-8 text-xs text-ink-400">
        Figures are read live from the Festigo Daily stores. No analytics or estimates are shown.
      </p>
    </StudioShell>
  );
}
