#!/usr/bin/env node
// import-uat.mjs — convert an ind-uat-web / ind-uat-v2 skill output folder into
// the dashboard's runtime data (public/uat-data.json + public/uat/*.png).
//
// Usage: node scripts/import-uat.mjs <skill-output-folder> [--title "Project name"]
//
// No external deps — built-in node modules only.

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

// ── Parse args ─────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
let srcFolder = null
let title = null
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--title') {
    title = argv[++i] || null
  } else if (a.startsWith('--title=')) {
    title = a.slice('--title='.length)
  } else if (!srcFolder) {
    srcFolder = a
  }
}

if (!srcFolder) {
  console.error('Usage: node scripts/import-uat.mjs <skill-output-folder> [--title "Project name"]')
  process.exit(1)
}

srcFolder = path.resolve(srcFolder)
if (!fs.existsSync(srcFolder) || !fs.statSync(srcFolder).isDirectory()) {
  console.error(`Error: not a directory: ${srcFolder}`)
  process.exit(1)
}

// repo root = parent of scripts/
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(repoRoot, 'public')
const uatDir = path.join(publicDir, 'uat')

// ── Read & sort .gaps-pair-*.json ────────────────────────────────────────────
const gapFiles = fs.readdirSync(srcFolder)
  .filter(f => /^\.gaps-pair-\d+\.json$/.test(f))
  .map(f => ({ f, n: parseInt(f.match(/(\d+)\.json$/)[1], 10) }))
  .sort((a, b) => a.n - b.n)

if (gapFiles.length === 0) {
  console.error(`Error: no .gaps-pair-*.json files found in ${srcFolder}`)
  process.exit(1)
}

const pairs = gapFiles.map(({ f }) => {
  const raw = fs.readFileSync(path.join(srcFolder, f), 'utf8')
  return JSON.parse(raw)
})

// ── Prep output dirs ─────────────────────────────────────────────────────────
fs.mkdirSync(uatDir, { recursive: true })

// ── Helpers ──────────────────────────────────────────────────────────────────
const SEV_TO_CODE = { critical: 'C', major: 'H', minor: 'M', 'needs-verify': '' }

function pad2(n) {
  return String(n).padStart(2, '0')
}

function shortLabel(label) {
  if (!label) return ''
  // short scene label: take text before an em/en dash if present, trimmed
  const cut = label.split(/\s+[—–-]\s+/)[0].trim()
  return cut || label.trim()
}

function hostOf(url) {
  if (!url) return ''
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

function stringifyVal(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

// ── Build tabs + collect stats ────────────────────────────────────────────────
const stats = { total: 0, critical: 0, major: 0, minor: 0, needsVerify: 0 }
let latestGeneratedAt = ''
const figmaKey = (pairs[0] && pairs[0].figma_node_id) || ''

const tabs = pairs.map((pair) => {
  const n = pair.pair_n
  const sceneLabel = pair.scene_label || `Pair ${n}`
  const short = shortLabel(sceneLabel)

  // Screenshot copy
  let figmaImg = null
  let liveImg = null

  if (pair.screenshot_figma) {
    const srcPng = path.join(srcFolder, pair.screenshot_figma)
    if (fs.existsSync(srcPng)) {
      fs.copyFileSync(srcPng, path.join(uatDir, `figma-${n}.png`))
      figmaImg = `/uat/figma-${n}.png`
    }
  }
  if (pair.screenshot_web) {
    const srcPng = path.join(srcFolder, pair.screenshot_web)
    if (fs.existsSync(srcPng)) {
      fs.copyFileSync(srcPng, path.join(uatDir, `live-${n}.png`))
      liveImg = `/uat/live-${n}.png`
    }
  }
  const hasLive = liveImg !== null
  const annOn = hasLive ? 'live' : 'figma'

  // generatedAt
  if (pair.generated_at && pair.generated_at > latestGeneratedAt) {
    latestGeneratedAt = pair.generated_at
  }

  // Severity tally
  const ss = pair.severity_summary || {}
  stats.critical += ss.critical || 0
  stats.major += ss.major || 0
  stats.minor += ss.minor || 0
  stats.needsVerify += ss['needs-verify'] || 0

  // Rows
  const gaps = pair.gaps || []
  stats.total += gaps.length

  const rows = gaps.map((g) => {
    const priorityCode = SEV_TO_CODE[g.severity] !== undefined ? SEV_TO_CODE[g.severity] : ''
    const expected = stringifyVal(g.expected)
    const actual = stringifyVal(g.actual)
    const elementLabel = g.element_label || ''
    const fix = `${g.css_selector ? g.css_selector + ' — ' : ''}${g.notes || ''}`

    const row = {
      id: g.gap_id,
      cells: ['', elementLabel, expected, actual, priorityCode],
      fix,
      category: g.category || '',
    }
    if (g.severity === 'needs-verify') {
      row.specialPriority = 'Verify'
    }
    if (g.bbox_pct) {
      const b = g.bbox_pct
      row.ann = {
        on: annOn,
        x: b.left,
        y: b.top,
        w: b.width,
        h: b.height,
        element: elementLabel,
        build: actual,
      }
    }
    return row
  })

  const webUrl = pair.web_url || ''
  const viewport = pair.viewport != null ? pair.viewport : ''

  return {
    id: `pair-${n}`,
    kind: 'pair',
    label: `${pad2(n)} · ${short}`,
    sectionHeader: { idx: pad2(n), title: sceneLabel },
    compare: {
      desc: `${pair.scene_desc || ''} — ${webUrl} @ ${viewport}px`,
      tag: `PAIR ${n}`,
      figma: {
        node: pair.figma_node_id || '',
        url: 'figma · source of truth',
        img: figmaImg,
        alt: `Figma — ${sceneLabel}`,
      },
      live: {
        node: `${webUrl} @ ${viewport}px`,
        url: hostOf(webUrl),
        img: liveImg,
        alt: `Build — ${sceneLabel}`,
      },
    },
    block: {
      id: `pair-${n}-gaps`,
      header: `Gaps — ${sceneLabel}`,
      count: `${gaps.length} gaps`,
      columns: ['#', 'Element', 'Figma (expected)', 'Build (actual)', 'Priority'],
      rows,
    },
  }
})

const meta = {
  title: title || path.basename(srcFolder),
  subtitle: 'Design QA · Figma ↔ Build',
  figmaKey,
  generatedAt: latestGeneratedAt,
  stats,
}

const out = { meta, tabs }

// ── Write ─────────────────────────────────────────────────────────────────────
const outPath = path.join(publicDir, 'uat-data.json')
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')

// ── Summary ─────────────────────────────────────────────────────────────────
const copiedFigma = tabs.filter(t => t.compare.figma.img).length
const copiedLive = tabs.filter(t => t.compare.live.img).length

console.log('')
console.log('✓ UAT import complete')
console.log('  Source folder : ' + srcFolder)
console.log('  Pairs imported: ' + tabs.length)
console.log('  Total gaps    : ' + stats.total +
  `  (C:${stats.critical}  H:${stats.major}  M:${stats.minor}  Verify:${stats.needsVerify})`)
console.log('  Screenshots   : ' + copiedFigma + ' figma, ' + copiedLive + ' live → ' + path.relative(repoRoot, uatDir) + '/')
console.log('  Data file     : ' + path.relative(repoRoot, outPath))
console.log('  Title         : ' + meta.title)
console.log('')
console.log('Next:')
console.log('  • npm run dev          — view this run locally')
console.log('  • or copy the repo to a new folder and `npx vercel --prod` for a shareable link')
console.log('  • to restore the built-in Tax Filing dashboard: delete public/uat-data.json')
console.log('')
