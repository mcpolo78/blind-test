<template>
  <div>
    <!-- <nav class="navbar">
      <router-link to="/" class="nav-link">🏠 Quiz</router-link>
      <router-link to="/admin" class="nav-link">🛠️ Admin</router-link>
    </nav> -->

    <router-view />
  </div>
</template>

<style scoped>
.navbar {
  background-color: #f8f8f8;
  padding: 1em;
  display: flex;
  gap: 1em;
  border-bottom: 1px solid #ddd;
}
.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}
.nav-link:hover {
  color: #007bff;
}
</style>
