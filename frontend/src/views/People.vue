<template>
  <div class="people">
    <!-- Subtle Background Pattern -->
    <div class="people-backdrop" aria-hidden="true">
      <div class="pattern-grid"></div>
      <div class="accent-blob blob-1"></div>
      <div class="accent-blob blob-2"></div>
    </div>

    <div class="people-shell">
      <!-- Hero Header -->
      <div class="people-header">
        <div class="header-left">
          <div class="header-badge">
            <i class="fas fa-users"></i>
            <span>Business Union</span>
          </div>
          <h1 class="header-title">Поиск партнеров</h1>
          <p class="header-subtitle">Найдите идеальных партнеров для развития вашего бизнеса среди {{ users.length }} участников сообщества</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
            <div class="stat-content">
              <span class="stat-number">{{ filteredUsers.length }}</span>
              <span class="stat-label">Партнеров</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-building"></i></div>
            <div class="stat-content">
              <span class="stat-number">{{ industries.length }}</span>
              <span class="stat-label">Отраслей</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-map-marker-alt"></i></div>
            <div class="stat-content">
              <span class="stat-number">{{ locations.length }}</span>
              <span class="stat-label">Городов</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="search-section">
        <div class="search-bar">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="searchQuery" 
            placeholder="Поиск по имени, компании или специализации..."
            @input="handleSearch"
          >
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="filters-row">
          <div class="filter-select">
            <i class="fas fa-user-tag"></i>
            <select v-model="selectedType" @change="handleSearch">
              <option value="">Все типы</option>
              <option value="startup_founder">Стартаперы</option>
              <option value="investor">Инвесторы</option>
              <option value="businessman">Бизнесмены</option>
              <option value="crypto_trader">Крипто-трейдеры</option>
            </select>
          </div>
          <div class="filter-select">
            <i class="fas fa-industry"></i>
            <select v-model="selectedIndustry" @change="handleSearch">
              <option value="">Все отрасли</option>
              <option v-for="industry in industries" :key="industry.id" :value="industry.id">
                {{ industry.name }}
              </option>
            </select>
          </div>
          <div class="filter-select">
            <i class="fas fa-map-marker-alt"></i>
            <select v-model="selectedLocation" @change="handleSearch">
              <option value="">Все локации</option>
              <option v-for="location in locations" :key="location.id" :value="location.id">
                {{ location.name }}
              </option>
            </select>
          </div>
          <button v-if="hasActiveFilters" class="reset-btn" @click="resetFilters">
            <i class="fas fa-redo"></i>
            Сбросить
          </button>
        </div>
      </div>

      <!-- Users Grid -->
      <div class="people-grid">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar-img">
                <div v-else class="avatar-placeholder" :class="user.userType">
                  {{ getInitials(user.fullName) }}
                </div>
              </div>
              <div class="user-type-badge" :class="user.userType">
                {{ getUserTypeLabel(user.userType) }}
              </div>
            </div>
            <div class="user-main-info">
              <h3 class="user-name">{{ user.fullName }}</h3>
              <p class="user-company" v-if="user.company">
                <i class="fas fa-building"></i>
                {{ user.company }}
              </p>
              <p class="user-title" v-if="user.title">
                <i class="fas fa-briefcase"></i>
                {{ user.title }}
              </p>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item" v-if="user.region">
                <div class="info-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">Локация</span>
                  <span class="info-value" :title="user.region">{{ user.region }}</span>
                </div>
              </div>
              <div class="info-item" v-if="user.telegram">
                <div class="info-icon telegram">
                  <i class="fab fa-telegram"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">Telegram</span>
                  <span class="info-value" :title="user.telegram">{{ user.telegram }}</span>
                </div>
              </div>
              <div class="info-item" v-if="user.phoneNumber">
                <div class="info-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">Телефон</span>
                  <span class="info-value" :title="user.phoneNumber">{{ user.phoneNumber }}</span>
                </div>
              </div>
              <div class="info-item" v-if="user.email">
                <div class="info-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="info-content">
                  <span class="info-label">Email</span>
                  <span class="info-value" :title="user.email">{{ user.email }}</span>
                </div>
              </div>
            </div>
            
            <!-- Empty State for Card -->
            <div v-if="!hasUserData(user)" class="card-empty">
              <i class="fas fa-user-edit"></i>
              <span>Профиль не заполнен</span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button class="btn-primary" @click="connectWithUser(user)">
              <i class="fas fa-paper-plane"></i>
              Написать
            </button>
            <button class="btn-secondary" @click="viewProfile(user)">
              <i class="fas fa-user"></i>
              Профиль
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredUsers.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>Никого не найдено</h3>
        <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
        <button class="btn-primary" @click="resetFilters">
          <i class="fas fa-redo"></i>
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <div class="loader">
        <div class="loader-spinner"></div>
        <span>Загрузка...</span>
      </div>
    </div>

    <!-- Connect Modal -->
    <Modal :show="showConnectModal" @close="showConnectModal = false">
      <template #header>
        <div class="modal-header">
          <div class="modal-avatar">
            <img v-if="selectedUser?.avatar" :src="selectedUser.avatar" :alt="selectedUser?.fullName">
            <div v-else class="modal-avatar-placeholder">
              {{ getInitials(selectedUser?.fullName || '') }}
            </div>
          </div>
          <div>
            <h3>Написать сообщение</h3>
            <p>{{ selectedUser?.fullName }}</p>
          </div>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="sendMessage" class="message-form">
          <label for="message-text">
            <i class="fas fa-comment"></i>
            Ваше сообщение
          </label>
          <textarea 
            id="message-text"
            v-model="messageText" 
            placeholder="Представьтесь и опишите цель вашего обращения..."
            rows="5"
          ></textarea>
          <div class="char-counter">{{ messageText.length }} / 500</div>
        </form>
      </template>
      <template #footer>
        <button class="btn-secondary" @click="showConnectModal = false">Отмена</button>
        <button class="btn-primary" @click="sendMessage" :disabled="!messageText.trim()">
          <i class="fas fa-paper-plane"></i>
          Отправить
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import usersApiService from '@/services/usersApi'

export default {
  name: 'People',
  components: { Modal },
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedIndustry = ref('')
    const selectedLocation = ref('')
    const users = ref([])
    const industries = ref([])
    const locations = ref([])
    const loading = ref(false)
    const showConnectModal = ref(false)
    const selectedUser = ref(null)
    const messageText = ref('')

    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const matchesQuery = !searchQuery.value || 
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          (user.company && user.company.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (user.tags && user.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())))
        const matchesType = !selectedType.value || user.userType === selectedType.value
        const matchesIndustry = !selectedIndustry.value || user.industryId === selectedIndustry.value
        const matchesLocation = !selectedLocation.value || user.locationId === selectedLocation.value
        return matchesQuery && matchesType && matchesIndustry && matchesLocation
      })
    })

    const hasActiveFilters = computed(() => {
      return selectedType.value || selectedIndustry.value || selectedLocation.value || searchQuery.value
    })

    const getUserTypeLabel = (type) => {
      const types = {
        startup_founder: 'Стартапер',
        investor: 'Инвестор',
        businessman: 'Бизнесмен',
        crypto_trader: 'Трейдер'
      }
      return types[type] || 'Участник'
    }

    const getInitials = (name) => {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    const resetFilters = () => {
      searchQuery.value = ''
      selectedType.value = ''
      selectedIndustry.value = ''
      selectedLocation.value = ''
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await usersApiService.getUsers()
        users.value = response.map(user => {
          const profile = user.profile || {}
          const socialLinks = profile.socialLinks || {}
          return {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            fullName: `${user.firstName || ''} ${user.lastName || ''} ${user.middleName || ''}`.trim(),
            email: user.email,
            avatar: profile.avatar || null,
            userType: user.userType || 'user',
            title: profile.position || null,
            company: profile.company || null,
            region: profile.region || null,
            address: profile.address || null,
            telegram: socialLinks.telegram || null,
            phoneNumber: profile.phoneNumber || null,
            tags: Array.isArray(profile.specialization) ? profile.specialization : [],
            industryId: profile.industryId || null,
            locationId: profile.locationId || null
          }
        })
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error)
      } finally {
        loading.value = false
      }
    }

    const loadFilters = async () => {
      industries.value = [
        { id: 1, name: 'IT и технологии' },
        { id: 2, name: 'Финансы' },
        { id: 3, name: 'Медицина' },
        { id: 4, name: 'Образование' },
        { id: 5, name: 'Недвижимость' }
      ]
      locations.value = [
        { id: 1, name: 'Москва' },
        { id: 2, name: 'Санкт-Петербург' },
        { id: 3, name: 'Новосибирск' },
        { id: 4, name: 'Екатеринбург' },
        { id: 5, name: 'Казань' }
      ]
    }

    const handleSearch = () => {}
    const connectWithUser = (user) => {
      selectedUser.value = user
      showConnectModal.value = true
    }
    const viewProfile = (user) => router.push(`/profile/${user.id}`)

    const sendMessage = async () => {
      if (!messageText.value.trim()) return
      try {
        const messengerService = await import('@/services/messenger.service')
        const chatResponse = await messengerService.default.createPersonalChat(selectedUser.value.id)
        await messengerService.default.sendMessage({
          chatId: chatResponse.data.id,
          text: messageText.value.trim(),
          type: 'text'
        })
        showConnectModal.value = false
        messageText.value = ''
        router.push('/messenger')
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
        alert('Произошла ошибка при отправке сообщения.')
      }
    }

    const hasUserData = (user) => {
      return user.company || user.title || user.region || user.telegram || user.phoneNumber || user.email
    }

    onMounted(() => {
      loadUsers()
      loadFilters()
    })

    return {
      searchQuery, selectedType, selectedIndustry, selectedLocation,
      users, industries, locations, loading, showConnectModal,
      selectedUser, messageText, filteredUsers, hasActiveFilters,
      getUserTypeLabel, getInitials, resetFilters, handleSearch,
      connectWithUser, viewProfile, sendMessage, hasUserData
    }
  }
}
</script>

<style scoped>
/* Base */
.people {
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
  overflow-x: hidden;
}

.people-shell {
  padding: 1rem;
  position: relative;
  z-index: 2;
}

/* Background */
.people-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 1px 1px, rgba(37,99,235,0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.pattern-grid,
.accent-blob,
.blob-1,
.blob-2 {
  display: none;
}

/* Header */
.people-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  color: #fff;
  box-shadow: 0 8px 30px rgba(37,99,235,0.2);
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.header-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.85;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Search Section */
.search-section {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.875rem 2.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-bar input::placeholder {
  color: #94a3b8;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: #e2e8f0;
  border: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #cbd5e1;
  color: #1e293b;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select i {
  position: absolute;
  left: 0.875rem;
  color: #64748b;
  font-size: 0.85rem;
  pointer-events: none;
  z-index: 1;
}

.filter-select select {
  padding: 0.625rem 2rem 0.625rem 2.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  min-width: 160px;
}

.filter-select select:hover {
  border-color: #cbd5e1;
}

.filter-select select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.625rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #fee2e2;
}

/* Users Grid */
.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

/* User Card */
.user-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.user-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

/* Card Header */
.card-header {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.avatar-placeholder.investor {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.avatar-placeholder.businessman {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.avatar-placeholder.crypto_trader {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.user-type-badge {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.user-type-badge.startup_founder {
  background: #dbeafe;
  color: #1d4ed8;
}

.user-type-badge.investor {
  background: #ede9fe;
  color: #6d28d9;
}

.user-type-badge.businessman {
  background: #d1fae5;
  color: #047857;
}

.user-type-badge.crypto_trader {
  background: #fef3c7;
  color: #b45309;
}

.user-main-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.user-company,
.user-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.user-company {
  color: #2563eb;
  font-weight: 500;
}

.user-company i,
.user-title i {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Card Body */
.card-body {
  padding: 0.875rem 1.25rem;
  flex: 1;
  min-height: 100px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.6rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: background 0.2s ease;
  overflow: hidden;
  min-width: 0;
}

.info-item:hover {
  background: #f1f5f9;
}

.info-icon {
  width: 32px;
  height: 32px;
  background: #e0e7ff;
  color: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.info-icon.telegram {
  background: #e0f2fe;
  color: #0284c7;
}

.info-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.info-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 0.1rem;
}

.info-value {
  font-size: 0.75rem;
  color: #1e293b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: block;
  max-width: calc(100% - 2px);
}

.card-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100px;
  color: #94a3b8;
  text-align: center;
}

.card-empty i {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.card-empty span {
  font-size: 0.85rem;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 2rem;
  color: #94a3b8;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.5rem;
}

/* Loading */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loader-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-avatar {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
}

.modal-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
}

.modal-header p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: #64748b;
}

.message-form label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.message-form textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 120px;
}

.message-form textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 1000px) {
  .people-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .header-stats {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .people-shell {
    padding: 0.75rem;
  }
  
  .people-header {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .header-stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .stat-card {
    flex: 1;
    min-width: 100px;
    padding: 0.75rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .filter-select select {
    width: 100%;
  }
  
  .people-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .people-shell {
    padding: 0.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>
