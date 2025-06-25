import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Messenger from '../views/Messenger.vue';
import People from '../views/People.vue';
import FinancialAnalytics from '../views/FinancialAnalytics.vue';
import Profile from '../views/Profile.vue';
import UserProfile from '../views/UserProfile.vue';
import EditProfile from '../views/EditProfile.vue';
import News from '../views/News.vue';
import Education from '../views/Education.vue';
import Community from '../views/Community.vue';

// Страницы для стартаперов
import CreateStartup from '../views/startup/CreateStartup.vue';
import MyStartups from '../views/startup/MyStartups.vue';
import Grants from '../views/startup/Grants.vue';

// Страницы для инвесторов и каталог стартапов
import StartupCatalog from '../views/startups/StartupCatalog.vue';
import StartupDetails from '../views/startups/StartupDetails.vue';
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
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/:id',
    name: 'UserProfile',
    component: Profile,
    props: true,
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
  // Маршруты для стартапов
  {
    path: '/startup/create',
    name: 'CreateStartup',
    component: CreateStartup,
    meta: { requiresAuth: true, requiredRole: 'startup_founder' }
  },
  {
    path: '/startup/edit/:id',
    name: 'EditStartup',
    component: CreateStartup,
    props: true,
    meta: { requiresAuth: true, requiredRole: 'startup_founder' }
  },
  {
    path: '/startup/my-startups',
    name: 'MyStartups',
    component: MyStartups,
    meta: { requiresAuth: true, requiredRole: 'startup_founder' }
  },
  {
    path: '/startup/grants',
    name: 'Grants',
    component: Grants,
    meta: { requiresAuth: true }
  },
  // Каталог стартапов
  {
    path: '/startups',
    name: 'StartupCatalog',
    component: StartupCatalog,
    meta: { requiresAuth: true }
  },
  {
    path: '/startups/:id',
    name: 'StartupDetails',
    component: StartupDetails,
    props: true,
    meta: { requiresAuth: true }
  },
  // Маршруты для инвесторов
  {
    path: '/investor/analysis',
    name: 'StartupAnalysis',
    component: StartupAnalysis,
    meta: { requiresAuth: true }
  },
  // Маршрут для аналитики рынка
  {
    path: '/market-analytics',
    name: 'MarketAnalytics',
    component: () => import('@/views/MarketAnalytics.vue'),
    meta: { requiresAuth: true }
  },
  // Маршрут для бизнес-аналитики
  {
    path: '/businessman/analytics',
    name: 'BusinessAnalytics',
    component: BusinessAnalytics,
    meta: { requiresAuth: true }
  },
  // Маршрут для крипто-трекера
  {
    path: '/crypto/tracker',
    name: 'CryptoTracker',
    component: CryptoTracker,
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
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated) {
      next({
          path: '/login', 
          query: { redirect: to.fullPath }
        });
    } else {
      if (to.matched.some(record => record.meta.requiredRole)) {
        if (userStore.hasRole(to.meta.requiredRole)) {
          next();
        } else {
          next('/dashboard');
        }
      } else {
        next();
    }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (!userStore.isAuthenticated) {
      next();
    } else {
      next('/dashboard');
    }
  } else {
    next();
  }
});

export default router;