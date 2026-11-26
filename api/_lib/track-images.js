import { SEED_TRACKS } from './seed.js'

// Corrige les anciennes vignettes de départ sans toucher aux images choisies
// dans l'admin, ni réimporter les playlists déjà modifiées en base.
export function defaultImage(track, seedTracks = SEED_TRACKS) {
  const image = track.image || null
  const seed = seedTracks.find(
    (entry) => entry.name === track.name && Number(entry.deezerId) === Number(track.deezerId),
  )
  if (seed?.image && (!image || image === seed.legacyImage || seed.legacyImages?.includes(image))) {
    return seed.image
  }
  return image
}
