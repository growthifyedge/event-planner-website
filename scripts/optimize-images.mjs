/**
 * Optimize the downloaded source images into web-ready JPEGs (in place).
 *   npm run optimize:images
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'images');
const wide = new Set(['hero.jpg', 'cta.jpg']); // full-bleed images get more width

const files = (await fs.readdir(dir)).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
let before = 0;
let after = 0;

for (const f of files) {
  const p = path.join(dir, f);
  const buf = await fs.readFile(p);
  const width = wide.has(f) ? 1920 : 1200;
  const out = await sharp(buf)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  await fs.writeFile(p, out);
  before += buf.length;
  after += out.length;
  console.log(`  ${f.padEnd(30)} ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`);
}

console.log(
  `\n✓ Optimized ${files.length} images: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`
);
