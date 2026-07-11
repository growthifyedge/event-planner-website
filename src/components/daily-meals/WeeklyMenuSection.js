import { MessageCircle, Leaf } from 'lucide-react';
import Section from '@/components/ui/Section';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { dailyWhatsAppHref } from '@/data/daily-meals';
import {
  orderedMenuDays,
  dayHasMeals,
  formatWeekRange,
  MENU_SLOTS,
} from '@/lib/daily-menu-view';

/** One published meal snapshot within a day. Renders snapshot data only. */
function SlotCard({ label, slot }) {
  const snap = slot?.snapshot;
  if (!snap?.name) return null;

  const composition = [snap.base, snap.side].filter(Boolean).join(' · ');
  const showSpice = snap.spiceLevel && snap.spiceLevel !== 'not-applicable';

  return (
    <div className="rounded-xl border border-ink-200/50 bg-cream-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-700">
          {label}
        </span>
        {snap.category && (
          <span className="text-[10px] uppercase tracking-wider text-ink-400">{snap.category}</span>
        )}
      </div>
      <p className="mt-1.5 font-display text-lg text-ink-900">{snap.name}</p>
      {composition && <p className="mt-1 text-sm text-ink-500">{composition}</p>}

      {snap.vegetarianAlternative && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-600">
          <Leaf className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
          Veg option: {snap.vegetarianAlternative}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {showSpice && (
          <span className="rounded-full bg-ink-900/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-500">
            {snap.spiceLevel}
          </span>
        )}
        {Array.isArray(snap.allergens) && snap.allergens.length > 0 && (
          <span className="text-[11px] text-ink-400">
            Contains: {snap.allergens.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

/** Polished empty state — never fabricates meals; keeps the WhatsApp CTA. */
function EmptyMenu() {
  return (
    <Reveal>
      <div className="mx-auto max-w-xl rounded-2xl border border-ink-200/50 bg-white p-10 text-center shadow-card">
        <h3 className="font-display text-2xl text-ink-900">This week’s menu is on its way</h3>
        <p className="mt-3 leading-relaxed text-ink-500">
          Our latest weekly menu will be published here shortly. In the meantime, message us on
          WhatsApp and we’ll share what’s cooking and help plan meals for your team.
        </p>
        <a
          href={dailyWhatsAppHref('Hello Festigo Daily! Could you share this week’s menu?')}
          target="_blank"
          rel="noreferrer"
          className="btn-gold mt-7"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask about the menu
        </a>
      </div>
    </Reveal>
  );
}

/**
 * Public weekly menu. Server-rendered. Uses published SNAPSHOT data only,
 * Monday–Saturday, and is safely labeled by `label` (Sunday never appears).
 * When `menu` is absent (no current/upcoming published menu), shows the empty
 * state instead of fabricating content.
 */
export default function WeeklyMenuSection({ menu, label }) {
  const range = menu ? formatWeekRange(menu.weekStart, menu.weekEnd) : null;
  const days = menu ? orderedMenuDays(menu) : [];

  return (
    <Section id="weekly-menu" className="scroll-mt-24 bg-cream-100/40">
      <SectionHeading
        eyebrow="Weekly menu"
        title={menu ? label : 'Weekly menu'}
        description={
          menu
            ? range
              ? `Freshly prepared, Monday to Saturday · ${range}`
              : 'Freshly prepared, Monday to Saturday.'
            : 'A fresh menu is published here each week.'
        }
      />

      <div className="mt-14">
        {!menu ? (
          <EmptyMenu />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {days.map(({ day, entry }, i) => {
              const hasMeals = dayHasMeals(entry);
              return (
                <Reveal key={day} delay={(i % 3) * 0.06}>
                  <article className="flex h-full flex-col rounded-2xl border border-ink-200/50 bg-white p-6 shadow-card">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl text-ink-900">{day}</h3>
                      <span className="rule-gold" aria-hidden="true" />
                    </div>

                    {hasMeals ? (
                      <div className="mt-4 space-y-3">
                        {MENU_SLOTS.map(({ key, label: slotLabel }) => (
                          <SlotCard key={key} label={slotLabel} slot={entry[key]} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm italic text-ink-400">Menu to be announced</p>
                    )}

                    {entry?.notes && hasMeals && (
                      <p className="mt-4 text-xs text-ink-400">{entry.notes}</p>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
