import SettingsManager from '@/components/admin/daily/SettingsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings · Meal Studio', robots: { index: false, follow: false } };

export default function AdminSettingsPage() {
  return <SettingsManager />;
}
