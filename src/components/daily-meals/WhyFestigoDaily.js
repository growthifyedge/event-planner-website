import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import DailyIcon from './daily-icons';
import { whyChooseUs } from '@/data/daily-meals';

/**
 * "Why choose Festigo Daily" — the professional business section shown directly
 * above the corporate enquiry form. Reinforces that Festigo Daily is a premium
 * Pakistani corporate catering service operating exclusively in Karachi.
 */
export default function WhyFestigoDaily() {
  return (
    <Section id="why-festigo-daily">
      <SectionHeading
        eyebrow="Why Festigo Daily"
        title="Corporate catering, done properly"
        description="Trusted by teams across Karachi for reliable office lunches and balanced meal plans — freshly prepared, six days a week."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.06}>
            <article className="card-luxe flex h-full flex-col p-7">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-gradient text-ink-900">
                <DailyIcon name={item.icon} className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
