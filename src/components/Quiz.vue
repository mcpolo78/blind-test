<template>
  <div class="app" :class="{ 'is-playing': started && currentIndex < questions.length }">
    <h1>🎵 Blind test</h1>

    <!-- Écran d’accueil -->
    <div v-if="!started">
      <div v-if="challenge" class="challenge-banner">
        ⚔️ <strong>{{ challenge.by || 'Un ami' }}</strong> te défie
        <span v-if="challenge.score !== null"> : <strong>{{ challenge.score }} pts</strong> à battre</span>
      </div>

      <p class="intro-text">{{ challenge ? 'Es-tu prêt ?' : 'Choisis ta playlist' }}</p>

      <div v-if="!challenge" class="modes" role="radiogroup" aria-label="Playlist">
        <button
          v-for="m in modes"
          :key="m.id"
          type="button"
          role="radio"
          :aria-checked="mode === m.id"
          :class="['mode', { active: mode === m.id }]"
          @click="mode = m.id"
        >
          {{ m.label }}
        </button>
      </div>
      <p v-else class="hint">Playlist : {{ modeLabel }}</p>

      <p class="rules">⏱️ {{ QUESTION_TIME }} s par question. Bonne réponse : 100 pts, plus jusqu'à 100 pts de bonus si tu es rapide.</p>

      <button class="primary" @click="startQuiz" :disabled="loading || playlistsLoading || (!challenge && !mode)">
        {{ loading || playlistsLoading ? '⏳ Chargement...' : '✅ Prêt' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>

      <Leaderboard :refresh-key="leaderboardKey" />
    </div>

    <!-- Quiz en cours -->
    <div v-else-if="currentIndex < questions.length">
      <div class="status">
        <span>Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
        <span class="points">{{ score }} pts</span>
      </div>

      <div class="timer" :class="{ urgent: timeLeft <= 5 }" aria-hidden="true">
        <div class="timer-bar" :style="{ width: (timeLeft / QUESTION_TIME) * 100 + '%' }"></div>
      </div>
      <p class="timer-text">{{ Math.ceil(timeLeft) }} s</p>

      <audio ref="audio" :src="current.audio_url" controls autoplay></audio>

      <div class="choices">
        <button
          v-for="choice in currentChoices"
          :key="choice"
          type="button"
          :class="['choice-block', choiceClass(choice)]"
          :disabled="answered"
          @click="handleAnswer(choice)"
        >
          <img v-if="imageOf(current, choice)" :src="imageOf(current, choice)" alt="" class="vignette" />
          <span v-else class="vignette vignette-vide">🎬</span>
          <span class="choice-name">{{ choice }}</span>
        </button>
      </div>

      <p v-if="feedbackMessage" class="feedback" aria-live="polite">{{ feedbackMessage }}</p>
    </div>

    <!-- Fin du quiz -->
    <div v-else>
      <h2>🎉 Partie terminée !</h2>
      <p class="final-score">{{ score }} pts</p>
      <p>{{ correctCount }} bonne{{ correctCount > 1 ? 's' : '' }} réponse{{ correctCount > 1 ? 's' : '' }} sur {{ questions.length }}</p>
      <p v-if="challenge && challenge.score !== null" class="challenge-result">
        {{ score > challenge.score ? '🏆 Défi relevé !' : score === challenge.score ? '🤝 Égalité !' : '😅 Défi perdu, retente ta chance !' }}
      </p>

      <div class="end-actions">
        <input v-model="pseudo" placeholder="Ton pseudo" maxlength="30" :disabled="scoreSubmitted" />
        <button @click="submitScore" :disabled="scoreSubmitted">📤 Envoyer le score</button>
        <button @click="shareChallenge">🔗 Défier un ami</button>
        <button @click="restartQuiz">🔁 Rejouer</button>
      </div>
      <p v-if="shareMessage" class="hint">{{ shareMessage }}</p>
      <input v-if="shareUrl" class="share-url" :value="shareUrl" readonly @focus="$event.target.select()" />

      <!-- Correction -->
      <section class="correction">
        <h3>📝 Correction</h3>
        <ol>
          <li v-for="(q, i) in questions" :key="q.id" :class="results[i]?.correct ? 'ok' : 'ko'">
            <img v-if="imageOf(q, q.correct_answer)" :src="imageOf(q, q.correct_answer)" alt="" />
            <span v-else class="mini-vide">🎬</span>
            <div>
              <strong>{{ q.correct_answer }}</strong>
              <small v-if="results[i]?.correct"> ✅ +{{ results[i].points }} pts</small>
              <small v-else-if="results[i]?.choice"> ❌ tu as répondu {{ results[i].choice }}</small>
              <small v-else> ⏱️ temps écoulé</small>
            </div>
          </li>
        </ol>
      </section>

      <Leaderboard :refresh-key="leaderboardKey" />

      <transition name="fade">
        <div v-if="showSnackbar" class="snackbar">✅ Score envoyé : {{ score }} pts</div>
      </transition>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';
import '../assets/QuizStyles.css';
import Leaderboard from './Leaderboard.vue';

const QUESTION_TIME = 20;
const ALL = { id: 'all', label: 'Tout mélanger' };

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* stockage indisponible */
  }
}

export default {
  components: { Leaderboard },
  data() {
    return {
      QUESTION_TIME,
      modes: [],
      mode: '80',
      playlistsLoading: true,
      seed: null,
      challenge: null,
      started: false,
      loading: false,
      error: '',
      questions: [],
      currentIndex: 0,
      results: [],
      answered: false,
      timeLeft: QUESTION_TIME,
      timerId: null,
      questionStart: 0,
      pseudo: '',
      score: 0,
      scoreSubmitted: false,
      feedbackMessage: '',
      showSnackbar: false,
      shareUrl: '',
      shareMessage: '',
      leaderboardKey: 0
    };
  },
  computed: {
    current() {
      return this.questions[this.currentIndex];
    },
    currentChoices() {
      return this.current ? JSON.parse(this.current.choices) : [];
    },
    correctCount() {
      return this.results.filter((r) => r && r.correct).length;
    },
    modeLabel() {
      if (this.mode === ALL.id) return ALL.label;
      return this.modes.find((m) => m.id === this.mode)?.label || 'Playlist du défi';
    },
    defaultMode() {
      return this.modes.find((m) => m.id === '80')?.id || this.modes[0]?.id || '';
    }
  },
  mounted() {
    this.pseudo = readStorage('pseudo') || '';
    const p = new URLSearchParams(window.location.search);
    const seed = Number.parseInt(p.get('defi'), 10);
    if (Number.isFinite(seed)) {
      const score = Number.parseInt(p.get('score'), 10);
      this.challenge = {
        seed,
        by: (p.get('par') || '').slice(0, 30),
        score: Number.isFinite(score) ? score : null
      };
      const mode = p.get('mode');
      this.mode = mode && /^[a-z0-9-]{1,60}$/.test(mode) ? mode : ALL.id;
    }
    this.loadPlaylists();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    async loadPlaylists() {
      this.playlistsLoading = true;
      try {
        const res = await fetch('/api/playlists');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const list = await res.json();
        this.modes = list.map((p) => ({ id: p.slug, label: p.name }));
        if (!this.challenge && !this.modes.some((m) => m.id === this.mode)) this.mode = this.defaultMode;
        if (!this.challenge && !this.mode) this.error = 'Aucune playlist disponible pour le moment.';
      } catch {
        if (!this.challenge) {
          this.mode = '';
          this.error = '❌ Impossible de charger les playlists, actualise la page.';
        }
      } finally {
        this.playlistsLoading = false;
      }
    },
    async startQuiz() {
      if (this.loading || this.playlistsLoading) return;
      if (!this.challenge && !this.modes.some((m) => m.id === this.mode)) this.mode = this.defaultMode;
      if (!this.mode) return;
      this.loading = true;
      this.error = '';
      this.seed = this.challenge ? this.challenge.seed : Math.floor(Math.random() * 1e9);
      try {
        const res = await fetch(
          `/api/questions?playlist=${encodeURIComponent(this.mode)}&seed=${this.seed}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'API indisponible');
        }
        this.questions = await res.json();
        this.results = [];
        this.score = 0;
        this.currentIndex = 0;
        this.scoreSubmitted = false;
        this.shareUrl = '';
        this.shareMessage = '';
        this.started = true;
        this.startQuestion();
      } catch (e) {
        console.error('Erreur chargement quiz :', e);
        this.error = '❌ Impossible de charger la partie, réessaie dans un instant.';
      } finally {
        this.loading = false;
      }
    },
    startQuestion() {
      this.stopTimer();
      this.answered = false;
      this.feedbackMessage = '';
      this.timeLeft = QUESTION_TIME;
      this.questionStart = performance.now();
      this.timerId = setInterval(() => {
        const elapsed = (performance.now() - this.questionStart) / 1000;
        this.timeLeft = Math.max(0, QUESTION_TIME - elapsed);
        if (this.timeLeft <= 0) this.handleAnswer(null);
      }, 100);
    },
    stopTimer() {
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = null;
    },
    imageOf(question, name) {
      return (question && question.images && question.images[name]) || '';
    },
    choiceClass(choice) {
      if (!this.answered) return '';
      if (choice === this.current.correct_answer) return 'correct';
      if (choice === this.results[this.currentIndex]?.choice) return 'wrong';
      return 'faded';
    },
    handleAnswer(choice) {
      if (this.answered) return;
      this.answered = true;
      this.stopTimer();
      if (this.$refs.audio) this.$refs.audio.pause();

      const isCorrect = choice === this.current.correct_answer;
      const points = isCorrect ? 100 + Math.round((100 * this.timeLeft) / QUESTION_TIME) : 0;
      this.results[this.currentIndex] = { choice, correct: isCorrect, points };
      this.score += points;

      if (isCorrect) {
        this.feedbackMessage = `✅ Bravo ! +${points} pts`;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else if (choice === null) {
        this.feedbackMessage = `⏱️ Trop tard ! C'était ${this.current.correct_answer}`;
      } else {
        this.feedbackMessage = `❌ Oups… C'était ${this.current.correct_answer}`;
      }

      setTimeout(() => {
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) this.startQuestion();
        else this.feedbackMessage = '';
      }, 1500);
    },
    async submitScore() {
      if (this.scoreSubmitted) return;
      if (!this.pseudo.trim()) {
        this.shareMessage = '❗️ Entre un pseudo avant d’envoyer le score.';
        return;
      }
      try {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pseudo: this.pseudo.trim(),
            score: this.score,
            correct: this.correctCount,
            mode: this.mode
          })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        this.scoreSubmitted = true;
        this.shareMessage = '';
        writeStorage('pseudo', this.pseudo.trim());
        this.leaderboardKey++;
        this.showSnackbar = true;
        setTimeout(() => (this.showSnackbar = false), 3000);
      } catch (error) {
        console.error('Erreur envoi score :', error);
        this.shareMessage = '❌ Échec de l’envoi du score.';
      }
    },
    async shareChallenge() {
      const url = new URL(window.location.origin + '/');
      url.searchParams.set('defi', String(this.seed));
      url.searchParams.set('mode', this.mode);
      url.searchParams.set('score', String(this.score));
      if (this.pseudo.trim()) url.searchParams.set('par', this.pseudo.trim());
      this.shareUrl = url.toString();
      try {
        await navigator.clipboard.writeText(this.shareUrl);
        this.shareMessage = '📋 Lien copié ! Ton ami jouera exactement les mêmes questions.';
      } catch {
        this.shareMessage = 'Copie ce lien et envoie-le : ton ami jouera les mêmes questions.';
      }
    },
    restartQuiz() {
      this.stopTimer();
      this.started = false;
      this.questions = [];
      this.results = [];
      this.currentIndex = 0;
      this.score = 0;
      this.feedbackMessage = '';
      this.scoreSubmitted = false;
      this.showSnackbar = false;
      this.shareUrl = '';
      this.shareMessage = '';
      if (this.challenge) {
        // Après un défi, on revient au jeu normal.
        this.challenge = null;
        this.mode = this.defaultMode;
        window.history.replaceState(null, '', '/');
      }
    }
  }
};
</script>
