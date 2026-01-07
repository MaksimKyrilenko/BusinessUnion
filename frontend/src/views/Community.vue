<template>
  <div class="community-page">
    <!-- Blue Header -->
    <div class="page-header-blue">
      <div class="header-left">
        <div class="header-badge">
          <i class="fas fa-users"></i>
          <span>Сообщества</span>
        </div>
        <h1 class="header-title">Сообщества</h1>
        <p class="header-subtitle">Присоединяйтесь к единомышленникам и развивайте бизнес вместе</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-layer-group"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ communities.length }}</span>
            <span class="stat-label">Сообществ</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-user-friends"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ totalMembers }}</span>
            <span class="stat-label">Участников</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-th-large"></i></div>
          <div class="stat-content">
            <span class="stat-number">{{ categories.length }}</span>
            <span class="stat-label">Категорий</span>
          </div>
        </div>
      </div>
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

    <Modal :show="showCreateModal" @close="showCreateModal = false">
      <template #header>
        <h2>Создание сообщества</h2>
      </template>
      
      <template #default>
        <form @submit.prevent="createCommunity" class="create-form">
          <div class="form-group">
            <label>Название сообщества <span class="required">*</span></label>
            <input 
              v-model="newCommunity.name" 
              type="text" 
              required
              placeholder="Введите название сообщества"
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Описание <span class="required">*</span></label>
            <textarea 
              v-model="newCommunity.description" 
              required
              placeholder="Опишите ваше сообщество, его цели и тематику"
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Категория <span class="required">*</span></label>
            <select v-model="newCommunity.categoryId" required class="form-select" :disabled="categories.length === 0">
              <option value="">{{ categories.length === 0 ? 'Загрузка категорий...' : 'Выберите категорию' }}</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <p v-if="categories.length === 0" class="form-hint" style="color: #e91e63; margin-top: 0.5rem;">
              Категории загружаются...
            </p>
          </div>

          <div class="form-group">
            <label>Изображение сообщества</label>
            <div v-if="newCommunity.imagePreview" class="image-preview-container">
              <img :src="newCommunity.imagePreview" alt="Preview" class="preview-image">
              <button @click="removeImage" class="remove-image-btn" type="button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <input 
              type="file" 
              @change="handleImageUpload" 
              accept="image/*"
              id="community-image"
              style="display: none"
            >
            <label for="community-image" class="image-upload-label">
              <i class="fas fa-image"></i>
              {{ newCommunity.imagePreview ? 'Изменить изображение' : 'Загрузить изображение' }}
            </label>
            <p class="form-hint">Рекомендуемый размер: 1200x400px. Максимальный размер: 5MB</p>
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
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

    // Ключ для сохранения состояния фильтра
    const COMMUNITY_FILTER_KEY = 'community_selected_categories'

    // Сохранение и загрузка фильтра
    const saveFilter = () => {
      if (selectedCategories.value.length > 0) {
        sessionStorage.setItem(COMMUNITY_FILTER_KEY, JSON.stringify(selectedCategories.value))
      } else {
        sessionStorage.removeItem(COMMUNITY_FILTER_KEY)
      }
    }

    const loadSavedFilter = () => {
      const saved = sessionStorage.getItem(COMMUNITY_FILTER_KEY)
      if (saved) {
        try {
          selectedCategories.value = JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing saved filter:', e)
        }
      }
    }
    const newCommunity = ref({
      name: '',
      description: '',
      categoryId: '',
      image: null,
      imagePreview: null,
      imageFile: null
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
      loadSavedFilter()
      loadData()
    })

    // Загружаем категории при открытии модального окна, если они ещё не загружены
    watch(showCreateModal, async (isOpen) => {
      if (isOpen && categories.value.length === 0) {
        try {
          console.log('Загружаем категории при открытии модального окна...')
          const categoriesData = await communitiesService.getCategories()
          console.log('Категории загружены:', categoriesData)
          categories.value = categoriesData
        } catch (err) {
          console.error('Ошибка при загрузке категорий:', err)
          error.value = 'Не удалось загрузить категории. Пожалуйста, обновите страницу.'
        }
      }
    })

    const totalMembers = computed(() => {
      return communities.value.reduce((sum, c) => sum + (c.membersCount || 0), 0)
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
      saveFilter()
    }

    const getCategoryIcon = (categoryId) => {
      const category = categories.value.find(c => c.id === categoryId)
      return category ? category.icon : 'fas fa-users'
    }

    const createCommunity = async () => {
      if (!newCommunity.value.name || !newCommunity.value.description || !newCommunity.value.categoryId) {
        error.value = 'Заполните все обязательные поля'
        return
      }

      creating.value = true
      try {
        let imageUrl = null

        // Если есть файл изображения, загружаем его на сервер
        if (newCommunity.value.imageFile) {
          try {
            const uploadResult = await communitiesService.uploadImage(newCommunity.value.imageFile)
            imageUrl = uploadResult.url
            // Освобождаем локальный blob URL
            if (newCommunity.value.imagePreview && newCommunity.value.imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(newCommunity.value.imagePreview)
            }
          } catch (uploadErr) {
            console.error('Ошибка при загрузке изображения:', uploadErr)
            error.value = 'Ошибка при загрузке изображения'
            creating.value = false
            return
          }
        }

        const communityData = {
          name: newCommunity.value.name.trim(),
          description: newCommunity.value.description.trim(),
          categoryId: parseInt(newCommunity.value.categoryId),
          isPrivate: false,
          image: imageUrl
        }

        const createdCommunity = await communitiesService.createCommunity(communityData)
        
        // Перезагружаем данные для получения актуальной информации
        await loadData()
        
        showCreateModal.value = false
        
        // Очищаем форму
        if (newCommunity.value.imagePreview && newCommunity.value.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(newCommunity.value.imagePreview)
        }
        newCommunity.value = {
          name: '',
          description: '',
          categoryId: '',
          image: null,
          imagePreview: null,
          imageFile: null
        }
      } catch (err) {
        console.error('Ошибка при создании сообщества:', err)
        error.value = err.response?.data?.message || 'Ошибка при создании сообщества'
      } finally {
        creating.value = false
      }
    }

    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          // Проверяем размер файла (5MB)
          if (file.size > 5 * 1024 * 1024) {
            error.value = 'Размер файла не должен превышать 5MB'
            event.target.value = ''
            return
          }

          // Освобождаем предыдущий blob URL, если есть
          if (newCommunity.value.imagePreview && newCommunity.value.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(newCommunity.value.imagePreview)
          }
          // Показываем превью локально
          newCommunity.value.imagePreview = URL.createObjectURL(file)
          newCommunity.value.imageFile = file
        } catch (err) {
          console.error('Ошибка при обработке изображения:', err)
          error.value = 'Ошибка при обработке изображения'
        }
      }
      event.target.value = ''
    }

    const removeImage = () => {
      // Освобождаем blob URL
      if (newCommunity.value.imagePreview && newCommunity.value.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(newCommunity.value.imagePreview)
      }
      newCommunity.value.imagePreview = null
      newCommunity.value.imageFile = null
      newCommunity.value.image = null
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
      totalMembers,
      showCreateModal,
      newCommunity,
      toggleCategory,
      getCategoryIcon,
      createCommunity,
      handleImageUpload,
      removeImage,
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
  padding: 1rem;
  min-height: 100vh;
  background: #f1f5f9;
  position: relative;
}

.community-page::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(circle at 1px 1px, rgba(37, 99, 235, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

.community-page::after {
  display: none;
}

.header,
.filters,
.communities-grid,
.loading-container,
.error-message {
  position: relative;
  z-index: 1;
}

/* Blue Header */
.page-header-blue {
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
  position: relative;
  z-index: 1;
}
.page-header-blue .header-left { flex: 1; }
.page-header-blue .header-badge {
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
.page-header-blue .header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  line-height: 1.2;
}
.page-header-blue .header-subtitle {
  font-size: 0.95rem;
  opacity: 0.85;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
  color: #fff !important;
}
.page-header-blue .header-stats {
  display: flex;
  gap: 0.875rem;
  flex-shrink: 0;
}
.page-header-blue .stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}
.page-header-blue .stat-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.page-header-blue .stat-content { display: flex; flex-direction: column; }
.page-header-blue .stat-number { font-size: 1.25rem; font-weight: 700; line-height: 1; color: #fff !important; }
.page-header-blue .stat-label { font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; color: #fff !important; text-transform: none !important; letter-spacing: normal !important; }

.header h1::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 2px;
}

.filters {
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #1e293b;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.create-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: white !important;
  border: none !important;
  padding: 0.6rem 1rem !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.4rem !important;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  height: auto !important;
  min-height: unset !important;
  width: auto !important;
  min-width: unset !important;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.create-button i {
  font-size: 0.8rem;
}

.filter-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tag:hover {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.filter-tag.active {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border-color: #2563eb;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.communities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.community-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  cursor: pointer;
}

.community-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.community-image {
  position: relative;
  height: 160px;
}

.community-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community-category {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  background: #fff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.community-content {
  padding: 1.25rem;
}

.community-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
}

.community-content p {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  line-height: 1.5;
  font-size: 0.85rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.community-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.stat i {
  color: #2563eb;
  font-size: 0.75rem;
}

.community-actions {
  display: flex;
  gap: 0.5rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.7rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #f8fafc;
  transition: all 0.2s ease;
  font-family: inherit;
  width: 100%;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: #fff;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.6;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.image-preview-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-top: 0.5rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid var(--border-color);
}

.image-preview-container .preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.image-preview-container .remove-image-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.image-preview-container .remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.image-upload-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
  width: 100%;
}

.image-upload-label:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
  border-style: solid;
}

.image-upload-label i {
  font-size: 1rem;
}

.form-hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  font-style: italic;
}

:deep(.modal-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  margin-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
}

:deep(.modal-footer .btn) {
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

:deep(.modal-footer .btn-primary) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

:deep(.modal-footer .btn-primary:hover:not(:disabled)) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

:deep(.modal-footer .btn-primary:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

:deep(.modal-footer .btn-secondary) {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

:deep(.modal-footer .btn-secondary:hover) {
  background: #f1f5f9;
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
  padding: 0.7rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Responsive */
@media (max-width: 768px) {
  .community-page {
    padding: 0.75rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .page-header-blue {
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.25rem;
  }
  .page-header-blue .header-title { font-size: 1.35rem; }
  .page-header-blue .header-stats { width: 100%; justify-content: flex-start; }
  .page-header-blue .stat-card { flex: 1; min-width: 90px; }
  
  .search-container {
    flex-direction: column;
  }
  
  .search-input {
    font-size: 16px;
  }
  
  .create-button {
    width: 100%;
    justify-content: center;
  }
  
  .communities-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tags {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }
  
  .filter-tag {
    flex-shrink: 0;
  }
}

@media (max-width: 480px) {
  .community-page {
    padding: 0.5rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .filter-tags {
    gap: 0.35rem;
  }
  
  .filter-tag {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
