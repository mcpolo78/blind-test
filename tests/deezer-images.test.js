import assert from 'node:assert/strict'
import test from 'node:test'
import { resolve } from '../api/_lib/deezer.js'
import { SEED_TRACKS } from '../api/_lib/seed.js'

test('la résolution et le cache utilisent la vignette effective sans écraser un choix manuel', async (t) => {
  const seed = SEED_TRACKS.find((track) => track.image)
  assert.ok(seed, 'au moins un morceau de départ possède une vignette')
  const requests = t.mock.method(globalThis, 'fetch', async () => ({
    json: async () => ({ preview: 'https://example.com/audio.mp3', album: { cover_medium: 'https://example.com/album.jpg' } }),
  }))
  const track = { ...seed, image: null }
  const resolved = await resolve(track)
  assert.equal(resolved.image, seed.image)
  assert.equal(resolved.image_url, seed.image)
  assert.equal(track.image, null, 'la ligne source reste intacte')

  const cached = await resolve({ ...seed, image: seed.image })
  assert.equal(cached.image_url, seed.image)
  assert.equal(requests.mock.callCount(), 1, 'même image effective : même entrée de cache')

  const customImage = 'https://example.com/manual.jpg'
  const custom = await resolve({ ...seed, image: customImage })
  assert.equal(custom.image, customImage)
  assert.equal(custom.image_url, customImage)
  assert.equal(requests.mock.callCount(), 2, 'une image manuelle utilise une entrée de cache distincte')
})
