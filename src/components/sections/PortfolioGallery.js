'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Play } from 'lucide-react';
import Photo from '@/components/ui/Photo';
import { staticPortfolioItems, categories } from '@/data/portfolio';
import {
  optimizedImage,
  imageSrcSet,
  videoPoster,
  videoPosterSrcSet,
} from '@/lib/cloudinary-url';
import { cn } from '@/lib/utils';

const aspectFor = (span) =>
  span === 'tall' ? 'aspect-[3/4]' : span === 'wide' ? 'aspect-[3/2]' : 'aspect-square';

// Elegant dark/gold backdrop behind contained (uploaded) media — matches Photo's.
const CONTAIN_BG =
  'radial-gradient(120% 90% at 50% 12%, rgba(200,162,74,0.16), transparent 55%), linear-gradient(180deg, #1a171c 0%, #0d0b0f 100%)';

const CARD_SIZES = '(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw';

// Presentational gallery: renders exactly the `items` it is given (grid + lightbox).
// The server decides database-vs-fallback; this has no fallback of its own.
// `items` defaults to the curated set only when omitted (e.g. the home preview).
export default function PortfolioGallery({
  items = staticPortfolioItems,
  preview = false,
  showFilters = true,
}) {
  const [active, setActive] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtersOn = !preview && showFilters;
  const list = preview
    ? items.slice(0, 6)
    : !filtersOn || active === 'All'
      ? items
      : items.filter((p) => p.category === active);

  const few = list.length > 0 && list.length <= 2;

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

  const cardInner = (p) => {
    const contain = p.fit === 'contain';
    const frame = contain ? 'aspect-[4/5]' : aspectFor(p.span);
    const mediaClass = cn(
      frame,
      'w-full transition-transform duration-700 ease-luxe group-hover:scale-105'
    );
    return (
      <div className="relative">
        {p.type === 'video' ? (
          <>
            {/* Lightweight poster only — the video file loads in the lightbox. */}
            <Photo
              src={videoPoster(p.src, 900)}
              srcSet={videoPosterSrcSet(p.src)}
              sizes={CARD_SIZES}
              label={p.category}
              fit={contain ? 'contain' : 'cover'}
              className={mediaClass}
            />
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950/50 text-cream-50 backdrop-blur-sm">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </span>
          </>
        ) : (
          <Photo
            src={optimizedImage(p.src, 900)}
            srcSet={imageSrcSet(p.src)}
            sizes={CARD_SIZES}
            label={p.category}
            fit={contain ? 'contain' : 'cover'}
            className={mediaClass}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="text-[10px] uppercase tracking-luxe text-gold-300">{p.category}</span>
          <h3 className="mt-1 font-display text-xl text-cream-50">{p.title}</h3>
          {(p.location || p.year) && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-cream-200/70">
              <MapPin className="h-3 w-3" />
              {[p.location, p.year].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderCard = (p, i) => (
    <motion.button
      layout
      key={p.id}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: (i % 3) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setSelected(p)}
      className={cn(
        'group block overflow-hidden rounded-2xl text-left',
        few ? 'w-full sm:w-[22rem]' : 'mb-6 w-full break-inside-avoid'
      )}
    >
      {cardInner(p)}
    </motion.button>
  );

  return (
    <div>
      {filtersOn && (
        <div className="mb-7 flex flex-wrap justify-center gap-2 sm:gap-3">
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

      {list.length === 0 ? (
        <p className="mx-auto max-w-md rounded-2xl border border-dashed border-ink-200 bg-white/40 py-16 text-center text-sm text-ink-400">
          No items in this category yet.
        </p>
      ) : (
        <div
          className={cn(
            few
              ? 'mx-auto flex max-w-3xl flex-wrap justify-center gap-6'
              : 'columns-1 gap-6 sm:columns-2 lg:columns-3'
          )}
        >
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => renderCard(p, i))}
          </AnimatePresence>
        </div>
      )}

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
              {selected.type === 'video' ? (
                <video
                  src={selected.src}
                  poster={videoPoster(selected.src, 1200)}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full rounded-2xl bg-black"
                />
              ) : (
                <Photo
                  src={optimizedImage(selected.src, 1600)}
                  srcSet={imageSrcSet(selected.src, [768, 1200, 1600])}
                  sizes="(min-width: 1024px) 56rem, 92vw"
                  label={selected.category}
                  priority
                  className="aspect-[3/2] w-full overflow-hidden rounded-2xl"
                />
              )}
              <div className="mt-5 text-center">
                <span className="text-[11px] uppercase tracking-luxe text-gold-300">
                  {selected.category}
                </span>
                <h3 className="mt-1 font-display text-3xl text-cream-50">{selected.title}</h3>
                {(selected.location || selected.year) && (
                  <p className="mt-1 text-sm text-cream-200/70">
                    {[selected.location, selected.year].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
