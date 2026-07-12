import WeeklyMenuManager from '@/components/admin/daily/WeeklyMenuManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Weekly Menu · Meal Studio', robots: { index: false, follow: false } };

export default function AdminWeeklyMenuPage() {
  return <WeeklyMenuManager />;
}
