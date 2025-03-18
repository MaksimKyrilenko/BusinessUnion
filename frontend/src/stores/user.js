import { defineStore } from 'pinia'
import api from '@/axios'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null
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
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data
        
        if (!token || !user || !user.id || !user.userType) {
          throw new Error('Некорректные данные пользователя')
        }

        localStorage.setItem('token', token)
        localStorage.setItem('userType', user.userType)
        localStorage.setItem('userId', user.id)
        
        this.user = user
        this.isAuthenticated = true
        
        router.push('/dashboard')
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

    async logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userType')
      this.user = null
      this.isAuthenticated = false
      router.push('/')
    },

    async loadUser() {
      if (!localStorage.getItem('token')) {
        this.isAuthenticated = false
        this.user = null
        return
      }

      try {
        const userId = localStorage.getItem('userId')
        const userType = localStorage.getItem('userType')
        
        if (userId && userType) {
          this.user = {
            id: userId,
            userType: userType
          }
          this.isAuthenticated = true
        } else {
          await this.logout()
        }
      } catch (error) {
        await this.logout()
      }
    }
  }
}) 