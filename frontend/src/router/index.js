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
  // Юридические страницы
  {
    path: '/privacy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/legal/PrivacyPolicy.vue'),
    meta: { guest: true }
  },
  {
    path: '/terms',
    name: 'TermsOfService',
    component: () => import('@/views/legal/TermsOfService.vue'),
    meta: { guest: true }
  },
  {
    path: '/data-processing',
    name: 'DataProcessing',
    component: () => import('@/views/legal/DataProcessing.vue'),
    meta: { guest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true, transition: 'page-slide' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true, transition: 'page-slide' }
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
  {
    path: '/community/:id',
    name: 'CommunityDetail',
    component: () => import('@/views/CommunityDetail.vue'),
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
  },
  // Админ-панель
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiredRole: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/AdminUsers.vue')
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: () => import('@/views/admin/AdminProjects.vue')
      },
      {
        path: 'investments',
        name: 'AdminInvestments',
        component: () => import('@/views/admin/AdminInvestments.vue')
      },
      {
        path: 'communities',
        name: 'AdminCommunities',
        component: () => import('@/views/admin/AdminCommunities.vue')
      },
      {
        path: 'analytics',
        name: 'AdminAnalytics',
        component: () => import('@/views/admin/AdminAnalytics.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

// Защита маршрутов
router.beforeEach(async (to, from, next) => {
  try {
    const userStore = useUserStore();
    const token = localStorage.getItem('token');
    
    // Для защищенных маршрутов
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // Если есть токен, но пользователь еще не загружен, пытаемся загрузить
      if (token && !userStore.isAuthenticated && !userStore.loading) {
        try {
          await userStore.loadUser();
        } catch (error) {
          console.error('Ошибка при загрузке пользователя:', error);
        }
      }
      
      // Проверяем авторизацию после попытки загрузки
      if (!userStore.isAuthenticated && !token) {
        next({
          path: '/login', 
          query: { redirect: to.fullPath }
        });
        return;
      }
      
      // Проверяем роль, если требуется
      if (to.matched.some(record => record.meta.requiredRole)) {
        if (!userStore.hasRole(to.meta.requiredRole)) {
          next('/dashboard');
          return;
        }
      }
      
      next();
      return;
    }
    
    // Для гостевых страниц
    if (to.matched.some(record => record.meta.guest)) {
      if ((userStore.isAuthenticated || token) && from.name !== null && from.path !== to.path) {
        next('/dashboard');
        return;
      }
      next();
      return;
    }
    
    // Для остальных маршрутов
    next();
  } catch (error) {
    console.error('Ошибка в роутере:', error);
    // В случае ошибки разрешаем переход
    next();
  }
});

export default router;