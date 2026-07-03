// Cloudinary delivery-URL helpers. All functions no-op for non-Cloudinary URLs
// (e.g. the curated /images/*.jpg fallback), so they're safe to call anywhere.

const isCld = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/');

function withTransform(url, transform) {
  if (!isCld(url)) return url;
  // Avoid double-inserting if a transform is already present right after /upload/.
  return url.replace('/upload/', `/upload/${transform}/`);
}

/** Optimized, width-capped image (auto format + quality). */
export function optimizedImage(url, width = 800) {
  return withTransform(url, `f_auto,q_auto,c_limit,w_${width}`);
}

/** Responsive srcset string, or undefined for non-Cloudinary URLs. */
export function imageSrcSet(url, widths = [480, 768, 1080, 1440]) {
  if (!isCld(url)) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(', ');
}

/**
 * Poster frame for a video (first frame, delivered as an optimized image), so
 * the gallery shows a lightweight thumbnail instead of loading the video file.
 */
export function videoPoster(url, width = 800) {
  if (!isCld(url)) return url;
  const jpg = url.replace(/\.(mp4|mov|webm|avi|mkv|m4v|ogv)(\?.*)?$/i, '.jpg');
  return withTransform(jpg, `so_0,f_auto,q_auto,c_limit,w_${width}`);
}

export function videoPosterSrcSet(url, widths = [480, 768, 1080]) {
  if (!isCld(url)) return undefined;
  return widths.map((w) => `${videoPoster(url, w)} ${w}w`).join(', ');
}
