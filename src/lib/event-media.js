import { eventTypes } from '@/data/eventTypes';
import { getCategoryImageMap } from '@/lib/media-store';
import { optimizedImage } from '@/lib/cloudinary-url';

/**
 * Returns the eventTypes list with each category's image resolved to the NEWEST
 * uploaded image for that category (from the media library), falling back to the
 * bundled static asset when nothing has been uploaded yet.
 *
 * Server-only (reads the database). Design is unchanged — only the image `src`
 * is swapped; every other field is preserved.
 */
export async function getEventTypesWithMedia() {
  let map = {};
  try {
    map = await getCategoryImageMap(eventTypes.map((e) => e.category));
  } catch (err) {
    // Never let a media failure break the page — fall back to static images.
    console.error('[home] failed to resolve category images from media:', err);
  }

  return eventTypes.map((e) => {
    const uploaded = map[e.category] || null;
    return {
      ...e,
      image: uploaded ? optimizedImage(uploaded, 1200) : e.image,
    };
  });
}
