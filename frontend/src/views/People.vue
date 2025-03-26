<template>
  <div class="people">
    <div class="people-header">
      <h1>Поиск партнеров</h1>
      <div class="search-filters">
        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery" 
            placeholder="Поиск по имени, компании или специализации..."
            @input="handleSearch"
          >
          <i class="fas fa-search"></i>
        </div>
        <div class="filters">
          <select v-model="selectedType" @change="handleSearch">
            <option value="">Все типы</option>
            <option value="startup_founder">Основатели стартапов</option>
            <option value="investor">Инвесторы</option>
            <option value="businessman">Бизнесмены</option>
            <option value="crypto_trader">Крипто-трейдеры</option>
          </select>
          <select v-model="selectedIndustry" @change="handleSearch">
            <option value="">Все отрасли</option>
            <option v-for="industry in industries" :key="industry.id" :value="industry.id">
              {{ industry.name }}
            </option>
          </select>
          <select v-model="selectedLocation" @change="handleSearch">
            <option value="">Все локации</option>
            <option v-for="location in locations" :key="location.id" :value="location.id">
              {{ location.name }}
            </option>
          </select>
        </div>
          </div>
        </div>

    <div class="people-grid">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-card"
      >
        <div class="user-header">
          <img :src="user.avatar || '/default-avatar.png'" :alt="user.name" class="user-avatar">
          <div class="user-type-badge" :class="user.type">
            {{ getUserTypeLabel(user.type) }}
          </div>
            </div>
            <div class="user-info">
          <h3>{{ user.name }}</h3>
          <p class="user-title">{{ user.title }}</p>
          <p class="user-company" v-if="user.company">{{ user.company }}</p>
              <div class="user-location" v-if="user.location">
                <i class="fas fa-map-marker-alt"></i>
            <span>{{ user.location }}</span>
              </div>
          <div class="user-stats">
            <div class="stat">
              <i class="fas fa-project-diagram"></i>
              <span>{{ user.projectsCount }} проектов</span>
            </div>
            <div class="stat">
              <i class="fas fa-handshake"></i>
              <span>{{ user.dealsCount }} сделок</span>
            </div>
          </div>
          <div class="user-tags">
            <span 
              v-for="tag in user.tags" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="user-actions">
          <button class="btn-primary" @click="connectWithUser(user)">
            <i class="fas fa-plus"></i>
            Связаться
          </button>
          <button class="btn-secondary" @click="viewProfile(user)">
            <i class="fas fa-user"></i>
            Профиль
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
          </div>

    <div v-if="!loading && filteredUsers.length === 0" class="no-results">
      <i class="fas fa-search"></i>
      <h3>Ничего не найдено</h3>
      <p>Попробуйте изменить параметры поиска</p>
          </div>

    <!-- Модальное окно для отправки сообщения -->
    <modal v-if="showConnectModal" @close="showConnectModal = false">
      <template #header>
        <h3>Связаться с {{ selectedUser?.name }}</h3>
      </template>
      <template #default>
        <form @submit.prevent="sendMessage" class="connect-form">
          <div class="form-group">
            <label>Сообщение</label>
            <textarea 
              v-model="messageText" 
              placeholder="Представьтесь и опишите цель вашего обращения..."
              rows="4"
            ></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button class="btn-secondary" @click="showConnectModal = false">Отмена</button>
        <button class="btn-primary" @click="sendMessage" :disabled="!messageText.trim()">
          Отправить
            </button>
      </template>
    </modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/ui/Modal.vue'
import api from '@/axios'

export default {
  name: 'People',
  components: {
    Modal
  },
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
          user.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        const matchesType = !selectedType.value || user.type === selectedType.value
        const matchesIndustry = !selectedIndustry.value || user.industryId === selectedIndustry.value
        const matchesLocation = !selectedLocation.value || user.locationId === selectedLocation.value

        return matchesQuery && matchesType && matchesIndustry && matchesLocation
      })
    })

    const getUserTypeLabel = (type) => {
      const types = {
        startup_founder: 'Стартапер',
        investor: 'Инвестор',
        businessman: 'Бизнесмен',
        crypto_trader: 'Крипто-трейдер'
      }
      return types[type] || type
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await api.get('/users')
        users.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error)
      } finally {
        loading.value = false
      }
    }

    const loadFilters = async () => {
      try {
        const [industriesResponse, locationsResponse] = await Promise.all([
          api.get('/industries'),
          api.get('/locations')
        ])
        industries.value = industriesResponse.data
        locations.value = locationsResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке фильтров:', error)
      }
    }

    const handleSearch = () => {
      // Можно добавить debounce для оптимизации
      loadUsers()
    }

    const connectWithUser = (user) => {
      selectedUser.value = user
      showConnectModal.value = true
    }

    const viewProfile = (user) => {
      router.push(`/profile/${user.id}`)
    }

    const sendMessage = async () => {
      if (!messageText.value.trim()) return

      try {
        await api.post('/messages/connect', {
          userId: selectedUser.value.id,
          message: messageText.value
        })
        
        showConnectModal.value = false
        messageText.value = ''
        
        // Показываем уведомление об успехе
        // TODO: Добавить компонент уведомлений
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
      }
    }

    onMounted(() => {
      loadUsers()
      loadFilters()
    })

    return {
      searchQuery,
      selectedType,
      selectedIndustry,
      selectedLocation,
      users,
      industries,
      locations,
      loading,
      showConnectModal,
      selectedUser,
      messageText,
      filteredUsers,
      getUserTypeLabel,
      handleSearch,
      connectWithUser,
      viewProfile,
      sendMessage
    }
  }
}
</script>

<style scoped>
.people {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  margin-top: 60px;
}

.people-header {
  margin-bottom: 2rem;
}

.people-header h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-bar {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-bar input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-bar input::placeholder {
  color: #a0aec0;
}

.search-bar i {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filters select {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.95rem;
  color: #2c3e50;
}

.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.user-header {
  position: relative;
  padding: 1.5rem;
  background: #f8f9fa;
  text-align: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  object-fit: cover;
}

.user-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.user-type-badge.startup_founder {
  background: #e3f2fd;
  color: #1976d2;
}

.user-type-badge.investor {
  background: #f3e5f5;
  color: #7b1fa2;
}

.user-type-badge.businessman {
  background: #e8f5e9;
  color: #2e7d32;
}

.user-type-badge.crypto_trader {
  background: #fff3e0;
  color: #ef6c00;
}

.user-info {
  padding: 1.5rem;
}

.user-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.user-title {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.user-company {
  color: #2196F3;
  font-weight: 500;
  margin: 0.5rem 0;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.user-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.tag {
  background: #f5f5f5;
  color: #666;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
}

.user-actions {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #2196F3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-results {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.no-results i {
  font-size: 4rem;
  color: #2196F3;
  margin-bottom: 1rem;
}

.connect-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem;
  resize: vertical;
  min-height: 100px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .people {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .user-card {
    max-width: none;
  }
}
</style> 