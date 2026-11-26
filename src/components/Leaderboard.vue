<template>
  <div class="leaderboard">
    <h2>🏆 Meilleurs Scores</h2>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Pseudo</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, index) in scores" :key="entry.pseudo + index">
          <td>{{ index + 1 }}</td>
          <td>{{ entry.pseudo }}</td>
          <td>{{ entry.score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Leaderboard',
  data() {
    return {
      scores: []
    };
  },
  async mounted() {
    try {
      const res = await fetch('/api/scores/top');
      const data = await res.json();
      this.scores = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur chargement scores :', error);
    }
  }
};
</script>

<style scoped>
.leaderboard {
  max-width: 500px;
  margin: auto;
  text-align: center;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5em;
}
th {
  background-color: #f0f0f0;
}
</style>
