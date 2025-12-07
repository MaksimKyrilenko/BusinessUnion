<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme"
    :title="isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'"
  >
    <span v-if="isDark">🌞</span>
    <span v-else>🌙</span>
  </button>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDark: false
    }
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark
      document.body.classList.toggle('dark-theme')
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    }
  },
  mounted() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      this.isDark = true
      document.body.classList.add('dark-theme')
    }
  }
}
</script>

<style>
/* Добавьте в App.vue или создайте отдельный файл стилей */
:root {
  --primary-color: #28a745;
  --background-color: #f8f9fa;
  --text-color: #2c3e50;
  --card-background: #ffffff;
  --border-color: #ddd;
}

.dark-theme {
  --primary-color: #2ecc71;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --card-background: #2c2c2c;
  --border-color: #404040;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.theme-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px;
  border-radius: 50%;
  border: none;
  background: var(--card-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 1000;
}
</style> 