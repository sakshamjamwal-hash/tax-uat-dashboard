#!/usr/bin/env node
// export-project.mjs — bundle an ind-uat-web / ind-uat-v2 skill output folder
// into ONE portable file (<slug>.uatproj) you drag into the dashboard's
// "New project" panel. Screenshots are inlined as base64 so it's a single file.
//
// Usage: node scripts/export-project.mjs <skill-output-folder> [--title "Project name"]
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const argv = process.argv.slice(2)
let srcFolder = null
let title = null
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--title') title = argv[++i] || null
  else if (a.startsWith('--title=')) title = a.slice('--title='.length)
  else if (!srcFolder) srcFolder = a
}
if (!srcFolder) {
  console.error('Usage: node scripts/export-project.mjs <skill-output-folder> [--title "Project name"]')
  process.exit(1)
}
srcFolder = path.resolve(srcFolder)
if (!fs.existsSync(srcFolder) || !fs.statSync(srcFolder).isDirectory()) {
  console.error(`Error: not a directory: ${srcFolder}`)
  process.exit(1)
}

const gapFiles = fs.readdirSync(srcFolder)
  .filter(f => /^\.gaps-pair-\d+\.json$/.test(f))
  .map(f => ({ f, n: parseInt(f.match(/(\d+)\.json$/)[1], 10) }))
  .sort((a, b) => a.n - b.n)
if (gapFiles.length === 0) {
  console.error(`Error: no .gaps-pair-*.json files found in ${srcFolder}`)
  process.exit(1)
}
const pairs = gapFiles.map(({ f }) => JSON.parse(fs.readFileSync(path.join(srcFolder, f), 'utf8')))

const SEV_TO_CODE = { critical: 'C', major: 'H', minor: 'M', 'needs-verify': '' }
const pad2 = n => String(n).padStart(2, '0')
const shortLabel = l => (l ? (l.split(/\s+[—–-]\s+/)[0].trim() || l.trim()) : '')
const hostOf = u => { try { return new URL(u).host } catch { return u || '' } }
const sval = v => (v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v)))

const images = {}              // name -> base64
function inlineImage(file, outName) {
  const p = path.join(srcFolder, file)
  if (!fs.existsSync(p)) return null
  images[outName] = fs.readFileSync(p).toString('base64')
  return outName
}

const stats = { total: 0, critical: 0, major: 0, minor: 0, needsVerify: 0 }
let latest = ''
const figmaKey = (pairs[0] && pairs[0].figma_node_id) || ''

const tabs = pairs.map((pair) => {
  const n = pair.pair_n
  const sceneLabel = pair.scene_label || `Pair ${n}`
  const short = shortLabel(sceneLabel)
  const figmaImg = pair.screenshot_figma ? inlineImage(pair.screenshot_figma, `figma-${n}.png`) : null
  const liveImg = pair.screenshot_web ? inlineImage(pair.screenshot_web, `live-${n}.png`) : null
  const annOn = liveImg ? 'live' : 'figma'
  if (pair.generated_at && pair.generated_at > latest) latest = pair.generated_at

  const ss = pair.severity_summary || {}
  stats.critical += ss.critical || 0
  stats.major += ss.major || 0
  stats.minor += ss.minor || 0
  stats.needsVerify += ss['needs-verify'] || 0

  const gaps = pair.gaps || []
  stats.total += gaps.length
  const rows = gaps.map((g) => {
    const code = SEV_TO_CODE[g.severity] !== undefined ? SEV_TO_CODE[g.severity] : ''
    const expected = sval(g.expected)
    const actual = sval(g.actual)
    const el = g.element_label || ''
    const row = {
      id: g.gap_id,
      cells: ['', el, expected, actual, code],
      fix: `${g.css_selector ? g.css_selector + ' — ' : ''}${g.notes || ''}`,
      category: g.category || '',
    }
    if (g.severity === 'needs-verify') row.specialPriority = 'Verify'
    if (g.bbox_pct) {
      const b = g.bbox_pct
      row.ann = { on: annOn, x: b.left, y: b.top, w: b.width, h: b.height, element: el, build: actual }
    }
    return row
  })

  const webUrl = pair.web_url || ''
  const vp = pair.viewport != null ? pair.viewport : ''
  return {
    id: `pair-${n}`,
    kind: 'pair',
    label: `${pad2(n)} · ${short}`,
    sectionHeader: { idx: pad2(n), title: sceneLabel },
    compare: {
      desc: `${pair.scene_desc || ''} — ${webUrl} @ ${vp}px`,
      tag: `PAIR ${n}`,
      figma: { node: pair.figma_node_id || '', url: 'figma · source of truth', img: figmaImg, alt: `Figma — ${sceneLabel}` },
      live: { node: `${webUrl} @ ${vp}px`, url: hostOf(webUrl), img: liveImg, alt: `Build — ${sceneLabel}` },
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

const finalTitle = title || path.basename(srcFolder)
const bundle = {
  meta: { title: finalTitle, subtitle: 'Design QA · Figma ↔ Build', figmaKey, generatedAt: latest, stats },
  tabs,
  images, // { "figma-1.png": "<base64>", ... } — tab img refs are these bare names
}

const outSlug = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'project'
const outPath = path.resolve(process.cwd(), `${outSlug}.uatproj`)
fs.writeFileSync(outPath, JSON.stringify(bundle), 'utf8')

const kb = Math.round(fs.statSync(outPath).size / 1024)
console.log('')
console.log('✓ Project bundle created')
console.log('  Pairs   : ' + tabs.length)
console.log('  Gaps    : ' + stats.total + `  (C:${stats.critical}  H:${stats.major}  M:${stats.minor}  Verify:${stats.needsVerify})`)
console.log('  Images  : ' + Object.keys(images).length)
console.log('  File    : ' + outPath + `  (${kb} KB)`)
console.log('')
console.log('Next: open the dashboard → + New project → drop in this .uatproj file.')
console.log('')
