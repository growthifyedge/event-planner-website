import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import { services } from '@/data/services';

export default function ServicesGrid({ limit }) {
  const items = limit ? services.slice(0, limit) : services;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s, i) => (
        <Reveal key={s.title} delay={(i % 4) * 0.06} className="h-full">
          <div className="group relative h-full overflow-hidden rounded-2xl border border-ink-200/60 bg-white p-7 shadow-card transition-all duration-500 ease-luxe hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-luxe">
            {/* animated gold accent on hover */}
            <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gold-gradient transition-transform duration-500 ease-luxe group-hover:scale-x-100" />
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-900 text-gold-400 transition-all duration-500 ease-luxe group-hover:scale-110 group-hover:bg-gold-gradient group-hover:text-ink-900">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-xl text-ink-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
