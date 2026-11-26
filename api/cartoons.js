import { getTracks } from './_lib/deezer.js'
import { optimized } from './_lib/images.js'

// GET /api/cartoons?playlist=<slug> : nom, playlist et vignette de chaque son
// (toutes les playlists par défaut). Nom gardé pour compatibilité.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const slug = req.query.playlist && req.query.playlist !== 'all' ? String(req.query.playlist) : ''
  const tracks = await getTracks(slug)
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')
  return res
    .status(200)
    .json(tracks.map(({ name, image_url, playlist }) => ({ name, image_url: optimized(image_url), playlist })))
}
