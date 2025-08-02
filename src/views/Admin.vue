<template>
  <div class="admin">
    <h1>🛠️ Panneau d'administration</h1>

    <!-- 🎬 Section Cartoons -->
    <section>
      <h2>🎬 Vignettes des dessins animés</h2>
      <div v-if="cartoons.length === 0">⏳ Chargement...</div>
      <div v-for="cartoon in cartoons" :key="cartoon.name" class="block">
        <h3>{{ cartoon.name }}</h3>
        <img :src="cartoon.image_url" alt="vignette" class="vignette" />
        <input v-model="cartoon.image_url" placeholder="URL de l’image" />
        <button @click="updateImage(cartoon)">💾 Enregistrer</button>
      </div>
    </section>

    <hr />

    <!-- ❓ Section Questions -->
    <section>
      <h2>❓ Gestion des Questions</h2>
      <form @submit.prevent="addQuestion" class="form">
        <input v-model="newQuestion.audio_url" placeholder="URL audio" required />
        <input v-model="newQuestion.correct_answer" placeholder="Bonne réponse" required />
        <input v-model="choicesInput" placeholder="Choix séparés par des virgules" required />
        <button type="submit">➕ Ajouter</button>
      </form>

      <div v-if="questions.length === 0">⏳ Chargement des questions...</div>
      <div v-else>
        <div v-for="q in questions" :key="q.id" class="question">
          <strong>{{ q.correct_answer }}</strong>
          <audio :src="q.audio_url" controls></audio>
          <p>Choix : {{ JSON.parse(q.choices).join(', ') }}</p>
          <button @click="deleteQuestion(q.id)">🗑️ Supprimer</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartoons: [],
      questions: [],
      newQuestion: {
        audio_url: '',
        correct_answer: ''
      },
      choicesInput: ''
    };
  },
  async mounted() {
    await this.fetchCartoons();
    await this.fetchQuestions();
  },
  methods: {
    // 🎬 Cartoons
    async fetchCartoons() {
      try {
        const res = await fetch('http://https://blind-test-6c820b9c38e2.herokuapp.com/api/cartoons');
        this.cartoons = await res.json();
      } catch (err) {
        console.error('Erreur chargement cartoons :', err);
      }
    },
    async updateImage(cartoon) {
      try {
        await fetch(`http://https://blind-test-6c820b9c38e2.herokuapp.com/api/cartoons/${encodeURIComponent(cartoon.name)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: cartoon.image_url })
        });
      } catch (err) {
        console.error('Erreur mise à jour image :', err);
      }
    },

    // ❓ Questions
    async fetchQuestions() {
      try {
        const res = await fetch('http://https://blind-test-6c820b9c38e2.herokuapp.com/api/questions');
        this.questions = await res.json();
      } catch (err) {
        console.error('Erreur chargement questions :', err);
      }
    },
    async deleteQuestion(id) {
      try {
        await fetch(`http://https://blind-test-6c820b9c38e2.herokuapp.com/api/questions/${id}`, {
          method: 'DELETE'
        });
        await this.fetchQuestions();
      } catch (err) {
        console.error('Erreur suppression :', err);
      }
    },
    async addQuestion() {
      const choices = this.choicesInput.split(',').map(c => c.trim());
      try {
        await fetch('http://https://blind-test-6c820b9c38e2.herokuapp.com/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_url: this.newQuestion.audio_url,
            correct_answer: this.newQuestion.correct_answer,
            choices
          })
        });
        this.newQuestion.audio_url = '';
        this.newQuestion.correct_answer = '';
        this.choicesInput = '';
        await this.fetchQuestions();
      } catch (err) {
        console.error('Erreur ajout question :', err);
      }
    }
  }
};
</script>

<style scoped>
.admin {
  padding: 2em;
  font-family: sans-serif;
}
.block, .question {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 8px;
}
.vignette {
  width: 120px;
  height: auto;
  margin-bottom: 0.5em;
  border-radius: 6px;
}
.form input {
  margin: 0.5em;
  padding: 0.5em;
  width: calc(100% - 1em);
}
button {
  padding: 0.5em 1em;
  background-color: #4e54c8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #8f94fb;
}
</style>
