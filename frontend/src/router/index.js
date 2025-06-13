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
import MarketAnalytics from '../views/MarketAnalytics.vue';

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
    path: '/startups',
    name: 'StartupCatalog',
    component: StartupCatalog,
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
  },
  {
    path: '/investor/analysis',
    name: 'StartupAnalysis',
    component: StartupAnalysis,
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
  
  try {
    // Проверяем авторизацию пользователя
    const token = localStorage.getItem('token');
    const isAuthenticated = token && userStore.isAuthenticated;
    
    // Если есть токен, но нет данных пользователя, загружаем их
    if (token && !userStore.isAuthenticated) {
      await userStore.loadUser();
    }
    
    // Если маршрут требует авторизации
    if (to.meta.requiresAuth) {
      // Если пользователь не авторизован
      if (!token) {
        console.log('Перенаправление на логин: требуется авторизация');
        return next({ 
          path: '/login', 
          query: { redirect: to.fullPath }
        });
      }
      
      // Проверка роли пользователя
      if (to.meta.requiredRole) {
        const userType = userStore.user?.userType || localStorage.getItem('userType');
        
        if (userType !== to.meta.requiredRole) {
          console.warn(`Доступ запрещен: требуется роль ${to.meta.requiredRole}, текущая роль: ${userType}`);
          return next({ path: '/dashboard' });
        }
      }
      
      return next();
    }
    
    // Если страница для гостей, а пользователь авторизован
    if (to.meta.guest && isAuthenticated) {
      console.log('Перенаправление авторизованного пользователя с гостевой страницы');
      return next({ path: '/dashboard' });
    }
    
    // В остальных случаях разрешаем переход
    return next();
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error);
    // В случае ошибки очищаем данные авторизации и перенаправляем на логин
    localStorage.removeItem('token');
    userStore.clearUserData();
    return next({ path: '/login' });
  }
});

export default router;