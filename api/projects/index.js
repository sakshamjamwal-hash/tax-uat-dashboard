// /api/projects — list (GET, public) and create (POST, admin)
import { readJson, writeJson, checkAdmin, parseBody, slug } from '../_store.js'

const INDEX = 'projects/index.json'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const idx = await readJson(INDEX, { projects: [] })
    return res.status(200).json(idx)
  }

  if (req.method === 'POST') {
    const body = parseBody(req.body)
    if (!checkAdmin(body.password)) return res.status(401).json({ error: 'Unauthorized' })
    const { title, data } = body
    if (!title || !data || !Array.isArray(data.tabs)) {
      return res.status(400).json({ error: 'title and data{meta,tabs} required' })
    }
    const id = `${slug(title)}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()
    await writeJson(`projects/${id}/data.json`, data)
    await writeJson(`projects/${id}/edits.json`, { edits: {}, deletedRows: {}, addedRows: {}, updatedAt: now })

    const idx = await readJson(INDEX, { projects: [] })
    const stats = (data.meta && data.meta.stats) || {}
    idx.projects.unshift({
      id,
      title,
      createdAt: now,
      updatedAt: now,
      tabCount: data.tabs.length,
      gapCount: stats.total || 0,
      stats,
    })
    await writeJson(INDEX, idx)
    return res.status(200).json({ id })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
