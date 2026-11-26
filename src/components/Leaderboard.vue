<template>
  <div class="leaderboard">
    <h2>🏆 Meilleurs scores</h2>
    <div class="tabs" role="tablist">
      <button
        v-for="p in periods"
        :key="p.id"
        type="button"
        role="tab"
        :aria-selected="period === p.id"
        :class="['tab', { active: period === p.id }]"
        @click="setPeriod(p.id)"
      >
        {{ p.label }}
      </button>
    </div>

    <p v-if="loading" class="hint">⏳ Chargement…</p>
    <p v-else-if="scores.length === 0" class="hint">Aucun score pour l'instant. À toi de jouer !</p>
    <table v-else>
      <thead>
        <tr>
          <th>#</th>
          <th>Pseudo</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in scores" :key="entry.pseudo + index">
          <td>{{ medal(index) }}</td>
          <td>{{ entry.pseudo }}</td>
          <td>{{ entry.score }} pts</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Leaderboard',
  props: {
    refreshKey: { type: Number, default: 0 }
  },
  data() {
    return {
      periods: [
        { id: 'day', label: 'Aujourd’hui' },
        { id: 'week', label: 'Cette semaine' },
        { id: 'all', label: 'Depuis toujours' }
      ],
      period: 'week',
      scores: [],
      loading: false
    };
  },
  watch: {
    refreshKey() {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  methods: {
    setPeriod(id) {
      this.period = id;
      this.load();
    },
    medal(i) {
      return ['🥇', '🥈', '🥉'][i] || i + 1;
    },
    async load() {
      this.loading = true;
      try {
        const res = await fetch(`/api/scores/top?period=${this.period}`);
        const data = await res.json();
        this.scores = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Erreur chargement scores :', error);
        this.scores = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.leaderboard {
  max-width: 500px;
  margin: 2em auto 0;
  text-align: center;
}
.tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25em;
}
.tab {
  margin: 0;
  padding: 0.4em 0.8em;
  font-size: 0.9em;
  background: rgba(255, 255, 255, 0.6);
  color: #333;
}
.tab.active {
  background: #4e54c8;
  color: #fff;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  overflow: hidden;
}
th, td {
  padding: 0.5em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
th {
  background-color: rgba(78, 84, 200, 0.12);
}
</style>
