<template>
  <div id="app">
    <!-- Проверка, отображается ли что-то -->
    <h1 v-if="!isAuthenticated">Добро пожаловать!</h1>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: localStorage.getItem('token') !== null,
    };
  },
  watch: {
    '$route': function () {
      this.isAuthenticated = localStorage.getItem('token') !== null;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 60px;
}
</style>