// /api/projects/[id] — get (GET, public), save edits (POST, admin), delete (DELETE, admin)
import { readJson, writeJson, delPrefix, checkAdmin, parseBody } from '../_store.js'

const INDEX = 'projects/index.json'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })
  const base = `projects/${id}`

  if (req.method === 'GET') {
    const data = await readJson(`${base}/data.json`, null)
    if (!data) return res.status(404).json({ error: 'not found' })
    const edits = await readJson(`${base}/edits.json`, { edits: {}, deletedRows: {}, addedRows: {} })
    return res.status(200).json({ data, edits })
  }

  if (req.method === 'POST') {
    const body = parseBody(req.body)
    if (!checkAdmin(body.password)) return res.status(401).json({ error: 'Unauthorized' })
    const now = new Date().toISOString()
    await writeJson(`${base}/edits.json`, {
      edits: body.edits || {},
      deletedRows: body.deletedRows || {},
      addedRows: body.addedRows || {},
      updatedAt: now,
    })
    const idx = await readJson(INDEX, { projects: [] })
    const p = idx.projects.find(x => x.id === id)
    if (p) { p.updatedAt = now; await writeJson(INDEX, idx) }
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const body = parseBody(req.body)
    if (!checkAdmin(body.password)) return res.status(401).json({ error: 'Unauthorized' })
    await delPrefix(`${base}/`)
    const idx = await readJson(INDEX, { projects: [] })
    idx.projects = idx.projects.filter(x => x.id !== id)
    await writeJson(INDEX, idx)
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return res.status(405).json({ error: 'Method not allowed' })
}
