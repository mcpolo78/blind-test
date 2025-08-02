<template>
  <div class="score">
    <h2>Ton score final : {{ score }}/{{ total }}</h2>
    <button @click="$emit('restart')">Rejouer</button>
  </div>
</template>

<script lang="ts">
export default {
  props: ['score', 'total'],
}
</script>

<style scoped>
.score {
  text-align: center;
}
</style>
