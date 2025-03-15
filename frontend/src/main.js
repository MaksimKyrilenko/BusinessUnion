import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index'; // Импортируем файл index.js из папки router

createApp(App)
  .use(router) // Используем роутер
  .mount('#app'); // Монтируем приложение в #app