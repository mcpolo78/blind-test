import { getTracks, shuffle } from './_lib/deezer.js'

const QUESTIONS_PER_GAME = 10
const CHOICES = 4

// GET /api/questions : une partie de 10 questions tirées au hasard.
// Format identique à l'ancienne API (choices est une chaîne JSON).
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' })
  const tracks = await getTracks()
  if (tracks.length < CHOICES) return res.status(502).json({ error: 'Extraits indisponibles' })

  const names = tracks.map((t) => t.name)
  const questions = shuffle(tracks)
    .slice(0, QUESTIONS_PER_GAME)
    .map((t, i) => {
      const decoys = shuffle(names.filter((n) => n !== t.name)).slice(0, CHOICES - 1)
      return {
        id: i + 1,
        audio_url: t.audio_url,
        correct_answer: t.name,
        choices: JSON.stringify(shuffle([t.name, ...decoys])),
      }
    })

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(questions)
}
