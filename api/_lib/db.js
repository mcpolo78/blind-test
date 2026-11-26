import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
export const sql = url ? neon(url) : null

let ready = false
export async function ensureTable() {
  if (!sql) throw new Error('NO_DB')
  if (ready) return
  await sql`CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(30) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  ready = true
}

export function noDb(res) {
  return res.status(503).json({ error: 'Base de scores non configurée (DATABASE_URL manquant).' })
}
