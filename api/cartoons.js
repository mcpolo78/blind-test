import { getTracks } from './_lib/deezer.js'

// GET /api/cartoons : nom + vignette de chaque dessin animé.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const tracks = await getTracks()
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600')
  return res.status(200).json(tracks.map(({ name, image_url }) => ({ name, image_url })))
}
