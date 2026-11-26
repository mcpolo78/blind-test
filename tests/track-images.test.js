import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultImage } from '../api/_lib/track-images.js'

const currentImage = 'https://example.com/current.jpg'
const legacyImage = 'https://example.com/legacy.jpg'
const customImage = 'https://example.com/custom.jpg'
const previousImage = 'https://example.com/previous.jpg'
const seedTracks = [{ name: 'Générique', deezerId: 42, image: currentImage, legacyImage, legacyImages: [previousImage] }]
const track = { name: 'Générique', deezerId: 42 }

test('les images absentes et anciennes utilisent la vignette corrigée', () => {
  for (const image of [undefined, null, '', legacyImage, previousImage]) {
    assert.equal(defaultImage({ ...track, image }, seedTracks), currentImage)
  }
  assert.equal(defaultImage({ ...track, image: currentImage }, seedTracks), currentImage)
})

test('une image personnalisée reste prioritaire', () => {
  assert.equal(defaultImage({ ...track, image: customImage }, seedTracks), customImage)
})

test('la correspondance exige le nom et le titre Deezer', () => {
  assert.equal(defaultImage({ ...track, name: 'Autre générique', image: legacyImage }, seedTracks), legacyImage)
  assert.equal(defaultImage({ ...track, deezerId: 43, image: legacyImage }, seedTracks), legacyImage)
  assert.equal(defaultImage({ ...track, deezerId: '42', image: legacyImage }, seedTracks), currentImage)
})

test('un morceau sans image seed conserve la pochette de secours', () => {
  const seedsWithoutImage = [{ name: track.name, deezerId: track.deezerId }]
  assert.equal(defaultImage(track, seedsWithoutImage), null)
  assert.equal(defaultImage({ ...track, image: customImage }, seedsWithoutImage), customImage)
})
