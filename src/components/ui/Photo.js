'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const GRADIENTS = [
  'linear-gradient(135deg, #1a171c 0%, #2a2230 55%, #43321a 100%)',
  'linear-gradient(135deg, #43321a 0%, #866527 55%, #c8a24a 100%)',
  'linear-gradient(160deg, #252127 0%, #5A1F2B 100%)',
  'linear-gradient(135deg, #14110f 0%, #4a454b 100%)',
  'linear-gradient(135deg, #5A1F2B 0%, #866527 100%)',
  'linear-gradient(150deg, #2a2230 0%, #634a21 60%, #a9842f 100%)',
];

function pickGradient(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

/**
 * Resilient image component.
 * - Always paints an elegant gradient placeholder behind the photo.
 * - If a real file exists at `src`, it fades in over the placeholder.
 * - If `src` is missing or fails to load, the refined placeholder remains.
 *
 * To use real photography later, simply drop files into /public/images
 * matching the paths in /src/data — no code changes required.
 */
export default function Photo({
  src,
  alt = '',
  label,
  seed,
  priority = false,
  className,
  imgClassName,
  overlay = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);
  const gradient = pickGradient(seed || src || alt || label);
  const showPlaceholder = !loaded || failed;

  // Images can finish loading before React attaches the onLoad handler during
  // hydration (very common for cached/local images). Detect that case so the
  // real image is shown instead of being stuck behind the placeholder.
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, [src]);

  return (
    <div
      className={cn('relative isolate overflow-hidden bg-ink-900', className)}
      style={{ backgroundImage: gradient }}
    >
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="font-display text-xl tracking-[0.2em] text-cream-50/90 sm:text-2xl">
            LUMIÈRE
          </span>
          <span className="h-px w-8 bg-gold-400/70" />
          {label && (
            <span className="text-[9px] font-medium uppercase tracking-luxe text-gold-200/80">
              {label}
            </span>
          )}
        </div>
      )}

      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-luxe',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.05]" />
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
      )}
    </div>
  );
}
