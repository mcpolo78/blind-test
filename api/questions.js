import { getTracks, shuffle, rng } from './_lib/deezer.js'
import { optimized } from './_lib/images.js'

const QUESTIONS_PER_GAME = 10
const CHOICES = 4

// GET /api/questions?playlist=<slug>|all&seed=123
// Jusqu'à 10 questions. Avec seed, la partie est reproductible (mode défi).
// « mode » est accepté comme ancien nom de « playlist » (anciens liens de défi).
// choices est une chaîne JSON (format de l'ancienne API) ; images donne la
// vignette de chaque choix.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const wanted = String(req.query.playlist || req.query.mode || 'all').slice(0, 60)
  const slug = wanted === 'all' ? '' : wanted
  const seed = Number.parseInt(req.query.seed, 10)
  const random = Number.isFinite(seed) ? rng(seed) : Math.random

  // Tri stable avant le mélange à graine, et un seul morceau par nom.
  const seen = new Set()
  const pool = (await getTracks(slug))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
    .filter((t) => !seen.has(t.name) && seen.add(t.name))
  if (pool.length < CHOICES) {
    return res.status(422).json({ error: `Il faut au moins ${CHOICES} sons dans la playlist pour jouer.` })
  }

  const images = Object.fromEntries(pool.map((t) => [t.name, optimized(t.image_url)]))
  const questions = shuffle(pool, random)
    .slice(0, QUESTIONS_PER_GAME)
    .map((t, i) => {
      // Les leurres viennent de la même playlist quand c'est possible.
      const same = pool.filter((o) => o.playlist === t.playlist && o.name !== t.name)
      const others = same.length >= CHOICES - 1 ? same : pool.filter((o) => o.name !== t.name)
      const decoys = shuffle(others, random).slice(0, CHOICES - 1).map((o) => o.name)
      const choices = shuffle([t.name, ...decoys], random)
      return {
        id: i + 1,
        audio_url: t.audio_url,
        correct_answer: t.name,
        choices: JSON.stringify(choices),
        images: Object.fromEntries(choices.map((n) => [n, images[n]])),
      }
    })

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(questions)
}
