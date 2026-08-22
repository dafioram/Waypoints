# Agent instructions — Waypoints page conversion

Your job: take a draft someone hands you (raw HTML, a Word doc, plain text,
markdown, notes, anything) and turn it into a page that fits this project.
Read this whole file before you start — the checklist at the end is what
"done" means here, not just "it renders."

## What this project is

A static site (GitHub Pages) that's a collection of independent pages —
trip notes, small tools, reference guides. Each page is a self-contained
folder. A GitHub Action scans every page's embedded metadata and builds
the home page's search/filter index automatically. You are only ever
producing **one page folder** — never touch `manifest.json` (generated,
gitignored) or any other page.

## The contract (non-negotiable)

- File lives at `pages/<slug>/index.html`. One level under `pages/`, no
  deeper.
- `<slug>` is lowercase, hyphenated, no spaces or punctuation
  (`"Myst (PC)"` → `myst-pc`, `"Q3 Budget Notes"` → `q3-budget-notes`).
- Every path inside the file is **relative** — never starts with `/`.
  Links back to the home page are `../../index.html`. Shared assets are
  `../../assets/...`. This matters because the site may be served from a
  subpath, not domain root.
- Any image, audio, video, or downloadable file the draft references goes
  in `pages/<slug>/media/<filename>`, referenced from the page as
  `media/<filename>`. Never reach into another page's folder.
- The page must carry the metadata block below in `<head>`, exactly.

## Metadata block (required)

```html
<script type="application/json" id="page-meta">
{
  "title": "Human-readable title",
  "description": "One or two sentences, shown on the home page card.",
  "tags": ["lowercase", "kebab-case"],
  "date": "YYYY-MM-DD"
}
</script>
```

- `id="page-meta"` must be present; attribute order otherwise doesn't
  matter.
- Must be valid JSON — no trailing commas, no comments inside it. Invalid
  JSON makes the build script silently drop the whole page.
- `tags`: 2–4, lowercase, hyphenated if multi-word. Reuse a tag if the
  concept already exists elsewhere in the repo rather than coining a
  near-duplicate (`"travel"` not `"Travel"` / `"trip"`).
- `date`: ISO format. Use today's date unless the draft states one or the
  person tells you one — don't guess a specific past date.

## Conversion steps

1. Read the whole draft before writing anything.
2. Work out `title`, `description`, `tags`, `date` from step above. Don't
   invent facts that aren't in the draft or given to you — if the
   description isn't obvious, summarize what's actually there.
3. Pick the slug from the title.
4. Convert the content to clean, semantic HTML5, wrapped in the skeleton
   below:
   - Markdown → the equivalent HTML tags (headings, lists, tables,
     `<code>`, etc.)
   - Word doc / plain text → same, inferring structure from formatting or
     paragraph breaks
   - Existing HTML → keep the content and meaning; you may fix broken
     markup, obvious typos, and heading hierarchy (h1 = page title, h2 =
     major sections, h3 = subsections). Don't remove or alter substantive
     content while cleaning it up.
5. Rewrite every asset reference to `media/<original-filename>` (keep the
   original filename). **If you don't actually have the file's bytes**
   (e.g. you were only given text describing an image, or an HTML draft
   that references an image you weren't given), keep the reference but do
   not invent placeholder content — list it at the end of your response
   under "needs media," so the person knows what to add.
6. Include `../../assets/page.css` in `<head>` for the shared "back to
   index" bar, unless told otherwise. Reference `pages/ireland-trip/`,
   `pages/tip-calculator/`, or `pages/gpx-viewer/` if you want a visual
   style to match — otherwise the page can look however it wants.
7. Run the self-check below before you say you're finished.

## Self-check (all must be true)

- [ ] File is at `pages/<slug>/index.html`, slug is lowercase-hyphenated
- [ ] `page-meta` block is present, parses as valid JSON, has all four
      fields
- [ ] `tags` are lowercase
- [ ] `date` is `YYYY-MM-DD`
- [ ] No path anywhere in the file starts with `/`
- [ ] `<meta name="viewport" ...>` is present
- [ ] Every media reference points at `media/<filename>` relative to this
      page's own folder
- [ ] You have NOT modified `manifest.json`, `index.html` at the repo
      root, or any file under another page's folder

## Output format

When done, give back:
1. The full contents of `pages/<slug>/index.html`.
2. A "needs media" list of any files the page expects but you weren't
   given the bytes for (empty if none).

Nothing else needs to change — the home page picks the new page up
automatically on the next push.

## Minimal working skeleton (reference)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Page Title — Waypoints</title>
<link rel="stylesheet" href="../../assets/page.css" />
<script type="application/json" id="page-meta">
{
  "title": "Page Title",
  "description": "One or two sentences describing what this page is and why it exists.",
  "tags": ["tag-one", "tag-two"],
  "date": "2026-08-20"
}
</script>
</head>
<body>
<a class="kb-topbar" href="../../index.html">← Waypoints</a>
<main style="max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem; font-family: sans-serif;">
  <h1>Page Title</h1>
  <p>Content goes here.</p>
</main>
</body>
</html>
```
