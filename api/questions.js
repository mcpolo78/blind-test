import { getTracks, shuffle, rng } from './_lib/deezer.js'
import { ERAS } from './_lib/cartoons.js'

const QUESTIONS_PER_GAME = 10
const CHOICES = 4

// GET /api/questions?mode=all|80|2000&seed=123
// Jusqu'à 10 questions. Avec seed, la partie est reproductible (mode défi).
// Format identique à l'ancienne API (choices est une chaîne JSON).
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const mode = ERAS.includes(req.query.mode) ? req.query.mode : 'all'
  const seed = Number.parseInt(req.query.seed, 10)
  const random = Number.isFinite(seed) ? rng(seed) : Math.random

  const all = (await getTracks()).sort((a, b) => a.name.localeCompare(b.name))
  const pool = mode === 'all' ? all : all.filter((t) => t.era === mode)
  if (pool.length < CHOICES) return res.status(502).json({ error: 'Pas assez d’extraits pour ce mode' })

  const names = pool.map((t) => t.name)
  const questions = shuffle(pool, random)
    .slice(0, QUESTIONS_PER_GAME)
    .map((t, i) => {
      const decoys = shuffle(names.filter((n) => n !== t.name), random).slice(0, CHOICES - 1)
      return {
        id: i + 1,
        audio_url: t.audio_url,
        correct_answer: t.name,
        choices: JSON.stringify(shuffle([t.name, ...decoys], random)),
      }
    })

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(questions)
}
