<template>

  <div class="app">
    <h1>🎬 Blind Test Dessins Animés</h1>

    <!-- Écran d’accueil -->
    <div v-if="!started">
      <p class="intro-text">Es-tu prêt pour le quiz ?</p>
      <button @click="startQuiz" :disabled="loading">
        {{ loading ? '⏳ Chargement...' : '✅ Prêt' }}
      </button>
    </div>

    <!-- Quiz en cours -->
    <div v-else-if="currentIndex < questions.length">
      <h3>Question {{ currentIndex + 1 }} / {{ questions.length }}</h3>
      <audio :src="questions[currentIndex].audio_url" controls autoplay></audio>

      <div class="choices">
        <div v-for="choice in JSON.parse(questions[currentIndex].choices)" :key="choice" class="choice-block"
          @click="handleAnswer(choice)">
          <!-- 🖼️ Vignette -->
          <img v-if="getCartoonImage(choice)" :src="getCartoonImage(choice)" alt="" class="vignette" />
          <div v-else class="vignette vignette-vide">🎬</div>
          <!-- 📝 Nom du cartoon -->
          <p>{{ choice }}</p>
        </div>
      </div>


      <p v-if="feedbackMessage" class="feedback">{{ feedbackMessage }}</p>
    </div>

    <!-- Fin du quiz -->
    <div v-else>
      <h2>🎉 Quiz terminé !</h2>
      <p>Tu as obtenu {{ score }} / {{ questions.length }}</p>
      <input v-model="pseudo" placeholder="Ton pseudo" />
      <button @click="submitScore" :disabled="scoreSubmitted">📤 Envoyer le score</button>
      <button @click="restartQuiz">🔁 Rejouer</button>

      <div v-if="showLeaderboard" style="margin-top: 2em;">
        <Leaderboard />
      </div>

      <transition name="fade">
        <div v-if="showSnackbar" class="snackbar">
          ✅ Score envoyé ! Tu as obtenu {{ score }} / {{ questions.length }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import '../assets/QuizStyles.css';
import Leaderboard from './Leaderboard.vue';

export default {
  components: {
    Leaderboard
  },
  data() {
    return {
      started: false,
      loading: false,
      questions: [],
      currentIndex: 0,
      answers: [],
      pseudo: '',
      score: 0,
      showLeaderboard: false,
      scoreSubmitted: false,
      animationClass: '',
      feedbackMessage: '',
      showSnackbar: false,
      cartoons: []
    };
  },
  computed: {
    parsedChoices() {
      const q = this.questions[this.currentIndex];
      return q ? JSON.parse(q.choices) : [];
    }
  },
  mounted() {
    const savedPseudo = localStorage.getItem('pseudo');
    if (savedPseudo) this.pseudo = savedPseudo;
  },
  methods: {
    async startQuiz() {
      this.loading = true;
      try {
        const [questionsRes, cartoonsRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/cartoons')
        ]);

        if (!questionsRes.ok || !cartoonsRes.ok) throw new Error('API indisponible');
        this.questions = await questionsRes.json();
        this.cartoons = await cartoonsRes.json();

        this.answers = Array(this.questions.length).fill('');
        this.started = true;
        this.score = 0;
        this.currentIndex = 0;
      } catch (error) {
        console.error('Erreur chargement quiz :', error);
        alert('❌ Impossible de charger les données.');
      } finally {
        this.loading = false;
      }
    },
    getCartoonImage(name) {
      const cartoon = this.cartoons.find(c => c.name === name);
      return cartoon ? cartoon.image_url : '';
    },
    handleAnswer(choice) {
      const currentQuestion = this.questions[this.currentIndex];
      this.answers[this.currentIndex] = choice;
      const isCorrect = choice === currentQuestion.correct_answer;

      if (isCorrect) {
        this.score++;
        this.animationClass = 'correct';
        this.feedbackMessage = '✅ Bravo !';
        this.launchConfetti();
      } else {
        this.animationClass = 'wrong';
        this.feedbackMessage = '❌ Oups…';
      }

      setTimeout(() => {
        this.animationClass = '';
        this.feedbackMessage = '';
        this.currentIndex++;
      }, 1000);
    }
    ,
    async submitScore() {
      if (this.scoreSubmitted) return;

      if (!this.pseudo.trim()) {
        alert('❗️Veuillez entrer un pseudo avant d’envoyer le score.');
        return;
      }

      if (!Number.isInteger(this.score) || this.score < 0 || this.score > this.questions.length) {
        alert('❌ Score invalide.');
        return;
      }

      try {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pseudo: this.pseudo, score: this.score })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);

        this.showLeaderboard = true;
        this.scoreSubmitted = true;
        localStorage.setItem('pseudo', this.pseudo);
        this.showSnackbar = true;
        setTimeout(() => (this.showSnackbar = false), 3000);
      } catch (error) {
        console.error('Erreur envoi score :', error);
        alert('❌ Échec de l’envoi du score.');
      }
    },
    launchConfetti() {
      if (window.confetti) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    },
    restartQuiz() {
      this.started = false;
      this.loading = false;
      this.questions = [];
      this.currentIndex = 0;
      this.answers = [];
      this.score = 0;
      this.feedbackMessage = '';
      this.animationClass = '';
      this.showLeaderboard = false;
      this.scoreSubmitted = false;
      this.showSnackbar = false;
    }
  }
};
</script>
