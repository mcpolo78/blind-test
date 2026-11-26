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
      <!-- ➕ Ajouter un générique -->
      <section>
        <h2>➕ Ajouter un générique</h2>
        <form class="search" @submit.prevent="search">
          <input v-model="query" placeholder="Rechercher sur Deezer (ex. Goldorak générique)" required />
          <button type="submit" :disabled="searching">{{ searching ? '⏳' : '🔍 Chercher' }}</button>
        </form>

        <div v-if="results.length" class="results">
          <div
            v-for="t in results"
            :key="t.id"
            :class="['result', { selected: picked && picked.id === t.id }]"
          >
            <img :src="t.cover" alt="" />
            <div class="meta">
              <strong>{{ t.title }}</strong>
              <small>{{ t.artist }} · {{ t.album }}</small>
              <audio :src="t.preview" controls preload="none"></audio>
            </div>
            <button type="button" @click="pick(t)">Choisir</button>
          </div>
        </div>

        <form v-if="picked" class="form add" @submit.prevent="addCartoon">
          <p>Titre choisi : <strong>{{ picked.title }}</strong> ({{ picked.artist }})</p>
          <input v-model="draft.name" placeholder="Nom du dessin animé (réponse affichée)" required maxlength="80" />
          <select v-model="draft.era" required>
            <option value="80">Années 70-80</option>
            <option value="2000">Années 90-2000</option>
          </select>
          <input v-model="draft.image" placeholder="Lien d'image (facultatif, sinon pochette Deezer)" />
          <button type="submit">💾 Ajouter au quiz</button>
        </form>
        <p v-if="message" class="hint">{{ message }}</p>

        <h3>Génériques ajoutés ici</h3>
        <p v-if="custom.length === 0" class="hint">Aucun pour l'instant.</p>
        <div v-for="c in custom" :key="c.id" class="question">
          <strong>{{ c.name }}</strong>
          <small>{{ c.era === '80' ? 'Années 70-80' : 'Années 90-2000' }} · Deezer {{ c.deezer_id }}</small>
          <button @click="deleteCartoon(c.id)">🗑️ Retirer</button>
        </div>
      </section>

      <hr />

      <!-- 🏆 Scores -->
      <section>
        <h2>🏆 Scores</h2>
        <div v-if="scores.length === 0">Aucun score pour l'instant.</div>
        <div v-for="s in scores" :key="s.id" class="question">
          <strong>{{ s.pseudo }}</strong> : {{ s.score }} pts
          <small>({{ new Date(s.created_at).toLocaleString('fr-FR') }})</small>
          <button @click="deleteScore(s.id)">🗑️ Supprimer</button>
        </div>
      </section>

      <hr />

      <!-- 🎬 Dessins animés -->
      <section>
        <h2>🎬 Tous les dessins animés du quiz ({{ cartoons.length }})</h2>
        <p class="hint">La liste de base se modifie dans <code>api/_lib/cartoons.js</code>.</p>
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
      cartoons: [],
      custom: [],
      query: '',
      searching: false,
      results: [],
      picked: null,
      draft: { name: '', era: '80', image: '' },
      message: ''
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
    headers(json = false) {
      const h = { 'x-admin-password': this.password };
      if (json) h['Content-Type'] = 'application/json';
      return h;
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
      await Promise.all([this.fetchCartoons(), this.fetchCustom()]);
    },
    async fetchCartoons() {
      const c = await fetch('/api/cartoons?t=' + Date.now());
      if (c.ok) this.cartoons = await c.json();
    },
    async fetchCustom() {
      const res = await fetch('/api/admin/cartoons', { headers: this.headers() });
      if (res.ok) this.custom = await res.json();
    },
    async fetchScores() {
      const res = await fetch('/api/admin/scores', { headers: this.headers() });
      if (res.ok) this.scores = await res.json();
    },
    async deleteScore(id) {
      await fetch(`/api/admin/scores?id=${id}`, { method: 'DELETE', headers: this.headers() });
      await this.fetchScores();
    },
    async search() {
      this.searching = true;
      this.message = '';
      try {
        const res = await fetch('/api/admin/cartoons?q=' + encodeURIComponent(this.query), {
          headers: this.headers()
        });
        this.results = res.ok ? await res.json() : [];
        if (!this.results.length) this.message = 'Aucun extrait trouvé.';
      } finally {
        this.searching = false;
      }
    },
    pick(t) {
      this.picked = t;
      this.draft = { name: '', era: '80', image: '' };
    },
    async addCartoon() {
      const res = await fetch('/api/admin/cartoons', {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify({ ...this.draft, deezerId: this.picked.id })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        this.message = '❌ ' + (body.error || 'Erreur ' + res.status);
        return;
      }
      this.message = `✅ ${this.draft.name} ajouté au quiz.`;
      this.picked = null;
      this.results = [];
      this.query = '';
      await Promise.all([this.fetchCustom(), this.fetchCartoons()]);
    },
    async deleteCartoon(id) {
      await fetch(`/api/admin/cartoons?id=${id}`, { method: 'DELETE', headers: this.headers() });
      await Promise.all([this.fetchCustom(), this.fetchCartoons()]);
    }
  }
};
</script>

<style scoped>
.admin {
  max-width: 900px;
  margin: auto;
  padding: 1.5em 16px;
  font-family: system-ui, sans-serif;
}
.block, .question {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 1em;
  border-radius: 8px;
  background: #fff;
}
.question {
  display: flex;
  gap: 1em;
  align-items: center;
  flex-wrap: wrap;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1em;
}
.vignette {
  width: 100%;
  max-width: 120px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  margin-bottom: 0.5em;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5em;
  background: #eef;
}
.form input, .form select, .search input {
  margin: 0.5em 0;
  padding: 0.6em;
  width: 100%;
  box-sizing: border-box;
  font-size: 1em;
}
.search {
  display: flex;
  gap: 0.5em;
  align-items: center;
}
.results {
  display: grid;
  gap: 0.5em;
  margin: 1em 0;
}
.result {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 0.75em;
  align-items: center;
  padding: 0.5em;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.result.selected {
  border-color: #4e54c8;
  box-shadow: 0 0 0 2px rgba(78, 84, 200, 0.3);
}
.result img {
  width: 64px;
  height: 64px;
  border-radius: 6px;
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.meta audio {
  width: 100%;
  height: 32px;
  margin-top: 0.25em;
}
.error {
  color: #c0392b;
}
.hint {
  color: #555;
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
@media (max-width: 560px) {
  .result {
    grid-template-columns: 48px 1fr;
  }
  .result img {
    width: 48px;
    height: 48px;
  }
  .result button {
    grid-column: 1 / -1;
  }
}
</style>
