import InquiryDashboard from '@/components/admin/InquiryDashboard';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <InquiryDashboard />;
}
