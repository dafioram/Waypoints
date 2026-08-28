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

## Math pages (LaTeX / MathJax)

If the draft is LaTeX, or HTML with embedded LaTeX math, it renders via
MathJax loaded from a CDN — same pattern as any other library, but a few
things are specific to math and easy to get subtly wrong:

- **CDN and component**: use jsDelivr (the CDN MathJax's own docs
  recommend) with the `tex-mml-chtml` component —
  `https://cdn.jsdelivr.net/npm/mathjax@4/tex-mml-chtml.js`, loaded with
  `defer`. The `@4` (major-version-only) tag keeps serving the latest 4.x
  release automatically — don't pin an exact patch version unless the
  page needs to render identically forever.
- **Enable dollar-sign delimiters explicitly.** MathJax only recognizes
  `\(...\)` and `\[...\]` by default, not `$...$` — bare dollar signs show
  up too often in ordinary prose to be a safe default. If the draft uses
  single- or double-dollar math (most LaTeX does), add an inline config
  script *before* the MathJax script tag:
  ```html
  <script>
    window.MathJax = { tex: { inlineMath: { '[+]': [['$', '$']] } } };
  </script>
  ```
  Skipping this doesn't error — the math just sits there as unrendered
  plain text, easy to miss on a quick look.
- **If the draft has an existing MathJax config — often MathJax v2's
  `MathJax.Hub.Config({...})` — translate it feature-by-feature into the
  v4 config object. Don't reuse it verbatim.** The v2 API doesn't exist in
  v3/v4; a leftover `Hub.Config` block loaded alongside a v4 script is
  silently ignored, not an error. Common translations:
  - `tex2jax: { inlineMath: [...] }` → `tex: { inlineMath: {...} }` (see
    above)
  - `TeX: { equationNumbers: { autoNumber: "AMS" } }` → `tex: { tags:
    'ams' }` — but this only numbers equations inside `equation`/`align`
    environments, not bare `\[ \]` displaymath. If the draft only uses
    `\[ \]` (common in older personal notes), this setting won't visibly
    do anything either before or after conversion — that's expected, not
    a bug worth chasing.
  - A `src="file://..."` or other local/absolute path to an old MathJax
    install is dead on arrival — always replace with the CDN link above.
- **LaTeX commands used outside math delimiters are not processed by
  MathJax at all** — they're just literal text sitting in the HTML.
  `\cite{...}`, `\label{...}`, `\ref{...}`, `\section{...}`, `\emph{...}`,
  etc., in plain prose (not inside `$...$` or `\[...\]`) render as inert
  backslash-and-braces text — not an error, not a citation, just visible
  leftover syntax. Convert these by hand:
  - `\cite[p. N]{key}` → a plain parenthetical like `(Author, Year, p.
    N)`, inferring author/year from the citation key if it follows the
    common `lastnameYY` convention (e.g. `hill96` → Hill, 1996). Don't
    invent a full bibliography entry (title, publisher) that isn't in the
    draft — note missing full citations the same way you'd note missing
    media, at the end of your response.
  - `\emph{...}` / `\textbf{...}` in prose → `<em>` / `<strong>`.
- **Escape a bare `<` inside math text** if it's immediately followed by a
  letter — the browser's HTML parser can misread it as the start of a
  tag. `<` followed by whitespace or a digit (`x < 1`) is safe as-is. `>`
  and `&` are lower-risk, but escape them too (`&gt;`, `&amp;`) if unsure.
- **Custom macros don't carry over automatically.** If the draft's LaTeX
  preamble defines shorthand commands, redeclare them in the MathJax
  config (`tex: { macros: {...} }`) or every use renders as a visible
  error token — not ideal, but at least easy to spot and fix, unlike the
  silent failures above.

## Links to pages that haven't been migrated yet

Drafts pulled from an existing personal wiki or note collection often
link to sibling pages (other `.php`/`.html` files, or wiki-style
cross-references) that haven't been converted into this project yet.
Don't drop these links, and don't leave the original file extension or
absolute path — guess the future slug using this project's own slug rule
(strip the extension, convert CamelCase or spaces to kebab-case) and link
to it as a relative sibling path, preserving any anchor fragment:

`MathLinearAlgebraMatrixTypes.php#diagonalizable` →
`../math-linear-algebra-matrix-types/#diagonalizable`

List every such link in your output alongside "needs media," so the
person has a running list of which pages to migrate next before those
links resolve to something real.

## Persisting state in the browser (localStorage)

Only reach for `localStorage` when a page has state genuinely worth
remembering between visits — a checklist, a tracker, a saved setting. A
calculator or a map that starts fresh each time has nothing worth
persisting; don't add storage just because it's available. This is a
judgment call per page, not a default.

When it does apply:

- **Namespace every key with the page's own slug** (`waypoints:<slug>`,
  or `waypoints:<slug>:<thing>` for more than one). `localStorage` is
  shared per-*origin*, not per-page — an unprefixed key like `"items"`
  can silently collide with the same key on a different page on this
  same site.
- **Store one JSON blob per page**, not several scattered top-level keys
  — simpler to reset, simpler to reason about.
- **Wrap every read and write in try/catch and degrade quietly.**
  `localStorage` can throw (private browsing, quota, storage disabled).
  Fall back to an empty/default state rather than letting the page
  error — persistence is a nice-to-have, not something the page should
  depend on to function.
- **Always ship a visible reset/clear action.** State that's invisible
  and un-resettable is a trap — a checklist that silently remembers old
  checks with no way to start over is worse than one with no memory at
  all.
- **Claude.ai's own artifact preview sandbox blocks `localStorage`.** If
  this page is previewed directly in a chat before being pushed
  anywhere, persistence may look broken there even though it works once
  the file is actually part of the deployed site. Don't "fix" this by
  removing storage — say to test after deploying (or via a local
  server), not from an in-chat preview.

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
- [ ] If this page renders math: dollar-sign delimiters are configured
      (unless the draft only used `\(` `\)` / `\[ \]`), and any old v2-style
      MathJax config has been translated, not copy-pasted
- [ ] No LaTeX commands (`\cite`, `\label`, `\ref`, etc.) survive outside
      math delimiters as literal backslash text
- [ ] Any link to another page in this project — existing or not yet
      migrated — uses the slug convention, and not-yet-migrated targets
      are listed in your output
- [ ] If this page uses `localStorage`: the key is namespaced with the
      page's slug, reads/writes are wrapped in try/catch, and there's a
      visible reset/clear action
- [ ] You have NOT modified `manifest.json`, `index.html` at the repo
      root, or any file under another page's folder

## Output format

When done, give back:
1. The full contents of `pages/<slug>/index.html`.
2. A "needs media" list of any files the page expects but you weren't
   given the bytes for (empty if none).
3. A "pending pages" list of any links to sibling pages that don't exist
   in this project yet (empty if none).

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
