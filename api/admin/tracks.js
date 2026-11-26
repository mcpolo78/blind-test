import { sql, ensureTables, noDb, readBody } from '../_lib/db.js'
import { checkAdmin } from '../_lib/admin.js'
import { searchTracks } from '../_lib/deezer.js'

// GET    /api/admin/tracks?q=goldorak : recherche de titres sur Deezer
// POST   /api/admin/tracks { playlistId, name, deezerId, image? }
// PATCH  /api/admin/tracks?id=7 { name?, image?, playlistId? }  (image '' = pochette Deezer)
// DELETE /api/admin/tracks?id=7
export default async function handler(req, res) {
  if (!checkAdmin(req, res)) return
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    const q = String(req.query.q || '').trim().slice(0, 100)
    if (!q) return res.status(400).json({ error: 'Recherche vide' })
    return res.status(200).json(await searchTracks(q))
  }

  if (!sql) return noDb(res)
  await ensureTables()
  const body = readBody(req)
  const id = Number(req.query.id)

  if (req.method === 'POST') {
    const playlistId = Number(body.playlistId)
    const name = String(body.name || '').trim().slice(0, 80)
    const deezerId = Number(body.deezerId)
    const image = cleanImage(body.image)
    if (!Number.isInteger(playlistId) || !name || !Number.isInteger(deezerId)) {
      return res.status(400).json({ error: 'Playlist, nom et titre Deezer obligatoires' })
    }
    if (image === false) return res.status(400).json({ error: 'Image : lien https attendu' })
    try {
      const [row] = await sql`INSERT INTO tracks (playlist_id, name, deezer_id, image)
        VALUES (${playlistId}, ${name}, ${deezerId}, ${image}) RETURNING id`
      return res.status(201).json({ id: row.id })
    } catch (e) {
      return res.status(409).json({ error: duplicate(e) ? 'Ce nom existe déjà dans la playlist' : 'Playlist introuvable' })
    }
  }

  if (!Number.isInteger(id)) return res.status(400).json({ error: 'id invalide' })

  if (req.method === 'PATCH') {
    try {
      if (body.name !== undefined) {
        const name = String(body.name).trim().slice(0, 80)
        if (!name) return res.status(400).json({ error: 'Nom obligatoire' })
        await sql`UPDATE tracks SET name = ${name} WHERE id = ${id}`
      }
      if (body.image !== undefined) {
        const image = cleanImage(body.image)
        if (image === false) return res.status(400).json({ error: 'Image : lien https attendu' })
        // Une image choisie à la main remplace aussi la pochette de compilation.
        await sql`UPDATE tracks SET image = ${image}, cover_album_id = CASE WHEN ${image}::text IS NULL THEN cover_album_id ELSE NULL END WHERE id = ${id}`
      }
      if (body.playlistId !== undefined) {
        await sql`UPDATE tracks SET playlist_id = ${Number(body.playlistId)} WHERE id = ${id}`
      }
    } catch (e) {
      return res.status(409).json({ error: duplicate(e) ? 'Ce nom existe déjà dans la playlist' : 'Modification impossible' })
    }
    return res.status(204).end()
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM tracks WHERE id = ${id}`
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}

// null = pas d'image (pochette Deezer), false = lien refusé.
function cleanImage(v) {
  const s = String(v ?? '').trim().slice(0, 500)
  if (!s) return null
  return /^https:\/\//.test(s) ? s : false
}

function duplicate(e) {
  return e?.code === '23505' || /duplicate|unique/i.test(String(e?.message))
}
