#!/usr/bin/env node
// seed-taxfiling.mjs — write the built-in Tax Filing dashboard into the Blob
// project store as the first project ("tax-filing"). Idempotent.
// Reads BLOB_READ_WRITE_TOKEN from .env.local (or the environment).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

// Load token from .env.local if not already in env
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    const env = fs.readFileSync(path.join(repoRoot, '.env.local'), 'utf8')
    const m = env.match(/^BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)
    if (m) process.env.BLOB_READ_WRITE_TOKEN = m[2]
  } catch {}
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('No BLOB_READ_WRITE_TOKEN found (env or .env.local). Run `vercel env pull` first.')
  process.exit(1)
}

const { put, list } = await import('@vercel/blob')
const { TABS } = await import('../src/data/gaps.js')

const ID = 'tax-filing'
const INDEX = 'projects/index.json'
const now = new Date().toISOString()

// meta:null → the app renders the built-in Tax Filing hero/stat styling unchanged
const data = { meta: null, tabs: TABS }
const stats = { total: 172, critical: 11, major: 68, minor: 73 }

async function writeJson(key, obj) {
  await put(key, JSON.stringify(obj), {
    access: 'public', contentType: 'application/json',
    addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0,
  })
}
async function readJson(key, fallback) {
  try {
    const { blobs } = await list({ prefix: key })
    const b = blobs.find(x => x.pathname === key)
    if (!b) return fallback
    const r = await fetch(`${b.url}?t=${Date.now()}`, { cache: 'no-store' })
    return r.ok ? await r.json() : fallback
  } catch { return fallback }
}

await writeJson(`projects/${ID}/data.json`, data)
// preserve any existing edits for tax-filing; else start from the legacy single store; else empty
let edits = await readJson(`projects/${ID}/edits.json`, null)
if (!edits) edits = await readJson('uat-edits.json', null)
if (!edits) edits = { edits: {}, deletedRows: {}, addedRows: {} }
await writeJson(`projects/${ID}/edits.json`, { ...edits, updatedAt: now })

const idx = await readJson(INDEX, { projects: [] })
const existing = idx.projects.find(p => p.id === ID)
const summary = { id: ID, title: 'Tax Filing', createdAt: existing?.createdAt || now, updatedAt: now, tabCount: TABS.length, gapCount: stats.total, stats }
idx.projects = [summary, ...idx.projects.filter(p => p.id !== ID)]
await writeJson(INDEX, idx)

console.log(`✓ Seeded project "${ID}" — ${TABS.length} tabs, ${stats.total} gaps. Index now has ${idx.projects.length} project(s).`)
