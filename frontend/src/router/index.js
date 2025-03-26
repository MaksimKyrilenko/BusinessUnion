import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Messenger from '../views/Messenger.vue';
import People from '../views/People.vue';
import FinancialAnalytics from '../views/FinancialAnalytics.vue';
import Profile from '../views/Profile.vue';
import News from '../views/News.vue';
import Education from '../views/Education.vue';
import Community from '../views/Community.vue';
import MarketAnalytics from '../views/MarketAnalytics.vue';

// Страницы для стартаперов
import CreateStartup from '../views/startup/CreateStartup.vue';
import MyStartups from '../views/startup/MyStartups.vue';
import Grants from '../views/startup/Grants.vue';

// Страницы для инвесторов
import StartupCatalog from '../views/investor/StartupCatalog.vue';
import StartupAnalysis from '../views/investor/StartupAnalysis.vue';

// Страницы для бизнесменов
import BusinessAnalytics from '../views/businessman/MarketAnalytics.vue';

// Страницы для крипто-трейдеров
import CryptoTracker from '../views/crypto/CryptoTracker.vue';

import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { guest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/messenger',
    name: 'Messenger',
    component: Messenger,
    meta: { requiresAuth: true }
  },
  {
    path: '/people',
    name: 'People',
    component: People,
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-analytics',
    name: 'FinancialAnalytics',
    component: FinancialAnalytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/news',
    name: 'News',
    component: News,
    meta: { requiresAuth: true }
  },
  {
    path: '/education',
    name: 'Education',
    component: Education,
    meta: { requiresAuth: true }
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { requiresAuth: true }
  },
  {
    path: '/startup/create',
    name: 'CreateStartup',
    component: CreateStartup,
    meta: { requiresAuth: true }
  },
  {
    path: '/startup/my-startups',
    name: 'MyStartups',
    component: MyStartups,
    meta: { requiresAuth: true }
  },
  {
    path: '/startup/grants',
    name: 'Grants',
    component: Grants,
    meta: { requiresAuth: true }
  },
  {
    path: '/investor/catalog',
    name: 'StartupCatalog',
    component: StartupCatalog,
    meta: { requiresAuth: true }
  },
  {
    path: '/investor/analysis',
    name: 'StartupAnalysis',
    component: StartupAnalysis,
    meta: { requiresAuth: true }
  },
  {
    path: '/businessman/analytics',
    name: 'BusinessAnalytics',
    component: BusinessAnalytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/crypto/tracker',
    name: 'CryptoTracker',
    component: CryptoTracker,
    meta: { requiresAuth: true }
  },
  {
    path: '/market-analytics',
    name: 'MarketAnalytics',
    component: MarketAnalytics,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // Если переходим на страницу, требующую аутентификации
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    
    // Если нет токена, сразу на логин
    if (!token) {
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath }
      });
    }
    
    // Если есть токен, но нет данных пользователя
    if (!userStore.isAuthenticated) {
      await userStore.loadUser();
    }
    
    return next();
  }
  
  // Если пытаемся перейти на гостевую страницу будучи авторизованным
  if (to.meta.guest && userStore.isAuthenticated) {
    return next({ path: '/dashboard' });
  }
  
  next();
});

export default router;