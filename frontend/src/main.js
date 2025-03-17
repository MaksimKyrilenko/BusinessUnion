import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Импортируем файл index.js из папки router
import Loader from './components/ui/Loader.vue';
import Notification from './components/ui/Notification.vue';
import { useVuelidate } from '@vuelidate/core'; // Исправляем импорт
import { animate } from './directives/animate';
import 'animate.css/animate.min.css'; // Исправленный импорт
import './assets/styles/global.css'; // Добавляем глобальные стили

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Регистрируем Vuelidate как плагин
app.config.globalProperties.$v = useVuelidate;

app.directive('animate', animate);

// Регистрируем глобальные компоненты
app.component('Loader', Loader);
app.component('Notification', Notification);

// Глобальные миксины
app.mixin({
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU');
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount);
    }
  }
});

app.mount('#app'); // Монтируем приложение в #app