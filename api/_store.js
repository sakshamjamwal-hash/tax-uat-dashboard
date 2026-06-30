// Shared project store — Blob-backed (with a local-tmp fallback for `vercel dev`
// without a token). Files prefixed with "_" are NOT routed by Vercel.
import { put, list, del } from '@vercel/blob'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pabothegreat'
const HAS_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN
const ROOT = join(tmpdir(), 'uat-projects')

export function checkAdmin(pw) {
  return pw === ADMIN_PASSWORD
}

// Vercel parses JSON bodies for us, but be defensive about strings.
export function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch { return {} }
  }
  return body
}

export async function readJson(key, fallback) {
  if (HAS_BLOB) {
    try {
      const { blobs } = await list({ prefix: key })
      const b = blobs.find(x => x.pathname === key)
      if (!b) return fallback
      const r = await fetch(`${b.url}?t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return fallback
      return await r.json()
    } catch {
      return fallback
    }
  }
  try {
    return JSON.parse(await readFile(join(ROOT, key), 'utf8'))
  } catch {
    return fallback
  }
}

export async function writeJson(key, obj) {
  const payload = JSON.stringify(obj)
  if (HAS_BLOB) {
    await put(key, payload, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    })
    return
  }
  const p = join(ROOT, key)
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, payload, 'utf8')
}

export async function putImage(key, bytes, contentType) {
  if (HAS_BLOB) {
    const res = await put(key, bytes, {
      access: 'public',
      contentType: contentType || 'image/png',
      addRandomSuffix: true,
    })
    return res.url
  }
  const p = join(ROOT, key)
  await mkdir(dirname(p), { recursive: true })
  await writeFile(p, bytes)
  return '/' + key
}

export async function delPrefix(prefix) {
  if (HAS_BLOB) {
    const { blobs } = await list({ prefix })
    if (blobs.length) await del(blobs.map(b => b.url))
    return
  }
  try { await rm(join(ROOT, prefix), { recursive: true, force: true }) } catch {}
}

export function slug(s) {
  return String(s || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project'
}
