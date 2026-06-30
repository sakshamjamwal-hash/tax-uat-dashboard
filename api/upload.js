// /api/upload — upload one image (POST, admin). Body JSON: { password, name, dataBase64, contentType }
// base64 keeps it inside Vercel's JSON body limit per image (screenshots are well under 4.5MB).
import { putImage, checkAdmin, parseBody } from './_store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const body = parseBody(req.body)
  if (!checkAdmin(body.password)) return res.status(401).json({ error: 'Unauthorized' })
  const { name, dataBase64, contentType } = body
  if (!name || !dataBase64) return res.status(400).json({ error: 'name and dataBase64 required' })
  const b64 = dataBase64.replace(/^data:[^;]+;base64,/, '')
  const bytes = Buffer.from(b64, 'base64')
  const safeName = String(name).replace(/[^a-zA-Z0-9._-]/g, '_')
  const url = await putImage(`projects/uploads/${safeName}`, bytes, contentType || 'image/png')
  return res.status(200).json({ url })
}
