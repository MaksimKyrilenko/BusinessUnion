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
          <div class="avatar-container">
            <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="user-avatar">
            <div v-else class="user-avatar default-avatar">
              <i class="fas fa-user"></i>
            </div>
          </div>
          <div class="user-type-badge" :class="user.userType">
            {{ getUserTypeLabel(user.userType) }}
          </div>
        </div>
        <div class="user-info">
          <h3>{{ user.fullName }}</h3>
          
          <div class="user-info-content">
            <!-- Показываем информацию при наличии -->
            <template v-if="hasUserData(user)">
              <p class="user-company" v-if="user.company"><i class="fas fa-building"></i> {{ user.company }}</p>
              <p class="user-title" v-if="user.title"><i class="fas fa-briefcase"></i> {{ user.title }}</p>
              <p class="user-region" v-if="user.region"><i class="fas fa-map-marker-alt"></i> {{ user.region }}</p>
              <p class="user-address" v-if="user.address"><i class="fas fa-home"></i> {{ user.address }}</p>
              <p class="user-telegram" v-if="user.telegram"><i class="fab fa-telegram"></i> {{ user.telegram }}</p>
              <p class="user-phone" v-if="user.phoneNumber"><i class="fas fa-phone"></i> {{ user.phoneNumber }}</p>
            </template>
            
            <!-- Показываем сообщение, если данных нет -->
            <div v-else class="empty-info-container">
              <p class="no-user-data">Информация отсутствует</p>
            </div>
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
    <Modal :show="showConnectModal" @close="showConnectModal = false">
      <template #header>
        <h3>Связаться с {{ selectedUser?.fullName }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="sendMessage" class="connect-form">
          <div class="form-group">
            <label for="message-text">Сообщение</label>
            <textarea 
              id="message-text"
              v-model="messageText" 
              placeholder="Представьтесь и опишите цель вашего обращения..."
              rows="4"
              class="message-textarea"
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
          (user.tags && user.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())))
        
        const matchesType = !selectedType.value || user.userType === selectedType.value
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
      return types[type] || 'Пользователь'
    }

    const loadUsers = async () => {
      loading.value = true
      try {
        const response = await usersApiService.getUsers()
        
        // Преобразуем полученные данные в формат, необходимый для отображения
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
      try {
        // Здесь можно добавить загрузку отраслей и локаций с сервера
        // Пока используем заглушки
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
      } catch (error) {
        console.error('Ошибка при загрузке фильтров:', error)
      }
    }

    const handleSearch = () => {
      // Фильтрация осуществляется через computed свойство filteredUsers
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
        const messengerService = await import('@/services/messenger.service')
        
        // Создаем личный чат с пользователем
        const chatResponse = await messengerService.default.createPersonalChat(selectedUser.value.id)
        const chat = chatResponse.data
        
        // Отправляем сообщение в созданный чат
        await messengerService.default.sendMessage({
          chatId: chat.id,
          text: messageText.value.trim(),
          type: 'text'
        })
        
        showConnectModal.value = false
        messageText.value = ''
        
        // После отправки сообщения перенаправляем пользователя в мессенджер
        router.push('/messenger')
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error)
        alert('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте снова.')
      }
    }

    const hasUserData = (user) => {
      return user.company || user.title || user.region || user.address || user.telegram || user.phoneNumber;
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
      sendMessage,
      hasUserData
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
  display: flex;
  flex-direction: column;
  height: 500px; /* Высота карточки */
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.user-header {
  position: relative;
  padding: 1.2rem; /* Уменьшаем отступы в шапке с 1.5rem до 1.2rem */
  background: #f8f9fa;
  text-align: center;
  flex-shrink: 0;
  height: 140px; /* Уменьшаем высоту шапки с 150px до 140px */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.avatar-container {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  position: relative;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  object-fit: cover;
}

.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #757575;
  font-size: 40px;
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

.connect-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.message-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s ease;
}

.message-textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
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
  padding: 1.5rem 1.5rem 1rem 1.5rem; /* Уменьшаю нижний отступ */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.6rem; /* Уменьшаем нижний отступ с 0.75rem до 0.6rem */
  text-align: center;
  overflow-wrap: break-word;
  line-height: 1.3; /* Оптимизируем межстрочный интервал для заголовка */
  min-height: 1.2em; /* Минимальная высота для однострочного заголовка */
  max-height: 3.9em; /* Максимальная высота для заголовка, примерно 3 строки */
  overflow: hidden; /* Скрываем очень длинные заголовки */
}

.user-info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 250px; /* Корректируем минимальную высоту для контента */
  justify-content: flex-start;
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: #ddd #f9f9f9;
  position: relative; /* Добавляем позиционирование */
}

/* Стилизация полосы прокрутки для Webkit (Chrome, Safari) */
.user-info-content::-webkit-scrollbar {
  width: 6px;
}

.user-info-content::-webkit-scrollbar-track {
  background: #f9f9f9;
  border-radius: 3px;
}

.user-info-content::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.user-info-content::-webkit-scrollbar-thumb:hover {
  background-color: #ccc;
}

/* Стили для информационных полей */
.user-company,
.user-title,
.user-region,
.user-address,
.user-telegram,
.user-phone {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.4rem 0;
  word-break: break-word;
  line-height: 1.4;
}

.user-title,
.user-region,
.user-address,
.user-telegram,
.user-phone {
  color: #666;
  font-size: 0.9rem;
}

.user-company i,
.user-title i,
.user-region i,
.user-address i,
.user-telegram i,
.user-phone i {
  flex-shrink: 0;
  margin-top: 3px;
  width: 18px;
  text-align: center;
}

.user-actions {
  padding: 1.2rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 1rem;
  margin-top: auto;
  flex-shrink: 0;
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

.empty-info-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 5px;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-user-data {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 0.8rem;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  width: 100%;
  margin: 0;
  font-size: 1rem;
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

.user-company {
  color: #2196F3;
  font-weight: 500;
}

/* Добавляем класс для длинных адресов */
.user-address {
  margin-bottom: 0.6rem; /* Чуть больше отступ после адреса, так как он часто бывает многострочным */
}
</style> 