<template>
  <div class="community-page">
    <div class="header">
      <h1>Сообщества</h1>
    </div>

    <div class="filters">
      <div class="search-container">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск сообществ..."
            class="search-input"
          >
        </div>
        <BaseButton @click="showCreateModal = true" class="create-button">
          <i class="fas fa-plus"></i> Создать сообщество
        </BaseButton>
      </div>
      
      <div class="filter-tags">
        <button 
          v-for="category in categories" 
          :key="category.id"
          :class="['filter-tag', { active: selectedCategories.includes(category.id) }]"
          @click="toggleCategory(category.id)"
        >
          <i :class="category.icon"></i>
          {{ category.name }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка сообществ...</p>
    </div>

    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <div v-else class="communities-grid">
      <div 
        v-for="community in filteredCommunities" 
        :key="community.id"
        class="community-card"
        @click="showCommunityDetails(community)"
      >
        <div class="community-image">
          <img :src="community.image || 'https://picsum.photos/400/300'" :alt="community.name">
          <div class="community-category">
            <i :class="getCategoryIcon(community.categoryId)"></i>
          </div>
        </div>
        <div class="community-content">
          <h3>{{ community.name }}</h3>
          <p>{{ community.description }}</p>
          <div class="community-stats">
            <div class="stat">
              <i class="fas fa-users"></i>
              {{ community.members?.length || 0 }} участников
            </div>
            <div class="stat">
              <i class="fas fa-comments"></i>
              {{ community.posts?.length || 0 }} постов
            </div>
          </div>
          <div class="community-actions">
            <BaseButton 
              v-if="!isUserMember(community)" 
              @click.stop="joinCommunity(community.id)"
              variant="primary"
              size="small"
              :loading="joining"
            >
              {{ joining ? 'Присоединение...' : 'Присоединиться' }}
            </BaseButton>
            <BaseButton 
              v-else 
              @click.stop="leaveCommunity(community.id)"
              variant="secondary"
              size="small"
              :loading="leaving"
            >
              {{ leaving ? 'Выход...' : 'Покинуть' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h2>Создание сообщества</h2>
      </template>
      
      <template #default>
        <form @submit.prevent="createCommunity" class="create-form">
          <div class="form-group">
            <label>Название сообщества</label>
            <input 
              v-model="newCommunity.name" 
              type="text" 
              required
              placeholder="Введите название"
            >
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="newCommunity.description" 
              required
              placeholder="Опишите ваше сообщество"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Категория</label>
            <select v-model="newCommunity.categoryId" required>
              <option value="">Выберите категорию</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Изображение сообщества</label>
            <input type="file" @change="handleImageUpload" accept="image/*">
          </div>
        </form>
      </template>

      <template #footer>
        <button 
          @click="showCreateModal = false" 
          class="btn btn-secondary"
          type="button"
        >
          Отмена
        </button>
        <button 
          @click="createCommunity" 
          :disabled="creating"
          class="btn btn-primary"
          type="button"
        >
          {{ creating ? 'Создание...' : 'Создать' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import communitiesService from '@/services/communitiesService'

export default defineComponent({
  name: 'Community',
  components: {
    BaseButton,
    Modal
  },
  setup() {
    const router = useRouter()
    const categories = ref([])
    const communities = ref([])
    const loading = ref(false)
    const error = ref('')
    const creating = ref(false)

    const searchQuery = ref('')
    const selectedCategories = ref([])
    const showCreateModal = ref(false)
    const newCommunity = ref({
      name: '',
      description: '',
      categoryId: '',
      image: null
    })

    const loadData = async () => {
      loading.value = true
      error.value = ''
      try {
        console.log('Загружаем данные сообществ...')
        const [communitiesData, categoriesData] = await Promise.all([
          communitiesService.getCommunities(),
          communitiesService.getCategories()
        ])
        console.log('Данные загружены:', { communitiesData, categoriesData })
        communities.value = communitiesData
        categories.value = categoriesData
      } catch (err) {
        console.error('Ошибка загрузки:', err)
        if (err.response?.status === 401) {
          error.value = 'Необходимо войти в систему'
        } else if (err.response?.status === 403) {
          error.value = 'Нет доступа к данным'
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          error.value = 'Ошибка подключения к серверу'
        } else {
          error.value = `Ошибка при загрузке данных: ${err.response?.data?.message || err.message}`
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    const filteredCommunities = computed(() => {
      let filtered = communities.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(community => 
          community.name.toLowerCase().includes(query) ||
          community.description.toLowerCase().includes(query)
        )
      }

      if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(community =>
          selectedCategories.value.includes(community.categoryId)
        )
      }

      return filtered
    })

    const toggleCategory = (categoryId) => {
      const index = selectedCategories.value.indexOf(categoryId)
      if (index === -1) {
        selectedCategories.value.push(categoryId)
      } else {
        selectedCategories.value.splice(index, 1)
      }
    }

    const getCategoryIcon = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category ? category.icon : 'fas fa-users'
    }

    const createCommunity = async () => {
      if (!newCommunity.value.name || !newCommunity.value.description || !newCommunity.value.categoryId) {
        return
      }

      creating.value = true
      try {
        const communityData = {
          name: newCommunity.value.name,
          description: newCommunity.value.description,
          categoryId: parseInt(newCommunity.value.categoryId),
          isPrivate: false
        }

        const createdCommunity = await communitiesService.createCommunity(communityData)
        
        // Добавляем созданное сообщество в список без перезагрузки
        // Перезагружаем данные только если нужно получить актуальную информацию об участниках
        await loadData()
        
        showCreateModal.value = false
        
        newCommunity.value = {
          name: '',
          description: '',
          categoryId: '',
          image: null
        }
      } catch (err) {
        console.error('Ошибка при создании сообщества:', err)
        error.value = 'Ошибка при создании сообщества'
      } finally {
        creating.value = false
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        newCommunity.value.image = URL.createObjectURL(file)
      }
    }

    const showCommunityDetails = (community) => {
      router.push(`/community/${community.id}`)
    }

    const joining = ref(false)
    
    const joinCommunity = async (communityId) => {
      if (joining.value) {
        console.log('Already joining, skipping...')
        return
      }
      
      joining.value = true
      try {
        console.log('Joining community:', communityId)
        console.log('Current user ID from localStorage:', localStorage.getItem('userId'))
        console.log('Current token from localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing')
        
        await communitiesService.joinCommunity(communityId)
        console.log('Successfully joined community')
        
        // Перезагружаем данные для получения актуальной информации
        await loadData()
      } catch (err) {
        console.error('Ошибка при присоединении к сообществу:', err)
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message
        })
        error.value = 'Ошибка при присоединении к сообществу'
      } finally {
        joining.value = false
      }
    }

    const leaving = ref(false)
    
    const leaveCommunity = async (communityId) => {
      if (leaving.value) {
        console.log('Already leaving, skipping...')
        return
      }
      
      leaving.value = true
      try {
        console.log('Leaving community:', communityId)
        await communitiesService.leaveCommunity(communityId)
        console.log('Successfully left community')
        
        // Перезагружаем данные для получения актуальной информации
        await loadData()
      } catch (err) {
        console.error('Ошибка при выходе из сообщества:', err)
        error.value = 'Ошибка при выходе из сообщества'
      } finally {
        leaving.value = false
      }
    }

    const isUserMember = (community) => {
      // Получаем ID текущего пользователя из localStorage
      const currentUserId = parseInt(localStorage.getItem('userId'))
      
      console.log('Checking if user is member:', {
        currentUserId,
        communityId: community.id,
        members: community.members,
        membersCount: community.members?.length
      })
      
      if (!currentUserId || !community.members || !Array.isArray(community.members)) {
        return false
      }
      
      // Проверяем, есть ли текущий пользователь среди участников
      const isMember = community.members.some(member => {
        console.log('Checking member:', { memberUserId: member.userId, currentUserId })
        return member.userId === currentUserId
      })
      
      console.log('Is user member result:', isMember)
      return isMember
    }

    return {
      categories,
      communities,
      loading,
      error,
      creating,
      joining,
      leaving,
      searchQuery,
      selectedCategories,
      filteredCommunities,
      showCreateModal,
      newCommunity,
      toggleCategory,
      getCategoryIcon,
      createCommunity,
      handleImageUpload,
      showCommunityDetails,
      joinCommunity,
      leaveCommunity,
      isUserMember
    }
  }
})
</script>

<style scoped>
.community-page {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.75rem;
}

.filters {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-lg);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 14px;
}

.search-input {
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

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.create-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 48px;
  width: auto;
  min-width: 200px;
}

.create-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
}

.create-button i {
  font-size: 0.9rem;
}

.filter-tags {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  background: var(--card-hover);
}

.filter-tag.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fee;
  color: #c53030;
  padding: 1rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.community-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  cursor: pointer;
}

.community-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.community-image {
  position: relative;
  height: 200px;
}

.community-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community-category {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.community-content {
  padding: 1.5rem;
}

.community-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.community-content p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.community-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.community-actions {
  display: flex;
  gap: 0.5rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
  background: white;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input[type="file"] {
  padding: 0.5rem;
  background: white;
  border: 2px dashed var(--border-color);
  cursor: pointer;
  text-align: center;
}

.form-group input[type="file"]:hover {
  border-color: var(--primary-color);
  background: #f8fafc;
}

:deep(.modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

:deep(.modal-footer .base-button) {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

:deep(.modal-footer .base-button:last-child) {
  background: var(--primary-gradient);
  color: white;
  border: none;
}

:deep(.modal-footer .base-button:last-child:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

:deep(.modal-footer .base-button[variant="secondary"]) {
  background: #f1f5f9;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

:deep(.modal-footer .base-button[variant="secondary"]:hover) {
  background: #e2e8f0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.community-card {
  animation: fadeIn 0.5s ease forwards;
}

.community-card:nth-child(2) { animation-delay: 0.1s; }
.community-card:nth-child(3) { animation-delay: 0.2s; }
.community-card:nth-child(4) { animation-delay: 0.3s; }
.community-card:nth-child(5) { animation-delay: 0.4s; }
.community-card:nth-child(6) { animation-delay: 0.5s; }

/* Modal buttons */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-primary:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}
</style>
