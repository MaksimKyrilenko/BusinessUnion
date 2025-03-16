import { createRouter, createWebHistory } from 'vue-router';
import Users from '../components/UsersList.vue';
import Dashboard from '../views/UserDashboard.vue';
import Login from '../components/LoginForm.vue';
import Register from '../components/RegisterForm.vue';

// Проверка авторизации
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const routes = [
  { 
    path: '/', 
    redirect: '/login', // Перенаправление на /login
  },
  { 
    path: '/users', 
    component: Users 
  },
  { 
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next('/login'); // Если пользователь не авторизован, перенаправляем на страницу входа
      } else {
        next();
      }
    },
  },
  { 
    path: '/login', 
    component: Login 
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;