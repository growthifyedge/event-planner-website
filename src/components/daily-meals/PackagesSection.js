import { Check, MessageCircle } from 'lucide-react';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { dailyWhatsAppHref } from '@/data/daily-meals';

// Show a price only when it is a valid, positive integer intended for public
// display. Never invent or round a price.
function formatPrice(pkg) {
  const price = pkg?.startingPrice;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  const currency = pkg.currency || 'PKR';
  return `From ${currency} ${price.toLocaleString('en-PK')}`;
}

function PackageCard({ pkg }) {
  const price = formatPrice(pkg);
  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions.filter(Boolean) : [];
  const hasMinOrder = typeof pkg.minimumOrder === 'number' && pkg.minimumOrder > 0;
  const cta = pkg.ctaLabel?.trim() || 'Enquire on WhatsApp';

  return (
    <article className="card-luxe flex h-full flex-col p-7">
      <h3 className="font-display text-2xl text-ink-900">{pkg.name}</h3>

      {price && <p className="mt-2 text-sm font-medium uppercase tracking-widest text-gold-700">{price}</p>}

      {pkg.description && <p className="mt-4 text-sm leading-relaxed text-ink-500">{pkg.description}</p>}

      {inclusions.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {inclusions.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 space-y-1 text-xs text-ink-500">
        {pkg.planDuration && (
          <div className="flex gap-1.5">
            <dt className="font-medium text-ink-600">Duration:</dt>
            <dd>{pkg.planDuration}</dd>
          </div>
        )}
        {hasMinOrder && (
          <div className="flex gap-1.5">
            <dt className="font-medium text-ink-600">Minimum order:</dt>
            <dd>
              {pkg.minimumOrder} meal{pkg.minimumOrder > 1 ? 's' : ''}
            </dd>
          </div>
        )}
        {pkg.deliveryInfo && (
          <div className="flex gap-1.5">
            <dt className="font-medium text-ink-600">Delivery:</dt>
            <dd>{pkg.deliveryInfo}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto pt-7">
        <a
          href={dailyWhatsAppHref(`Hello Festigo Daily! I’m interested in the “${pkg.name}” plan.`)}
          target="_blank"
          rel="noreferrer"
          className="btn-outline w-full"
        >
          {cta}
        </a>
      </div>
    </article>
  );
}

/**
 * Published meal packages. Only published records are passed in (filtered by
 * the Phase 1 store). When none exist, shows a graceful "custom plans" prompt
 * rather than an empty grid — no invented prices or package contents.
 */
export default function PackagesSection({ packages = [] }) {
  const items = Array.isArray(packages) ? packages : [];

  return (
    <Section>
      <SectionHeading
        eyebrow="Plans & pricing"
        title="Meal plans for every team"
        description="Simple, transparent options. Prices are shown in PKR where available — get in touch for a plan tailored to your headcount."
      />

      <div className="mt-14">
        {items.length === 0 ? (
          <Reveal>
            <div className="mx-auto max-w-xl rounded-2xl border border-ink-200/50 bg-cream-100/50 p-10 text-center">
              <h3 className="font-display text-2xl text-ink-900">Custom plans on request</h3>
              <p className="mt-3 leading-relaxed text-ink-500">
                We tailor meal plans to your team’s size, schedule and preferences. Message us on
                WhatsApp and we’ll put together the right option for your office.
              </p>
              <a
                href={dailyWhatsAppHref('Hello Festigo Daily! I’d like a custom meal plan for my office.')}
                target="_blank"
                rel="noreferrer"
                className="btn-gold mt-7"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Request a plan
              </a>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((pkg, i) => (
              <Reveal key={pkg._id || pkg.slug || i} delay={(i % 3) * 0.06}>
                <PackageCard pkg={pkg} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
