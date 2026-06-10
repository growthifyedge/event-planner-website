import LoginForm from '@/components/admin/LoginForm';
import { site } from '@/data/site';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-radial px-4 text-cream-50">
      <div className="bg-noise absolute inset-0 opacity-[0.05]" />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <div className="font-display text-3xl uppercase tracking-[0.22em] text-cream-50">{site.name}</div>
          <div className="mt-1.5 text-[10px] uppercase tracking-luxe text-gold-400">
            Atelier Admin Suite
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-cream-50/10 bg-ink-900/60 p-8 shadow-luxe backdrop-blur">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-cream-200/40">Authorised access only.</p>
      </div>
    </div>
  );
}
