import { createRouter, createWebHistory } from 'vue-router';
import Users from '../components/UsersList.vue';
import Login from '../components/LoginForm.vue';
import Register from '../components/RegisterForm.vue';
import UserDashboard from '../components/UserDashboard.vue';

// Проверка авторизации
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login 
  },
  { 
    path: '/register',
    name: 'Register',
    component: Register
  },
  { 
    path: '/dashboard',
    name: 'Dashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/users', 
    component: Users 
  },
  {
    path: '/auth/vk/callback',
    name: 'VKCallback',
    component: {
      template: '<div>Обработка авторизации...</div>',
      created() {
        // Получаем код из URL
        const code = this.$route.query.code;
        if (code) {
          // Отправляем код на бэкенд
          fetch('/api/auth/vk/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
          })
          .then(response => response.json())
          .then(data => {
            localStorage.setItem('token', data.token);
            this.$router.push('/dashboard');
          })
          .catch(error => {
            console.error('Error:', error);
            this.$router.push('/login');
          });
        }
      }
    }
  },
  {
    path: '/auth-success',
    name: 'AuthSuccess',
    component: {
      template: '<div>Авторизация...</div>',
      created() {
        const token = this.$route.query.token;
        if (token) {
          localStorage.setItem('token', token);
          this.$router.push('/dashboard');
        } else {
          this.$router.push('/login');
        }
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const token = localStorage.getItem('token');
    if (!token) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;