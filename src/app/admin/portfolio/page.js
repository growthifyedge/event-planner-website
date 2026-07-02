import PortfolioManager from '@/components/admin/PortfolioManager';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Portfolio Manager',
  robots: { index: false, follow: false },
};

export default function AdminPortfolioPage() {
  return <PortfolioManager />;
}
