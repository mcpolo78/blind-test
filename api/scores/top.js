import { sql, ensureTables, noDb } from '../_lib/db.js'

// GET /api/scores/top?period=day|week|all : les 10 meilleurs scores.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  if (!sql) return noDb(res)
  await ensureTables()
  const period = req.query.period
  const since =
    period === 'day'
      ? new Date(Date.now() - 24 * 3600 * 1000)
      : period === 'week'
        ? new Date(Date.now() - 7 * 24 * 3600 * 1000)
        : new Date(0)
  const rows = await sql`SELECT s.pseudo, s.score, s.correct, s.mode, p.name AS playlist
    FROM scores s LEFT JOIN playlists p ON p.slug = s.mode
    WHERE s.created_at >= ${since.toISOString()}
    ORDER BY s.score DESC, s.created_at ASC LIMIT 10`
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(rows)
}
