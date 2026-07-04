import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Photo from '@/components/ui/Photo';
import Reveal from '@/components/ui/Reveal';
import { getEventTypesWithMedia } from '@/lib/event-media';

export default async function EventTypesGrid() {
  // Category art comes from uploaded media when available (static fallback).
  const eventTypes = await getEventTypesWithMedia();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {eventTypes.map((e, i) => (
        <Reveal key={e.slug} delay={i * 0.08}>
          <Link
            href={`/services#${e.slug}`}
            className="group relative block overflow-hidden rounded-2xl"
          >
            <Photo
              src={e.image}
              label={e.title}
              className="aspect-[4/5] w-full transition-transform duration-700 ease-luxe group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="font-display text-2xl text-cream-50">{e.title}</h3>
              <p className="mt-1 text-sm text-cream-200/70">{e.tagline}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-gold-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Explore <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
