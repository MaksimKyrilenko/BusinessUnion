<template>
  <div class="login-container">
    <button @click="loginWithVK" class="vk-login-button">
      Войти через ВКонтакте
    </button>
  </div>
</template>

<script>
export default {
  name: 'VKLogin',
  methods: {
    loginWithVK() {
      window.location.href = '/api/auth/vk';
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.vk-login-button {
  background-color: #0077FF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  min-width: 200px;
}

.vk-login-button:hover {
  background-color: #0066CC;
}
</style> 