import { defineStore } from 'pinia'
import api from '@/axios'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    userRole: (state) => state.user?.role || '',
    userName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
    userAvatar: (state) => state.user?.avatar || ''
  },

  actions: {
    async loadUser() {
      if (this.loading) return false;
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.user = null;
        this.isAuthenticated = false;
        return false;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.get('/users/profile');
        this.user = response.data;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        this.user = user;
        this.isAuthenticated = true;

        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при входе';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.post('/auth/register', userData)
        const { token, user } = response.data

        localStorage.setItem('token', token)
        this.user = user
        this.isAuthenticated = true

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при регистрации'
        return false
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      this.error = null

      try {
        const response = await api.put('/users/profile', profileData)
        this.user = response.data
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при обновлении профиля'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      localStorage.removeItem('token')
      this.user = null
      this.isAuthenticated = false
      router.push('/')
    }
  }
}) 