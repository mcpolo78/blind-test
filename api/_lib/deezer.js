import { cartoons as baseCartoons } from './cartoons.js'
import { sql, ensureTables } from './db.js'

// Cache mémoire par titre (Fluid Compute réutilise les instances).
// Les liens d'extraits Deezer expirent : on les rafraîchit toutes les 30 min.
const TTL_MS = 30 * 60 * 1000
const trackCache = new Map()

async function deezer(path) {
  const res = await fetch(`https://api.deezer.com/${path}`)
  return res.json()
}

async function resolve(cartoon) {
  const key = `${cartoon.deezerId}:${cartoon.coverAlbumId || ''}:${cartoon.image ?? ''}`
  const hit = trackCache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return { ...hit.value, name: cartoon.name, era: cartoon.era }
  try {
    const t = await deezer(`track/${cartoon.deezerId}`)
    if (!t || t.error || !t.preview) return null
    let image_url = t.album?.cover_medium || ''
    if (cartoon.image === null) image_url = ''
    else if (cartoon.image) image_url = cartoon.image
    else if (cartoon.coverAlbumId) {
      const a = await deezer(`album/${cartoon.coverAlbumId}`)
      if (a?.cover_medium) image_url = a.cover_medium
    }
    const value = { audio_url: t.preview, image_url }
    trackCache.set(key, { at: Date.now(), value })
    return { ...value, name: cartoon.name, era: cartoon.era }
  } catch {
    return null
  }
}

// Liste de base + dessins animés ajoutés depuis l'admin.
export async function getCatalog() {
  let custom = []
  if (sql) {
    try {
      await ensureTables()
      const rows = await sql`SELECT name, deezer_id, era, image FROM custom_cartoons ORDER BY id`
      custom = rows.map((r) => ({
        name: r.name,
        deezerId: Number(r.deezer_id),
        era: r.era,
        ...(r.image ? { image: r.image } : {}),
      }))
    } catch {
      /* base indisponible : on garde la liste de base */
    }
  }
  const names = new Set(baseCartoons.map((c) => c.name))
  return [...baseCartoons, ...custom.filter((c) => !names.has(c.name))]
}

export async function getTracks() {
  const catalog = await getCatalog()
  return (await Promise.all(catalog.map(resolve))).filter(Boolean)
}

export async function searchTracks(q) {
  const r = await deezer(`search?limit=10&q=${encodeURIComponent(q)}`)
  return (r.data || [])
    .filter((t) => t.preview)
    .map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist?.name,
      album: t.album?.title,
      cover: t.album?.cover_medium,
      preview: t.preview,
    }))
}

// Générateur pseudo-aléatoire à graine (mulberry32), pour le mode défi :
// la même graine redonne exactement la même partie.
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle(arr, random = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
