import { sql, ensureTable, noDb } from './_lib/db.js'

const MAX_SCORE = 50

// POST /api/scores { pseudo, score }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!sql) return noDb(res)

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const pseudo = String(body.pseudo || '').trim().slice(0, 30)
  const score = Number(body.score)
  if (!pseudo || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return res.status(400).json({ error: 'Pseudo ou score invalide' })
  }

  await ensureTable()
  const [row] = await sql`INSERT INTO scores (pseudo, score) VALUES (${pseudo}, ${score}) RETURNING id`
  return res.status(201).json({ id: row.id })
}
