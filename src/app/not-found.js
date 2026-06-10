import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-radial px-6 text-center text-cream-50">
      <div className="font-display text-7xl text-gold-gradient sm:text-8xl">404</div>
      <h1 className="mt-4 font-display text-3xl">This page has slipped away</h1>
      <p className="mt-3 max-w-md text-cream-200/70">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-gold mt-8">
        Return home
      </Link>
    </div>
  );
}
