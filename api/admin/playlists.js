import { sql, ensureTables, noDb, readBody } from '../_lib/db.js'
import { checkAdmin } from '../_lib/admin.js'
import { getPlaylists, resolve } from '../_lib/deezer.js'
import { optimized } from '../_lib/images.js'
import { defaultImage } from '../_lib/track-images.js'

// GET    /api/admin/playlists          : playlists et nombre de sons
// GET    /api/admin/playlists?id=3     : sons d'une playlist (avec extrait et vignette)
// POST   /api/admin/playlists { name } : nouvelle playlist
// PATCH  /api/admin/playlists?id=3 { name?, move?: 'up'|'down' }
// DELETE /api/admin/playlists?id=3     : supprime la playlist et ses sons
export default async function handler(req, res) {
  if (!checkAdmin(req, res)) return
  if (!sql) return noDb(res)
  await ensureTables()
  res.setHeader('Cache-Control', 'no-store')
  const id = req.query.id !== undefined ? Number(req.query.id) : null
  if (id !== null && !Number.isInteger(id)) return res.status(400).json({ error: 'id invalide' })

  if (req.method === 'GET' && id === null) return res.status(200).json(await getPlaylists())

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM tracks WHERE playlist_id = ${id} ORDER BY name`
    const tracks = await Promise.all(
      rows.map(async (r) => {
        const base = {
          id: r.id,
          name: r.name,
          deezerId: Number(r.deezer_id),
          image: defaultImage({ name: r.name, deezerId: r.deezer_id, image: r.image }),
          coverAlbumId: r.cover_album_id ? Number(r.cover_album_id) : null,
        }
        const full = await resolve(base)
        return full
          ? { ...base, audio_url: full.audio_url, image_url: optimized(full.image_url), available: true }
          : { ...base, audio_url: '', image_url: optimized(base.image), available: false }
      }),
    )
    return res.status(200).json(tracks)
  }

  if (req.method === 'POST') {
    const name = String(readBody(req).name || '').trim().slice(0, 80)
    if (!name) return res.status(400).json({ error: 'Nom obligatoire' })
    const [same] = await sql`SELECT id FROM playlists WHERE lower(name) = lower(${name})`
    if (same) return res.status(409).json({ error: 'Une playlist porte déjà ce nom' })
    const slug = await uniqueSlug(name)
    const [row] = await sql`INSERT INTO playlists (slug, name, position)
      VALUES (${slug}, ${name}, (SELECT COALESCE(MAX(position), -1) + 1 FROM playlists)) RETURNING id, slug`
    return res.status(201).json(row)
  }

  if (req.method === 'PATCH' && id !== null) {
    const body = readBody(req)
    if (body.name !== undefined) {
      const name = String(body.name).trim().slice(0, 80)
      if (!name) return res.status(400).json({ error: 'Nom obligatoire' })
      // Le slug ne change pas : les scores et liens de défi restent valables.
      await sql`UPDATE playlists SET name = ${name} WHERE id = ${id}`
    }
    if (body.move === 'up' || body.move === 'down') await move(id, body.move)
    return res.status(204).end()
  }

  if (req.method === 'DELETE' && id !== null) {
    await sql`DELETE FROM playlists WHERE id = ${id}`
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}

async function uniqueSlug(name) {
  const base =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'playlist'
  const taken = new Set((await sql`SELECT slug FROM playlists`).map((r) => r.slug))
  taken.add('all')
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

// Échange la place d'une playlist avec sa voisine.
async function move(id, dir) {
  const list = await sql`SELECT id FROM playlists ORDER BY position, id`
  const i = list.findIndex((p) => p.id === id)
  const j = dir === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  for (const [pos, p] of list.entries()) await sql`UPDATE playlists SET position = ${pos} WHERE id = ${p.id}`
}
