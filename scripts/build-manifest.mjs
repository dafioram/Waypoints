// Scans pages/*/index.html for a <script type="application/json" id="page-meta">
// block and writes the collected entries to manifest.json at the repo root.
// No npm dependencies — safe to run in CI with just `node scripts/build-manifest.mjs`,
// or locally the same way, any time you want to preview changes before pushing.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PAGES_DIR = 'pages';
const META_RE = /<script\b[^>]*\bid=["']page-meta["'][^>]*>([\s\S]*?)<\/script>/i;

function collect() {
  const entries = [];
  let names;
  try {
    names = readdirSync(PAGES_DIR);
  } catch {
    console.warn(`No "${PAGES_DIR}" directory found — writing an empty manifest.`);
    return entries;
  }

  for (const name of names) {
    if (name.startsWith('_') || name.startsWith('.')) continue; // e.g. pages/_template

    const folder = path.join(PAGES_DIR, name);
    if (!statSync(folder).isDirectory()) continue;

    const indexPath = path.join(folder, 'index.html');
    let html;
    try {
      html = readFileSync(indexPath, 'utf8');
    } catch {
      console.warn(`Skipping ${folder}: no index.html found.`);
      continue;
    }

    const match = html.match(META_RE);
    if (!match) {
      console.warn(`Skipping ${folder}: no <script id="page-meta"> block found.`);
      continue;
    }

    let meta;
    try {
      meta = JSON.parse(match[1]);
    } catch (e) {
      console.warn(`Skipping ${folder}: page-meta is not valid JSON (${e.message}).`);
      continue;
    }

    if (!meta.title) {
      console.warn(`Skipping ${folder}: page-meta is missing "title".`);
      continue;
    }

    entries.push({
      title: meta.title,
      description: meta.description || '',
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      date: meta.date || '',
      url: `${PAGES_DIR}/${name}/`
    });
  }

  entries.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return entries;
}

const entries = collect();
writeFileSync('manifest.json', JSON.stringify(entries, null, 2) + '\n');
console.log(`Wrote manifest.json with ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}.`);
