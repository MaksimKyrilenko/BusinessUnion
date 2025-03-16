import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Login from '../components/LoginForm.vue';
import Register from '../components/RegisterForm.vue';
import Profile from '../views/Profile.vue';
import ProjectDetails from '../views/ProjectDetails.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  { 
    path: '/', 
    redirect: '/dashboard'
  },
  { 
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    component: () => import('../views/ProfileEdit.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    component: () => import('../views/Projects.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    component: () => import('../views/Messages.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    component: ProjectDetails,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Защита роутов
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router;