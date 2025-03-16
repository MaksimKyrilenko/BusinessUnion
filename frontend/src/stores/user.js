import { defineStore } from 'pinia'
import api from '@/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    initialized: false
  }),

  getters: {
    getUserType: (state) => state.user?.userType,
    getUserId: (state) => state.user?.id,
    getUsername: (state) => state.user?.username
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/users/login', credentials)
        this.setUser(response.data.user)
        localStorage.setItem('token', response.data.access_token)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при входе'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/users/register', userData)
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token)
          this.user = response.data.user
          this.isAuthenticated = true
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Ошибка при регистрации'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userType')
    },

    setUser(user) {
      this.user = user
      this.isAuthenticated = true
    },

    async loadUser() {
      if (!localStorage.getItem('token')) {
        this.initialized = true
        this.isAuthenticated = false
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (token) {
          this.isAuthenticated = true
          this.user = {
            id: localStorage.getItem('userId'),
            userType: localStorage.getItem('userType')
          }
        }
      } catch (error) {
        this.logout()
      } finally {
        this.initialized = true
      }
    }
  }
}) 