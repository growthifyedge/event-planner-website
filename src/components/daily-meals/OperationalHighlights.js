import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import DailyIcon from './daily-icons';
import { formatTime } from '@/data/daily-meals';

/**
 * Concise, factual trust + operational indicators. Every value is either
 * confirmed business info or read from MealSettings — no fabricated
 * certifications, ratings, customer counts or years of experience.
 */
export default function OperationalHighlights({ settings }) {
  const opening = formatTime(settings?.operatingHours?.opening) || '7:00 AM';
  const closing = formatTime(settings?.operatingHours?.closing) || '7:00 PM';
  const area = settings?.serviceArea || 'Karachi';
  const capacity = settings?.maximumDailyCapacity || 500;

  const items = [
    settings?.sfaLicensed !== false && { icon: 'BadgeCheck', label: 'SFA licensed' },
    { icon: 'MapPin', label: `${area}-only service` },
    { icon: 'CalendarDays', label: 'Monday – Saturday' },
    { icon: 'Clock', label: `${opening} – ${closing}` },
    { icon: 'Soup', label: `Up to ${capacity} meals daily` },
    { icon: 'ChefHat', label: 'Freshly prepared' },
    { icon: 'HandPlatter', label: 'Corporate trials available' },
  ].filter(Boolean);

  return (
    <Section className="border-y border-ink-200/50 bg-cream-100/50 !py-12 sm:!py-14">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-7">
        {items.map((item, i) => (
          <li key={item.label}>
            <Reveal delay={i * 0.04} className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
                <DailyIcon name={item.icon} className="h-5 w-5 text-gold-600" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-ink-600">
                {item.label}
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
