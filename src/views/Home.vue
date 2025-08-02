<template>
  <div class="home">
    <h1>🎵 Blind Test Musical</h1>
    <p>Devine le titre ou l’artiste à partir d’un extrait audio.</p>

    <div class="themes">
      <h2>Choisis un thème :</h2>
      <button @click="startQuiz('pop')">Pop</button>
      <button @click="startQuiz('rock')">Rock</button>
      <button @click="startQuiz('rap')">Rap</button>
    </div>

    <button class="start" @click="startQuiz()">Commencer le quiz</button>
  </div>
</template>

<script>
export default {
  methods: {
    startQuiz(theme) {
      // Tu peux passer le thème à App.vue via un event ou un store
      this.$emit('start', theme || 'default')
    },
  },
}
</script>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}
button {
  margin: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
.themes {
  margin-bottom: 2rem;
}
</style>
