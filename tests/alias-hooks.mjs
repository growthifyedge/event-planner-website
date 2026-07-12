// Node ESM resolve hook so tests can load the app's source modules, which use
// the Next/webpack `@/` alias and extensionless imports.
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function addExtension(absPath) {
  try {
    if (existsSync(absPath) && statSync(absPath).isFile()) return absPath;
  } catch {
    /* fall through */
  }
  for (const ext of ['.js', '.mjs', '.cjs', '.json']) {
    if (existsSync(absPath + ext)) return absPath + ext;
  }
  for (const idx of ['index.js', 'index.mjs']) {
    const p = path.join(absPath, idx);
    if (existsSync(p)) return p;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = addExtension(path.join(ROOT, 'src', specifier.slice(2)));
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    const abs = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    const resolved = addExtension(abs);
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
