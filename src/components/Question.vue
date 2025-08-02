<template>
  <div class="question">
    <h2>{{ question.question }}</h2>
    <audio :src="question.audio_url" controls autoplay></audio>

    <ul>
      <li v-for="(choice, index) in question.choices" :key="index">
        <button @click="selectAnswer(choice)">
          {{ choice }}
        </button>
      </li>
    </ul>

    <p v-if="feedback">{{ feedback }}</p>
  </div>
</template>

<script>
export default {
  props: ['question'],
  data() {
    return {
      feedback: null,
    }
  },
  methods: {
    selectAnswer(choice) {
      if (choice === this.question.answer) {
        this.feedback = '✅ Bonne réponse !'
        this.$emit('correct')
      } else {
        this.feedback = '❌ Mauvaise réponse.'
        this.$emit('wrong')
      }
    },
  },
}
</script>

<style scoped>
.question {
  text-align: center;
}
button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
}
</style>
