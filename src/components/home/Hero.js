import Link from 'next/link';
import { ArrowRight, Star, Check, Clock } from 'lucide-react';
import Photo from '@/components/ui/Photo';
import Reveal from '@/components/ui/Reveal';
import Container from '@/components/ui/Container';
import { cta, conversion } from '@/data/site';

export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-950 text-cream-50">
      <Photo
        src="/images/hero.jpg"
        label="Luxury Weddings & Events"
        priority
        className="absolute inset-0 h-full w-full"
        imgClassName="animate-ken-burns scale-105 object-[center_42%]"
      />
      {/* Cinematic, layered depth (lightened to let image warmth & atmosphere show) */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/65 via-ink-950/25 to-ink-950/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/66 via-ink-950/14 to-transparent" />
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_30%,transparent_40%,rgba(10,8,11,0.58)_100%)]" />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="hairline absolute inset-x-0 bottom-0 h-px" />

      <Container className="relative z-10 pt-24">
        <div className="max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/5 px-4 py-1.5 text-[11px] uppercase tracking-luxe text-gold-300 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" /> Rated 5.0 by 500+ clients
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-5xl leading-[1.04] text-balance [text-shadow:0_2px_30px_rgba(0,0,0,0.6)] sm:text-6xl lg:text-7xl">
              Extraordinary events,
              <br />
              <span className="text-gold-gradient [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.5))]">
                exquisitely
              </span>{' '}
              curated
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-200/85 text-pretty">
              Lumière is a luxury event atelier designing weddings, galas and private
              celebrations that feel effortless, deeply personal and impossibly beautiful.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={cta.href} className="btn-gold">
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="btn-outline-light">
                View Our Work
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-cream-200/75">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-gold-400" /> {conversion.consultation}
              </span>
              <span className="hidden text-cream-200/30 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gold-400" /> {conversion.response}
              </span>
            </p>
          </Reveal>
        </div>
      </Container>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block">
        <div className="flex flex-col items-center gap-2 text-cream-200/60">
          <span className="text-[10px] uppercase tracking-luxe">Scroll</span>
          <span className="h-12 w-px animate-pulse bg-gradient-to-b from-gold-400 to-transparent" />
        </div>
      </div>
    </section>
  );
}
