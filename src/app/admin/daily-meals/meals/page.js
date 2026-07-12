import MealsManager from '@/components/admin/daily/MealsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meals · Meal Studio', robots: { index: false, follow: false } };

export default function AdminMealsPage() {
  return <MealsManager />;
}
