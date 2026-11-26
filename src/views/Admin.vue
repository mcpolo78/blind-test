<template>
  <div class="admin">
    <h1>🛠️ Panneau d'administration</h1>

    <!-- 🔒 Connexion -->
    <form v-if="!authed" @submit.prevent="login" class="form">
      <input v-model="password" type="password" placeholder="Mot de passe admin" required />
      <button type="submit">🔓 Entrer</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <template v-else>
      <!-- 🏆 Scores -->
      <section>
        <h2>🏆 Scores</h2>
        <div v-if="scores.length === 0">Aucun score pour l'instant.</div>
        <div v-for="s in scores" :key="s.id" class="question">
          <strong>{{ s.pseudo }}</strong> : {{ s.score }}
          <small>({{ new Date(s.created_at).toLocaleString('fr-FR') }})</small>
          <button @click="deleteScore(s.id)">🗑️ Supprimer</button>
        </div>
      </section>

      <hr />

      <!-- 🎬 Dessins animés -->
      <section>
        <h2>🎬 Dessins animés du quiz</h2>
        <p class="hint">La liste se modifie dans <code>api/_lib/cartoons.js</code> (identifiants Deezer).</p>
        <div class="grid">
          <div v-for="cartoon in cartoons" :key="cartoon.name" class="block">
            <img v-if="cartoon.image_url" :src="cartoon.image_url" alt="" class="vignette" />
            <div v-else class="vignette">🎬</div>
            <p>{{ cartoon.name }}</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
const KEY = 'blindtest-admin'

export default {
  data() {
    return {
      authed: false,
      password: '',
      error: '',
      scores: [],
      cartoons: []
    };
  },
  async mounted() {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) {
        this.password = saved;
        await this.login();
      }
    } catch {
      /* sessionStorage indisponible */
    }
  },
  methods: {
    headers() {
      return { 'x-admin-password': this.password };
    },
    async login() {
      this.error = '';
      const res = await fetch('/api/admin/scores', { headers: this.headers() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        this.error = body.error || 'Erreur ' + res.status;
        this.authed = false;
        return;
      }
      this.scores = await res.json();
      this.authed = true;
      try {
        sessionStorage.setItem(KEY, this.password);
      } catch {
        /* ignore */
      }
      const c = await fetch('/api/cartoons');
      if (c.ok) this.cartoons = await c.json();
    },
    async fetchScores() {
      const res = await fetch('/api/admin/scores', { headers: this.headers() });
      if (res.ok) this.scores = await res.json();
    },
    async deleteScore(id) {
      await fetch(`/api/admin/scores?id=${id}`, { method: 'DELETE', headers: this.headers() });
      await this.fetchScores();
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
.question {
  display: flex;
  gap: 1em;
  align-items: center;
  flex-wrap: wrap;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1em;
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
.error {
  color: #c0392b;
}
.hint {
  color: #666;
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
