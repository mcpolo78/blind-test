import { sql, ensureTable, noDb } from '../_lib/db.js'
import { checkAdmin } from '../_lib/admin.js'

// GET /api/admin/scores : tous les scores (100 derniers)
// DELETE /api/admin/scores?id=123 : supprime un score
// Protégé par l'en-tête x-admin-password.
export default async function handler(req, res) {
  if (!checkAdmin(req, res)) return
  if (!sql) return noDb(res)
  await ensureTable()

  if (req.method === 'GET') {
    const rows = await sql`SELECT id, pseudo, score, created_at FROM scores ORDER BY created_at DESC LIMIT 100`
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(rows)
  }
  if (req.method === 'DELETE') {
    const id = Number(req.query.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id invalide' })
    await sql`DELETE FROM scores WHERE id = ${id}`
    return res.status(204).end()
  }
  return res.status(405).json({ error: 'Méthode non autorisée' })
}
