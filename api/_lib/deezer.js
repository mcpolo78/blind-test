import { SEED_PLAYLISTS, SEED_TRACKS } from './seed.js'
import { sql, ensureTables } from './db.js'
import { defaultImage } from './track-images.js'

// Cache mémoire par titre (Fluid Compute réutilise les instances).
// Les liens d'extraits Deezer expirent : on les rafraîchit toutes les 30 min.
const TTL_MS = 30 * 60 * 1000
const trackCache = new Map()

async function deezer(path) {
  const res = await fetch(`https://api.deezer.com/${path}`)
  return res.json()
}

// Ajoute l'extrait audio et la vignette à un morceau de la base.
// Renvoie null si Deezer n'a plus d'extrait pour ce titre.
export async function resolve(track) {
  const effectiveTrack = { ...track, image: defaultImage(track) }
  const key = `${track.deezerId}:${track.coverAlbumId || ''}:${effectiveTrack.image || ''}`
  const hit = trackCache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return { ...effectiveTrack, ...hit.value }
  try {
    const t = await deezer(`track/${track.deezerId}`)
    if (!t || t.error || !t.preview) return null
    let image_url = t.album?.cover_medium || ''
    if (effectiveTrack.image) image_url = effectiveTrack.image
    else if (track.coverAlbumId) {
      const a = await deezer(`album/${track.coverAlbumId}`)
      if (a?.cover_medium) image_url = a.cover_medium
    }
    const value = { audio_url: t.preview, image_url }
    trackCache.set(key, { at: Date.now(), value })
    return { ...effectiveTrack, ...value }
  } catch {
    return null
  }
}

function fromRow(r) {
  const image = defaultImage({ name: r.name, deezerId: r.deezer_id, image: r.image })
  return {
    id: r.id,
    name: r.name,
    deezerId: Number(r.deezer_id),
    image,
    coverAlbumId: r.cover_album_id ? Number(r.cover_album_id) : null,
    playlist: r.slug,
  }
}

// Playlists avec leur nombre de morceaux. Sans base (dev local) : données de départ.
export async function getPlaylists() {
  if (!sql) {
    return SEED_PLAYLISTS.map((p) => ({ ...p, count: SEED_TRACKS.filter((t) => t.playlist === p.slug).length }))
  }
  await ensureTables()
  const rows = await sql`SELECT p.id, p.slug, p.name, COUNT(t.id)::int AS count
    FROM playlists p LEFT JOIN tracks t ON t.playlist_id = p.id
    GROUP BY p.id ORDER BY p.position, p.id`
  return rows
}

// Morceaux d'une playlist (slug), ou de toutes si slug est vide.
export async function getTrackRows(slug) {
  if (!sql) return SEED_TRACKS.filter((t) => !slug || t.playlist === slug)
  await ensureTables()
  const rows = slug
    ? await sql`SELECT t.*, p.slug FROM tracks t JOIN playlists p ON p.id = t.playlist_id
        WHERE p.slug = ${slug} ORDER BY t.name`
    : await sql`SELECT t.*, p.slug FROM tracks t JOIN playlists p ON p.id = t.playlist_id ORDER BY t.name`
  return rows.map(fromRow)
}

export async function getTracks(slug) {
  const rows = await getTrackRows(slug)
  return (await Promise.all(rows.map(resolve))).filter(Boolean)
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
