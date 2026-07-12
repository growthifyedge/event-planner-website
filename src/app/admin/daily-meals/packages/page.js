import PackagesManager from '@/components/admin/daily/PackagesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Packages · Meal Studio', robots: { index: false, follow: false } };

export default function AdminPackagesPage() {
  return <PackagesManager />;
}
