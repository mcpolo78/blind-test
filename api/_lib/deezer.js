import { cartoons } from './cartoons.js'

// Cache mémoire de l'instance (Fluid Compute réutilise les instances).
// Les liens d'extraits Deezer expirent : on les rafraîchit toutes les 30 min.
const TTL_MS = 30 * 60 * 1000
let cache = { at: 0, tracks: null }

async function fetchTrack(cartoon) {
  try {
    const res = await fetch(`https://api.deezer.com/track/${cartoon.deezerId}`)
    const t = await res.json()
    if (!t || t.error || !t.preview) return null
    let image_url = t.album?.cover_medium || ''
    if (cartoon.image === null) image_url = ''
    else if (cartoon.coverAlbumId) {
      const a = await fetch(`https://api.deezer.com/album/${cartoon.coverAlbumId}`).then((r) => r.json())
      if (a?.cover_medium) image_url = a.cover_medium
    }
    return { name: cartoon.name, audio_url: t.preview, image_url }
  } catch {
    return null
  }
}

export async function getTracks() {
  if (cache.tracks && Date.now() - cache.at < TTL_MS) return cache.tracks
  const tracks = (await Promise.all(cartoons.map(fetchTrack))).filter(Boolean)
  if (tracks.length) cache = { at: Date.now(), tracks }
  return tracks
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
