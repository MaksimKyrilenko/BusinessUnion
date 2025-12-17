import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router'; // Импортируем файл index.js из папки router
import Loader from './components/ui/Loader.vue';
import Notification from './components/ui/Notification.vue';
import OnlineStatus from './components/ui/OnlineStatus.vue';
import TypingIndicator from './components/ui/TypingIndicator.vue';
import NotificationBell from './components/ui/NotificationBell.vue';
import { useVuelidate } from '@vuelidate/core'; // Исправляем импорт
import { animate } from './directives/animate';
import 'animate.css/animate.min.css'; // Исправленный импорт
import './assets/styles/global.css'; // Добавляем глобальные стили
import websocketService from './services/websocket.service'; // WebSocket сервис
// Font Awesome загружается через CDN в index.html

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);

// Регистрируем Vuelidate как плагин
app.config.globalProperties.$v = useVuelidate;

app.directive('animate', animate);

// Регистрируем глобальные компоненты
app.component('Loader', Loader);
app.component('Notification', Notification);
app.component('OnlineStatus', OnlineStatus);
app.component('TypingIndicator', TypingIndicator);
app.component('NotificationBell', NotificationBell);

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

// Инициализируем WebSocket после монтирования приложения
// Подключение произойдет автоматически если есть токен
router.isReady().then(() => {
  const token = localStorage.getItem('token');
  if (token) {
    websocketService.connect();
  }
});

// Переподключаем WebSocket при логине
router.afterEach((to, from) => {
  // Если пользователь только что залогинился
  if (to.path !== '/login' && to.path !== '/register') {
    const token = localStorage.getItem('token');
    if (token && !websocketService.connected) {
      websocketService.connect();
    }
  }
});