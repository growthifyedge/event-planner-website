import EnquiriesManager from '@/components/admin/daily/EnquiriesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Enquiries · Meal Studio', robots: { index: false, follow: false } };

export default function AdminEnquiriesPage() {
  return <EnquiriesManager />;
}
