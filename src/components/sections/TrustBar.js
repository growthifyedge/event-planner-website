import Container from '@/components/ui/Container';
import { trustIndicators } from '@/data/site';

export default function TrustBar() {
  return (
    <div className="border-y border-ink-200/50 bg-cream-100/40 py-7">
      <Container>
        <p className="text-center text-[10px] uppercase tracking-luxe text-ink-400">
          Trusted across Pakistan
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {trustIndicators.map((item) => (
            <span
              key={item}
              className="font-display text-base tracking-[0.18em] text-ink-400 transition-colors duration-300 hover:text-gold-700 sm:text-lg"
            >
              {item}
            </span>
          ))}
        </div>
      </Container>
    </div>
  );
}
