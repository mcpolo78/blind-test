import { sql, ensureTable, noDb } from '../_lib/db.js'

// GET /api/scores/top : les 10 meilleurs scores.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!sql) return noDb(res)
  await ensureTable()
  const rows = await sql`SELECT pseudo, score FROM scores ORDER BY score DESC, created_at ASC LIMIT 10`
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(rows)
}
