import { sql, ensureTables, noDb } from './_lib/db.js'

// 10 questions × (100 points + 100 de bonus de vitesse au maximum)
const MAX_SCORE = 2000
const MODES = ['all', '80', '2000']

// POST /api/scores { pseudo, score, correct, mode }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!sql) return noDb(res)

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const pseudo = String(body.pseudo || '').trim().slice(0, 30)
  const score = Number(body.score)
  const correct = Number.isInteger(Number(body.correct)) ? Number(body.correct) : null
  const mode = MODES.includes(body.mode) ? body.mode : 'all'
  if (!pseudo || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return res.status(400).json({ error: 'Pseudo ou score invalide' })
  }

  await ensureTables()
  const [row] = await sql`INSERT INTO scores (pseudo, score, correct, mode)
    VALUES (${pseudo}, ${score}, ${correct}, ${mode}) RETURNING id`
  return res.status(201).json({ id: row.id })
}
