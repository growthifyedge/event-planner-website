'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import Photo from '@/components/ui/Photo';
import { portfolio, categories } from '@/data/portfolio';
import { cn } from '@/lib/utils';

const aspectFor = (span) =>
  span === 'tall' ? 'aspect-[3/4]' : span === 'wide' ? 'aspect-[3/2]' : 'aspect-square';

export default function PortfolioGallery({ preview = false }) {
  const [active, setActive] = useState('All');
  const [selected, setSelected] = useState(null);

  const items = preview
    ? portfolio.slice(0, 6)
    : active === 'All'
      ? portfolio
      : portfolio.filter((p) => p.category === active);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <div>
      {!preview && (
        <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={cn(
                'rounded-full border px-5 py-2 text-[11px] uppercase tracking-widest transition-all duration-300',
                active === c
                  ? 'border-gold-500 bg-gold-gradient text-ink-900'
                  : 'border-ink-200 text-ink-500 hover:border-gold-400 hover:text-gold-700'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {items.map((p, i) => (
            <motion.button
              layout
              key={p.title}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.04, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelected(p)}
              className="group mb-6 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
            >
              <div className="relative">
                <Photo
                  src={p.image}
                  label={p.category}
                  className={cn(
                    aspectFor(p.span),
                    'w-full transition-transform duration-700 ease-luxe group-hover:scale-105'
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="text-[10px] uppercase tracking-luxe text-gold-300">
                    {p.category}
                  </span>
                  <h3 className="mt-1 font-display text-xl text-cream-50">{p.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-cream-200/70">
                    <MapPin className="h-3 w-3" /> {p.location} · {p.year}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-cream-50/20 text-cream-50 transition hover:border-gold-400 hover:text-gold-300"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <Photo
                src={selected.image}
                label={selected.category}
                priority
                className="aspect-[3/2] w-full overflow-hidden rounded-2xl"
              />
              <div className="mt-5 text-center">
                <span className="text-[11px] uppercase tracking-luxe text-gold-300">
                  {selected.category}
                </span>
                <h3 className="mt-1 font-display text-3xl text-cream-50">{selected.title}</h3>
                <p className="mt-1 text-sm text-cream-200/70">
                  {selected.location} · {selected.year}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
