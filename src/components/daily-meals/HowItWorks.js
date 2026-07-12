import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import DailyIcon from './daily-icons';
import { howItWorksSteps } from '@/data/daily-meals';

/**
 * Simple, informational four-step customer journey. No checkout, cart, payment,
 * account or ordering infrastructure — this only explains how to get started.
 */
export default function HowItWorks() {
  return (
    <Section dark>
      <SectionHeading
        light
        eyebrow="How it works"
        title="Getting started is simple"
        description="From choosing a plan to receiving fresh meals — four straightforward steps."
      />
      <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {howItWorksSteps.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.06} className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold-400/40 bg-ink-800 text-gold-300">
                  <DailyIcon name={step.icon} className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-display text-2xl text-gold-300/80">{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg text-cream-50">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-200/70">{step.description}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
