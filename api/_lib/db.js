import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
export const sql = url ? neon(url) : null

let ready = false
export async function ensureTables() {
  if (!sql) throw new Error('NO_DB')
  if (ready) return
  await sql`CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(30) NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS mode VARCHAR(10) NOT NULL DEFAULT 'all'`
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS correct INTEGER`
  await sql`CREATE TABLE IF NOT EXISTS custom_cartoons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    deezer_id BIGINT NOT NULL,
    era VARCHAR(10) NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  ready = true
}
// Ancien nom, gardé pour les routes existantes.
export const ensureTable = ensureTables

export function noDb(res) {
  return res.status(503).json({ error: 'Base de scores non configurée (DATABASE_URL manquant).' })
}
