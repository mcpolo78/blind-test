import { timingSafeEqual } from 'node:crypto'

// Vérifie l'en-tête x-admin-password contre la variable ADMIN_PASSWORD.
export function checkAdmin(req, res) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    res.status(503).json({ error: 'ADMIN_PASSWORD non configuré.' })
    return false
  }
  const given = String(req.headers['x-admin-password'] || '')
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ error: 'Mot de passe incorrect.' })
    return false
  }
  return true
}
