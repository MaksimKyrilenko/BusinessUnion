import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Messenger from '../views/Messenger.vue';
import People from '../views/People.vue';
import FinancialAnalytics from '../views/FinancialAnalytics.vue';
import Profile from '../views/Profile.vue';

// Страницы для стартаперов
import CreateStartup from '../views/startup/CreateStartup.vue';
import MyStartups from '../views/startup/MyStartups.vue';
import Grants from '../views/startup/Grants.vue';

// Страницы для инвесторов
import StartupCatalog from '../views/investor/StartupCatalog.vue';
import StartupAnalysis from '../views/investor/StartupAnalysis.vue';

// Страницы для бизнесменов
import MarketAnalytics from '../views/businessman/MarketAnalytics.vue';

// Страницы для крипто-трейдеров
import CryptoTracker from '../views/crypto/CryptoTracker.vue';

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
  // Маршруты для стартаперов
  {
    path: '/startup/create',
    name: 'CreateStartup',
    component: CreateStartup,
    meta: { requiresAuth: true, roles: ['startup_founder'] }
  },
  {
    path: '/startup/my-startups',
    name: 'MyStartups',
    component: MyStartups,
    meta: { requiresAuth: true, roles: ['startup_founder'] }
  },
  {
    path: '/startup/grants',
    name: 'Grants',
    component: Grants,
    meta: { requiresAuth: true, roles: ['startup_founder'] }
  },
  // Маршруты для инвесторов
  {
    path: '/investor/catalog',
    name: 'StartupCatalog',
    component: StartupCatalog,
    meta: { requiresAuth: true, roles: ['investor'] }
  },
  {
    path: '/investor/analysis',
    name: 'StartupAnalysis',
    component: StartupAnalysis,
    meta: { requiresAuth: true, roles: ['investor'] }
  },
  // Маршруты для бизнесменов
  {
    path: '/businessman/analytics',
    name: 'MarketAnalytics',
    component: MarketAnalytics,
    meta: { requiresAuth: true, roles: ['businessman'] }
  },
  // Маршруты для крипто-трейдеров
  {
    path: '/crypto/tracker',
    name: 'CryptoTracker',
    component: CryptoTracker,
    meta: { requiresAuth: true, roles: ['crypto_trader'] }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && isAuthenticated) {
    next('/dashboard');
  } else if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;