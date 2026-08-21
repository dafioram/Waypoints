# Waypoints

A GitHub Pages site that's a loose, growing collection of standalone HTML
pages — trip notes, small tools, one-off maps, whatever's worth keeping.
The home page (`index.html`) lists every page automatically. No registry
file to hand-maintain, no build tooling beyond one small script.

## Adding a new page

1. Copy `pages/_template/` to `pages/your-page-name/`.
2. Edit `pages/your-page-name/index.html`: fill in the `<title>`, the
   content, and — the only required part — the `page-meta` script block
   near the top of `<head>`:

   ```html
   <script type="application/json" id="page-meta">
   {
     "title": "Your Page Title",
     "description": "One or two sentences about what this is.",
     "tags": ["tag-one", "tag-two"],
     "date": "2026-08-20"
   }
   </script>
   ```

3. Commit and push to `main`. That's it — the page shows up on the home
   page automatically once the deploy finishes (usually well under a
   minute; check the **Actions** tab on GitHub for progress).

The page itself can be anything: plain text, a calculator, a canvas
sketch, a map that loads a library from a CDN. Nothing outside that one
file needs to change. Put any images or extra assets the page needs
inside its own folder (e.g. `pages/your-page-name/photo.jpg`) so pages
never collide with each other.

## How the auto-listing works

Every page embeds its own metadata in a `page-meta` JSON block. On every
push to `main`, a GitHub Action runs `scripts/build-manifest.mjs`, which:

1. Walks every folder under `pages/` (skipping ones starting with `_`,
   like `pages/_template/`).
2. Reads each `index.html`, pulls out the `page-meta` block.
3. Writes the collected list to `manifest.json` at the repo root.

The home page (`index.html` + `assets/site.js`) fetches `manifest.json`
at load time and renders it as the searchable card grid, with tag chips
built from whatever tags show up across all your pages. There's nothing
to configure when you add a tag — it just appears as a filter once a
page uses it.

`manifest.json` is regenerated fresh on every deploy — it's not something
you maintain by hand, and you don't need to commit it (a version is
checked in only so local preview works before your first push).

## Local preview

`fetch()` can't read local files over the `file://` protocol, so open the
folder with a tiny local server instead of double-clicking `index.html`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

To regenerate `manifest.json` locally after adding a page (optional —
the Action does this on push regardless):

```bash
node scripts/build-manifest.mjs
```

No `npm install` needed; the script only uses Node's built-in `fs`/`path`.

## One-time repo setup

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Build and deployment → Source** to
   **GitHub Actions** (not "Deploy from a branch").
3. Push to `main`. The included workflow
   (`.github/workflows/deploy.yml`) builds the manifest and deploys.

## Structure

```
index.html              home page: hero, search, tag filters, card grid
assets/
  style.css              home page styling
  site.js                 fetches manifest.json, renders + filters cards
  page.css                optional shared "back to index" bar for pages
pages/
  _template/index.html    copy this for every new page
  tip-calculator/         example: a small interactive tool
  gpx-viewer/             example: GPX track over OpenStreetMap (Leaflet)
  ireland-trip/           example: a plain notes/photos page
scripts/
  build-manifest.mjs      generates manifest.json from pages/*/index.html
.github/workflows/
  deploy.yml              regenerates manifest.json + deploys on push
```

## Design notes

- **Folder-per-page**, not one flat HTML file per page, so a page with
  photos, a GPX sample file, or extra JS never collides with another
  page's assets.
- **Metadata lives inside the page**, not in a separate file you have to
  remember to update — one file in, one file touched.
- **No JS framework, no bundler.** Every page is plain HTML/CSS/JS (or
  whatever a `<script src>` from a CDN gives you). The only build step is
  the manifest script, and it has zero dependencies.
