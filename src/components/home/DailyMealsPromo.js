import Link from 'next/link';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';

// Compact Festigo Daily promo for the homepage. Rendered only when the owner
// has enabled the public page AND opted into the homepage placement (see the
// gate in the marketing home page). Matches the existing black-and-gold dark
// section styling — no redesign, no food-health or medical claims.
export default function DailyMealsPromo() {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-24">
      <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_0%,rgba(198,160,74,0.14)_0%,transparent_60%)]" />
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow inline-flex items-center gap-2 text-gold-300 before:bg-gold-300">
              <UtensilsCrossed className="h-4 w-4" /> Festigo Daily
            </span>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight text-balance sm:text-5xl">
              Office Lunches &amp; Corporate Meal Plans
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mx-auto mt-5 max-w-xl text-lg text-cream-200/80">
              Premium Pakistani office catering for teams across Karachi.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex justify-center">
              <Link href="/daily-meals" className="btn-gold">
                Explore Daily Meals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
