import { neon } from '@neondatabase/serverless'
import { SEED_PLAYLISTS, SEED_TRACKS, SEED_VERSION } from './seed.js'

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
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS mode VARCHAR(60) NOT NULL DEFAULT 'all'`
  await sql`ALTER TABLE scores ALTER COLUMN mode TYPE VARCHAR(60)`
  await sql`ALTER TABLE scores ADD COLUMN IF NOT EXISTS correct INTEGER`
  // Ancienne table des ajouts faits depuis l'admin, plus utilisée (gardée par précaution).
  await sql`CREATE TABLE IF NOT EXISTS custom_cartoons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    deezer_id BIGINT NOT NULL,
    era VARCHAR(10) NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    deezer_id BIGINT NOT NULL,
    image TEXT,
    cover_album_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (playlist_id, name)
  )`
  await sql`CREATE TABLE IF NOT EXISTS app_meta (key VARCHAR(40) PRIMARY KEY, value TEXT)`
  await seedOnce()
  ready = true
}

// Remplit les playlists de départ ('80' et '2000') avec seed.js, une seule fois
// par SEED_VERSION : la ligne app_meta « seed:<version> » sert de verrou. Un son
// retiré depuis l'admin ne revient donc pas, sauf si SEED_VERSION change.
async function seedOnce() {
  const key = `seed:${SEED_VERSION}`
  const claimed = await sql`INSERT INTO app_meta (key, value) VALUES (${key}, now()::text)
    ON CONFLICT (key) DO NOTHING RETURNING key`
  if (claimed.length === 0) return
  try {
    await seed()
  } catch (e) {
    // Échec en cours de route : on libère le verrou, le prochain appel reprendra.
    await sql`DELETE FROM app_meta WHERE key = ${key}`
    throw e
  }
}

async function seed() {
  for (const [i, p] of SEED_PLAYLISTS.entries()) {
    const [row] = await sql`INSERT INTO playlists (slug, name, position) VALUES (${p.slug}, ${p.name}, ${i})
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`
    await sql`DELETE FROM tracks WHERE playlist_id = ${row.id}`
    for (const t of SEED_TRACKS.filter((x) => x.playlist === p.slug)) {
      await sql`INSERT INTO tracks (playlist_id, name, deezer_id, image, cover_album_id)
        VALUES (${row.id}, ${t.name}, ${t.deezerId}, ${t.image || null}, ${t.coverAlbumId || null})
        ON CONFLICT (playlist_id, name) DO NOTHING`
    }
  }
}

export function noDb(res) {
  return res.status(503).json({ error: 'Base non configurée (DATABASE_URL manquant).' })
}

export function readBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}')
    } catch {
      return {}
    }
  }
  return req.body || {}
}
