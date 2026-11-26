import { getPlaylists } from './_lib/deezer.js'

// GET /api/playlists : playlists jouables (au moins 4 sons), dans l'ordre de l'admin.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const playlists = (await getPlaylists())
    .filter((p) => p.count >= 4)
    .map(({ slug, name, count }) => ({ slug, name, count }))
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
  return res.status(200).json(playlists)
}
