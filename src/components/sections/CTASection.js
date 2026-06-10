import Link from 'next/link';
import { ArrowRight, Check, Clock, ShieldCheck } from 'lucide-react';
import Photo from '@/components/ui/Photo';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import { cta, site, conversion } from '@/data/site';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 text-cream-50 sm:py-28">
      <Photo
        src="/images/cta.jpg"
        label="Let's Create Together"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-ink-950/82" />
      <div className="absolute inset-0 [background:radial-gradient(110%_80%_at_50%_50%,transparent_45%,rgba(10,8,11,0.7)_100%)]" />
      <Container className="relative z-10 text-center">
        <Reveal>
          <span className="eyebrow text-gold-300 before:bg-gold-300">Begin the journey</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
            Let&apos;s create something unforgettable together
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-200/80">
            Tell us about your vision and we&apos;ll craft a bespoke proposal — the first
            conversation is always complimentary.
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={cta.href} className="btn-gold">
              {cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={site.whatsappHref} target="_blank" rel="noreferrer" className="btn-outline-light">
              Quick WhatsApp Inquiry
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-cream-200/65">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-gold-400" /> {conversion.consultation}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold-400" /> {conversion.response}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-gold-400" /> {conversion.reassurance}
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
