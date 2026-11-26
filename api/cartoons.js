import { getTracks } from './_lib/deezer.js'

// Vignettes servies par l'optimiseur d'images Vercel (AVIF/WebP, 256 px, en cache),
// voir "images" dans vercel.json. Les hôtes autorisés y sont listés.
const OPTIMIZED_HOSTS = ['upload.wikimedia.org', 'cdn-images.dzcdn.net', 'e-cdns-images.dzcdn.net']
function optimized(url) {
  if (!url || process.env.VERCEL !== '1') return url
  try {
    if (!OPTIMIZED_HOSTS.includes(new URL(url).hostname)) return url
  } catch {
    return url
  }
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=256&q=75`
}

// GET /api/cartoons : nom, époque et vignette de chaque dessin animé.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const tracks = await getTracks()
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
  return res.status(200).json(tracks.map(({ name, image_url, era }) => ({ name, image_url: optimized(image_url), era })))
}
