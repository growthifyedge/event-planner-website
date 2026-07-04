import { eventTypes } from '@/data/eventTypes';
import { resolveCategoryImage } from '@/lib/media-store';
import { optimizedImage } from '@/lib/cloudinary-url';

/**
 * Returns the eventTypes list with each category's image resolved in priority:
 *   1. the image manually pinned to that homepage slot (Admin > Portfolio)
 *   2. the newest published image in that category
 *   3. the bundled static asset (unchanged design fallback)
 *
 * Server-only (reads the database). Design is unchanged — only the image `src`
 * is swapped; every other field is preserved.
 */
export async function getEventTypesWithMedia() {
  return Promise.all(
    eventTypes.map(async (e) => {
      let url = null;
      try {
        // `slug` (weddings, corporate, …) doubles as the placement slot key.
        url = await resolveCategoryImage({ placement: e.slug, category: e.category });
      } catch (err) {
        // Never let a media failure break the page — fall back to the static image.
        console.error('[home] failed to resolve category image:', e.slug, err);
      }
      return { ...e, image: url ? optimizedImage(url, 1200) : e.image };
    })
  );
}
