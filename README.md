# UAT Dashboard (Vite + React)

A Figma ↔ Build design-QA dashboard. Ships by default with the built-in **Tax Filing**
investigation, but can display the gaps from **any** `ind-uat-web` / `ind-uat-v2` skill run
with one converter command — no hand-editing of data.

## Running

```bash
npm install
npm run dev      # local dev
npm run build    # production build → dist/
npm run preview  # preview the built bundle
```

## Reusing for another project

The dashboard renders **imported mode** whenever `public/uat-data.json` exists, and falls
back to the built-in Tax Filing dashboard when it doesn't.

### 1. Run the UAT skill

Run the skill for the project you want to QA. It writes an output folder, e.g.
`~/Desktop/INDmoney/<LOB>/Outputs/UAT/<date>-ind-uat-web/`:

```
/ind-uat-web <figma_url> <web_url>
```

The folder contains, per compared pair N: `screenshot-figma-pair-N.png`,
(optionally) `screenshot-web-pair-N.png`, and `.gaps-pair-N.json`.

### 2. Import the run into this dashboard

```bash
npm run import-uat -- "<that output folder>" --title "My Project"
```

This:
- reads every `.gaps-pair-*.json` (sorted by pair number),
- copies each pair's screenshots into `public/uat/` (`figma-N.png`, and `live-N.png` when a
  web screenshot exists),
- writes `public/uat-data.json` (tabs + meta + severity stats).

It prints a summary: pairs imported, total gaps, where files were written, and next steps.

`--title` is optional; if omitted, the source folder name is used.

### 3. View / share

```bash
npm run dev                       # view locally
# — or, for a shareable link —
# copy the repo to a new folder, then:
npx vercel --prod
```

> A fresh Vercel deployment should provision its **own Blob store** for the admin-edit
> persistence layer (`api/edits`), same as documented in the project commit history.

### 4. Restore the built-in Tax Filing dashboard

```bash
rm public/uat-data.json
```

(Optionally also `rm -rf public/uat` to drop the imported screenshots.) With no
`uat-data.json` present, the dashboard reverts to the built-in Tax Filing data in
`src/data/gaps.js` — completely unchanged.

## How imported mode works

- `scripts/import-uat.mjs` — the converter (Node ESM, no external deps).
- `src/App.jsx` — on mount fetches `/uat-data.json`; if present and non-empty, uses its
  `tabs` + `meta`; otherwise falls back to the built-in `TABS` and default Tax Filing meta.
- `src/components/PairView.jsx` — renders each imported `pair` tab: a Figma↔Build compare
  with annotation boxes plus a gap table (click a row's `#` to pulse its annotation).
- `Hero`, `StatCards`, `TabNav` take optional `meta` / `tabs` props and keep their built-in
  Tax Filing defaults when none are passed.
