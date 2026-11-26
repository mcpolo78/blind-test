// Vignettes servies par l'optimiseur d'images Vercel (AVIF/WebP, 384 px pour rester net sur écran haute densité, en cache),
// voir "images" dans vercel.json, où les hôtes autorisés sont listés.
const OPTIMIZED_HOSTS = [
  'upload.wikimedia.org',
  'cdn-images.dzcdn.net',
  'e-cdns-images.dzcdn.net',
  'image.animationdigitalnetwork.fr',
  'photos.abweb.com',
  'tv-programme.com',
  'image.tmdb.org',
  'photos.tf1.fr',
  'artworks.thetvdb.com',
  'www.alf.fr',
  'images.justwatch.com',
  'media.ngroup.be',
  'm.media-amazon.com',
  'media.senscritique.com',
  'fr.web.img5.acsta.net',
]

export function optimized(url) {
  if (!url || process.env.VERCEL !== '1') return url || ''
  try {
    if (!OPTIMIZED_HOSTS.includes(new URL(url).hostname)) return url
  } catch {
    return url
  }
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=384&q=75`
}
