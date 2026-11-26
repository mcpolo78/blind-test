<template>
  <div class="admin">
    <h1>🛠️ Admin du blind test</h1>

    <!-- 🔒 Connexion -->
    <form v-if="!authed" @submit.prevent="login" class="form">
      <input v-model="password" type="password" placeholder="Mot de passe admin" required />
      <button type="submit">🔓 Entrer</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <template v-else>
      <p v-if="message" class="hint flash" aria-live="polite">{{ message }}</p>

      <!-- 📚 Playlists -->
      <section>
        <h2>📚 Playlists</h2>
        <div v-for="(p, i) in playlists" :key="p.id" :class="['question', { selected: current && current.id === p.id }]">
          <template v-if="renaming === p.id">
            <input v-model="renameDraft" maxlength="80" class="grow" @keyup.enter="renamePlaylist(p)" />
            <button @click="renamePlaylist(p)">💾</button>
            <button class="ghost" @click="renaming = null">Annuler</button>
          </template>
          <template v-else>
            <button class="link grow" @click="openPlaylist(p)">
              <strong>{{ p.name }}</strong>
              <small> · {{ p.count }} son{{ p.count > 1 ? 's' : '' }}</small>
              <small v-if="p.count < 4" class="warn"> · 4 sons minimum pour jouer</small>
            </button>
            <button class="ghost" :disabled="i === 0" aria-label="Monter" @click="movePlaylist(p, 'up')">↑</button>
            <button class="ghost" :disabled="i === playlists.length - 1" aria-label="Descendre" @click="movePlaylist(p, 'down')">↓</button>
            <button class="ghost" @click="startRename(p)">✏️ Renommer</button>
            <button class="danger" @click="deletePlaylist(p)">🗑️</button>
          </template>
        </div>
        <form class="search" @submit.prevent="createPlaylist">
          <input v-model="newPlaylist" placeholder="Nouvelle playlist (ex. Séries TV)" maxlength="80" required />
          <button type="submit">➕ Créer</button>
        </form>
      </section>

      <!-- 🎵 Sons de la playlist ouverte -->
      <section v-if="current">
        <hr />
        <h2>🎵 {{ current.name }}</h2>

        <h3>➕ Ajouter un son</h3>
        <form class="search" @submit.prevent="search">
          <input v-model="query" placeholder="Rechercher sur Deezer (ex. Friends générique)" required />
          <button type="submit" :disabled="searching">{{ searching ? '⏳' : '🔍 Chercher' }}</button>
        </form>

        <div v-if="results.length" class="results">
          <div v-for="t in results" :key="t.id" :class="['result', { selected: picked && picked.id === t.id }]">
            <img :src="t.cover" alt="" />
            <div class="meta">
              <strong>{{ t.title }}</strong>
              <small>{{ t.artist }} · {{ t.album }}</small>
              <audio :src="t.preview" controls preload="none"></audio>
            </div>
            <button type="button" @click="pick(t)">Choisir</button>
          </div>
        </div>

        <form v-if="picked" class="form add" @submit.prevent="addTrack">
          <p>Titre choisi : <strong>{{ picked.title }}</strong> ({{ picked.artist }})</p>
          <input v-model="draft.name" placeholder="Réponse affichée (ex. Friends)" required maxlength="80" />
          <input v-model="draft.image" placeholder="Lien d'image https (facultatif, sinon pochette Deezer)" />
          <button type="submit">💾 Ajouter à {{ current.name }}</button>
        </form>

        <h3>Sons ({{ tracks.length }})</h3>
        <p v-if="loadingTracks" class="hint">⏳ Chargement…</p>
        <p v-else-if="tracks.length === 0" class="hint">Aucun son pour l'instant.</p>
        <div v-for="t in tracks" :key="t.id" class="track">
          <img v-if="t.image_url" :src="t.image_url" alt="" class="thumb" />
          <span v-else class="thumb">🎬</span>

          <div v-if="editing === t.id" class="meta grow">
            <input v-model="editDraft.name" maxlength="80" placeholder="Nom" />
            <input v-model="editDraft.image" placeholder="Lien d'image https (vide = pochette Deezer)" />
            <select v-model.number="editDraft.playlistId" aria-label="Playlist">
              <option v-for="p in playlists" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <div class="row">
              <button @click="saveTrack(t)">💾 Enregistrer</button>
              <button class="ghost" @click="editing = null">Annuler</button>
            </div>
          </div>
          <div v-else class="meta grow">
            <strong>{{ t.name }}</strong>
            <small v-if="!t.available" class="warn">Extrait indisponible sur Deezer : ce son n'est pas joué</small>
            <audio v-if="t.audio_url" :src="t.audio_url" controls preload="none"></audio>
          </div>

          <div v-if="editing !== t.id" class="row">
            <button class="ghost" @click="startEdit(t)">✏️</button>
            <button class="danger" @click="deleteTrack(t)">🗑️ Retirer</button>
          </div>
        </div>
      </section>

      <hr />

      <!-- 🏆 Scores -->
      <section>
        <h2>🏆 Scores</h2>
        <div v-if="scores.length === 0">Aucun score pour l'instant.</div>
        <div v-for="s in scores" :key="s.id" class="question">
          <strong>{{ s.pseudo }}</strong> : {{ s.score }} pts
          <small>({{ playlistName(s.mode) }}, {{ new Date(s.created_at).toLocaleString('fr-FR') }})</small>
          <button class="danger" @click="deleteScore(s.id)">🗑️ Supprimer</button>
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
      message: '',
      scores: [],
      playlists: [],
      current: null,
      tracks: [],
      loadingTracks: false,
      newPlaylist: '',
      renaming: null,
      renameDraft: '',
      query: '',
      searching: false,
      results: [],
      picked: null,
      draft: { name: '', image: '' },
      editing: null,
      editDraft: { name: '', image: '', playlistId: null }
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
    async api(path, { method = 'GET', body } = {}) {
      const res = await fetch(path, {
        method,
        headers: this.headers(body !== undefined),
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
      const data = res.status === 204 ? null : await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.error) || 'Erreur ' + res.status);
      return data;
    },
    flash(text) {
      this.message = text;
      clearTimeout(this.flashTimer);
      this.flashTimer = setTimeout(() => (this.message = ''), 4000);
    },
    async run(fn) {
      try {
        await fn();
      } catch (e) {
        this.flash('❌ ' + e.message);
      }
    },
    async login() {
      this.error = '';
      try {
        this.scores = await this.api('/api/admin/scores');
      } catch (e) {
        this.error = e.message;
        this.authed = false;
        return;
      }
      this.authed = true;
      try {
        sessionStorage.setItem(KEY, this.password);
      } catch {
        /* ignore */
      }
      await this.fetchPlaylists();
      if (this.playlists.length) await this.openPlaylist(this.playlists[0]);
    },
    playlistName(slug) {
      if (slug === 'all') return 'Tout mélanger';
      const p = this.playlists.find((x) => x.slug === slug);
      return p ? p.name : slug;
    },
    async fetchPlaylists() {
      this.playlists = await this.api('/api/admin/playlists');
      if (this.current) this.current = this.playlists.find((p) => p.id === this.current.id) || null;
    },
    async fetchTracks() {
      if (!this.current) return;
      this.loadingTracks = true;
      try {
        this.tracks = await this.api('/api/admin/playlists?id=' + this.current.id);
      } finally {
        this.loadingTracks = false;
      }
    },
    async openPlaylist(p) {
      this.current = p;
      this.results = [];
      this.picked = null;
      this.editing = null;
      await this.run(() => this.fetchTracks());
    },
    createPlaylist() {
      return this.run(async () => {
        const name = this.newPlaylist.trim();
        const { id } = await this.api('/api/admin/playlists', { method: 'POST', body: { name } });
        this.newPlaylist = '';
        await this.fetchPlaylists();
        const created = this.playlists.find((p) => p.id === id);
        if (created) await this.openPlaylist(created);
        this.flash(`✅ Playlist « ${name} » créée. Ajoute au moins 4 sons pour qu'elle soit jouable.`);
      });
    },
    startRename(p) {
      this.renaming = p.id;
      this.renameDraft = p.name;
    },
    renamePlaylist(p) {
      return this.run(async () => {
        await this.api('/api/admin/playlists?id=' + p.id, { method: 'PATCH', body: { name: this.renameDraft } });
        this.renaming = null;
        await this.fetchPlaylists();
      });
    },
    movePlaylist(p, move) {
      return this.run(async () => {
        await this.api('/api/admin/playlists?id=' + p.id, { method: 'PATCH', body: { move } });
        await this.fetchPlaylists();
      });
    },
    deletePlaylist(p) {
      if (!window.confirm(`Supprimer la playlist « ${p.name} » et ses ${p.count} sons ?`)) return;
      return this.run(async () => {
        await this.api('/api/admin/playlists?id=' + p.id, { method: 'DELETE' });
        if (this.current && this.current.id === p.id) {
          this.current = null;
          this.tracks = [];
        }
        await this.fetchPlaylists();
        this.flash(`🗑️ Playlist « ${p.name} » supprimée.`);
      });
    },
    search() {
      return this.run(async () => {
        this.searching = true;
        try {
          this.results = await this.api('/api/admin/tracks?q=' + encodeURIComponent(this.query));
          if (!this.results.length) this.flash('Aucun extrait trouvé.');
        } finally {
          this.searching = false;
        }
      });
    },
    pick(t) {
      this.picked = t;
      this.draft = { name: '', image: '' };
    },
    addTrack() {
      return this.run(async () => {
        await this.api('/api/admin/tracks', {
          method: 'POST',
          body: { ...this.draft, deezerId: this.picked.id, playlistId: this.current.id }
        });
        this.flash(`✅ ${this.draft.name} ajouté à ${this.current.name}.`);
        this.picked = null;
        this.results = [];
        this.query = '';
        await Promise.all([this.fetchTracks(), this.fetchPlaylists()]);
      });
    },
    startEdit(t) {
      this.editing = t.id;
      this.editDraft = { name: t.name, image: t.image || '', playlistId: this.current.id };
    },
    saveTrack(t) {
      return this.run(async () => {
        const body = { name: this.editDraft.name };
        if (this.editDraft.image.trim() !== (t.image || '')) body.image = this.editDraft.image.trim();
        if (this.editDraft.playlistId !== this.current.id) body.playlistId = this.editDraft.playlistId;
        await this.api('/api/admin/tracks?id=' + t.id, { method: 'PATCH', body });
        this.editing = null;
        await Promise.all([this.fetchTracks(), this.fetchPlaylists()]);
      });
    },
    deleteTrack(t) {
      if (!window.confirm(`Retirer « ${t.name} » de ${this.current.name} ?`)) return;
      return this.run(async () => {
        await this.api('/api/admin/tracks?id=' + t.id, { method: 'DELETE' });
        await Promise.all([this.fetchTracks(), this.fetchPlaylists()]);
        this.flash(`🗑️ ${t.name} retiré.`);
      });
    },
    deleteScore(id) {
      return this.run(async () => {
        await this.api(`/api/admin/scores?id=${id}`, { method: 'DELETE' });
        this.scores = await this.api('/api/admin/scores');
      });
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
.selected {
  border-color: #4e54c8;
  box-shadow: 0 0 0 2px rgba(78, 84, 200, 0.3);
}
.grow {
  flex: 1;
  min-width: 0;
}
.row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.track {
  display: flex;
  gap: 0.75em;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.6em;
  margin-bottom: 0.6em;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.track .meta input,
.track .meta select {
  padding: 0.5em;
  margin: 0.2em 0;
  font-size: 1em;
}
.thumb {
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 6px;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6em;
  background: #eef;
}
button.link {
  background: none;
  color: inherit;
  text-align: left;
  padding: 0;
}
button.link:hover {
  background: none;
  text-decoration: underline;
}
button.ghost {
  background: #eef;
  color: #333;
}
button.ghost:hover {
  background: #dde;
}
button.danger {
  background: #c0392b;
}
button.danger:hover {
  background: #e05545;
}
button:disabled {
  opacity: 0.4;
  cursor: default;
}
.warn {
  color: #b9770e;
}
.flash {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f4f4ff;
  padding: 0.6em 1em;
  border-radius: 6px;
}
</style>
