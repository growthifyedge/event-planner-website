import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Photo from '@/components/ui/Photo';
import Icon from '@/components/ui/Icon';
import StatStrip from '@/components/sections/StatStrip';
import CTASection from '@/components/sections/CTASection';
import { aboutStory, values, team } from '@/data/about';

export const metadata = {
  title: 'About',
  description:
    'Meet Lumière — a luxury event planning atelier devoted to designing weddings, galas and private celebrations with impeccable detail and refined elegance.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Lumière"
        title="Devoted to the art of celebration"
        description="A boutique atelier of designers and producers, crafting events that feel deeply personal and impossibly refined."
        image="/images/about.jpg"
        imageLabel="Our Atelier"
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Photo src="/images/about.jpg" label="The Atelier" className="aspect-[4/5] w-full rounded-2xl" />
          </Reveal>
          <div>
            <span className="eyebrow">{aboutStory.eyebrow}</span>
            <h2 className="mt-5 font-display text-4xl leading-tight text-balance text-ink-900 sm:text-5xl">
              {aboutStory.title}
            </h2>
            {aboutStory.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className="mt-5 leading-relaxed text-ink-500">{p}</p>
              </Reveal>
            ))}
            <p className="mt-6 font-display text-lg italic text-gold-700">— {aboutStory.signature}</p>
          </div>
        </div>
      </Section>

      <Section dark className="!py-16">
        <StatStrip dark />
      </Section>

      <Section className="bg-cream-100/40">
        <SectionHeading
          eyebrow="What sets us apart"
          title="Our values"
          description="The principles that guide every decision, every detail and every celebration we touch."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-ink-200/60 bg-white p-8 shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-ink-900">
                  <Icon name={v.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl text-ink-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{v.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The people"
          title="Meet the atelier"
          description="A small, senior team — so the people you meet are the people who craft your day."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.08}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-ink-200/60 bg-white p-8 text-center shadow-card">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-900 font-display text-2xl text-gold-300">
                  {m.initials}
                </span>
                <h3 className="mt-5 font-display text-xl text-ink-900">{m.name}</h3>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-gold-600">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CTASection />
    </>
  );
}
