import { sql, ensureTables, noDb } from '../_lib/db.js'
import { checkAdmin } from '../_lib/admin.js'
import { searchTracks } from '../_lib/deezer.js'
import { cartoons as baseCartoons, ERAS } from '../_lib/cartoons.js'

// GET    /api/admin/cartoons            : génériques ajoutés depuis l'admin
// GET    /api/admin/cartoons?q=pokemon  : recherche de titres sur Deezer
// POST   /api/admin/cartoons { name, deezerId, era, image? }
// DELETE /api/admin/cartoons?id=3
export default async function handler(req, res) {
  if (!checkAdmin(req, res)) return

  if (req.method === 'GET' && req.query.q) {
    return res.status(200).json(await searchTracks(String(req.query.q).slice(0, 100)))
  }

  if (!sql) return noDb(res)
  await ensureTables()

  if (req.method === 'GET') {
    const rows = await sql`SELECT id, name, deezer_id, era, image FROM custom_cartoons ORDER BY id`
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json(rows)
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const name = String(body.name || '').trim().slice(0, 80)
    const deezerId = Number(body.deezerId)
    const era = ERAS.includes(body.era) ? body.era : null
    const image = body.image ? String(body.image).trim().slice(0, 500) : null
    if (!name || !Number.isInteger(deezerId) || !era) {
      return res.status(400).json({ error: 'Nom, titre Deezer et époque obligatoires' })
    }
    if (image && !/^https:\/\//.test(image)) return res.status(400).json({ error: 'Image : lien https attendu' })
    if (baseCartoons.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Ce dessin animé est déjà dans la liste de base' })
    }
    try {
      const [row] = await sql`INSERT INTO custom_cartoons (name, deezer_id, era, image)
        VALUES (${name}, ${deezerId}, ${era}, ${image}) RETURNING id`
      return res.status(201).json({ id: row.id })
    } catch {
      return res.status(409).json({ error: 'Ce nom existe déjà' })
    }
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id invalide' })
    await sql`DELETE FROM custom_cartoons WHERE id = ${id}`
    return res.status(204).end()
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}
