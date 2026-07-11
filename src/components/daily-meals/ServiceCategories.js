import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import DailyIcon from './daily-icons';
import { serviceCategories } from '@/data/daily-meals';

/**
 * The four approved service categories — concise, credible copy. Presentation
 * only; this is not an ordering system.
 */
export default function ServiceCategories() {
  return (
    <Section>
      <SectionHeading
        eyebrow="What we offer"
        title="Meals built around your workday"
        description="From everyday office lunches to balanced plans and corporate programs — choose the level of service your team needs."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {serviceCategories.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.06}>
            <article className="card-luxe flex h-full flex-col p-7 hover:-translate-y-1 hover:shadow-luxe">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-ink-900">
                <DailyIcon name={c.icon} className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink-900">{c.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{c.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
