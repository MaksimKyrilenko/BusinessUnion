<template>
  <div class="community-detail">
    <!-- Загрузка -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Загрузка сообщества...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- Контент сообщества -->
    <div v-else-if="community" class="community-content">
      <!-- Заголовок сообщества -->
      <div class="community-header">
        <div class="community-cover">
          <img :src="community.image ? getImageUrl(community.image) : 'https://picsum.photos/800/300'" :alt="community.name">
        </div>
        <div class="community-info">
          <h1>{{ community.name }}</h1>
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
              v-if="!isUserMember" 
              @click="joinCommunity"
              variant="primary"
              :loading="joining"
            >
              {{ joining ? 'Присоединение...' : 'Присоединиться' }}
            </BaseButton>
            <template v-else-if="isCreator">
              <BaseButton 
                @click="openEditModal"
                variant="primary"
              >
                Редактировать
              </BaseButton>
              <BaseButton 
                @click="deleteCommunity"
                variant="danger"
                :loading="deleting"
              >
                {{ deleting ? 'Удаление...' : 'Удалить сообщество' }}
              </BaseButton>
            </template>
            <BaseButton 
              v-else 
              @click="leaveCommunity"
              variant="secondary"
              :loading="leaving"
            >
              {{ leaving ? 'Выход...' : 'Покинуть' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Основной контент -->
      <div class="community-main">
        <!-- Создание поста (только для создателя сообщества) -->
        <div v-if="isCreator" class="create-post-section">
          <div class="create-post-form">
            <textarea 
              v-model="newPost.content"
              placeholder="Поделитесь своими мыслями..."
              class="post-textarea"
            ></textarea>
            <div v-if="newPost.image" class="post-image-preview">
              <img :src="newPost.image" alt="Preview" class="preview-image">
              <button @click="removeImage" class="remove-image-btn" type="button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="post-actions">
              <input 
                type="file" 
                @change="handleImageUpload" 
                accept="image/*"
                id="post-image"
                style="display: none"
              >
              <label for="post-image" class="image-upload-btn">
                <i class="fas fa-image"></i>
              </label>
              <BaseButton 
                @click="createPost" 
                :disabled="!newPost.content.trim() || creating"
                variant="primary"
                size="small"
              >
                {{ creating ? 'Публикация...' : 'Опубликовать' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Посты -->
        <div class="posts-section">
          <h2>Посты сообщества</h2>
          <div v-if="postsLoading" class="posts-loading">
            <div class="loading-spinner"></div>
            <p>Загрузка постов...</p>
          </div>
          <div v-else-if="posts.length === 0" class="no-posts">
            <i class="fas fa-comments"></i>
            <p>Пока нет постов в этом сообществе</p>
          </div>
          <div v-else class="posts-list">
            <div 
              v-for="post in posts" 
              :key="post.id"
              class="post-card"
            >
              <div class="post-header">
                <div class="post-author">
                  <img 
                    :src="getAuthorAvatar(post.author)" 
                    :alt="getAuthorName(post.author)"
                    class="author-avatar"
                  >
                  <div class="author-info">
                    <h4>{{ getAuthorName(post.author) }}</h4>
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="post-content">
                <p>{{ post.content }}</p>
                <img v-if="post.image" :src="getImageUrl(post.image)" alt="Post image" class="post-image">
              </div>
              <div class="post-footer">
                <button 
                  class="post-action"
                  :class="{ 'liked': post.isLiked }"
                  @click="toggleLike(post)"
                >
                  <i class="fas fa-heart"></i>
                  {{ post.likesCount || 0 }}
                </button>
                <div class="post-action views-action">
                  <i class="fas fa-eye"></i>
                  {{ post.viewsCount || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования сообщества -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #header>
        <h2>Редактирование сообщества</h2>
      </template>
      
      <template #default>
        <form @submit.prevent="updateCommunity" class="edit-community-form">
          <div class="form-group">
            <label>Название сообщества</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              required
              placeholder="Введите название"
            >
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea 
              v-model="editForm.description" 
              required
              placeholder="Опишите ваше сообщество"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Изображение сообщества</label>
            <div v-if="editForm.imagePreview" class="image-preview-container">
              <img :src="editForm.imagePreview" alt="Preview" class="preview-image">
              <button @click="removeCommunityImage" class="remove-image-btn" type="button">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <input 
              type="file" 
              @change="handleCommunityImageUpload" 
              accept="image/*"
              id="community-image-edit"
              style="display: none"
            >
            <label for="community-image-edit" class="image-upload-label">
              <i class="fas fa-image"></i>
              {{ editForm.imagePreview ? 'Изменить изображение' : 'Загрузить изображение' }}
            </label>
          </div>
        </form>
      </template>

      <template #footer>
        <button 
          @click="showEditModal = false" 
          class="btn btn-secondary"
          type="button"
        >
          Отмена
        </button>
        <button 
          @click="updateCommunity" 
          :disabled="updating"
          class="btn btn-primary"
          type="button"
        >
          {{ updating ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import Modal from '@/components/ui/Modal.vue'
import communitiesService from '@/services/communitiesService'

export default defineComponent({
  name: 'CommunityDetail',
  components: {
    BaseButton,
    Modal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const community = ref(null)
    const posts = ref([])
    const loading = ref(false)
    const postsLoading = ref(false)
    const error = ref('')
    const creating = ref(false)
    const isUserMember = ref(false)
    const isCreator = ref(false)
    const showEditModal = ref(false)
    const updating = ref(false)

    const newPost = ref({
      content: '',
      image: null,
      imageFile: null
    })

    const editForm = ref({
      name: '',
      description: '',
      image: null,
      imagePreview: null,
      imageFile: null
    })

    // Загрузка данных сообщества
    const loadCommunity = async () => {
      loading.value = true
      try {
        const communityId = route.params.id
        const [communityData, postsData] = await Promise.all([
          communitiesService.getCommunity(communityId),
          communitiesService.getCommunityPosts(communityId)
        ])
        community.value = communityData
        posts.value = postsData
        
        // Увеличиваем просмотры для каждого поста при загрузке
        posts.value.forEach(post => {
          if (post.id) {
            communitiesService.incrementPostViews(post.id).catch(err => {
              console.error('Ошибка при увеличении просмотров:', err)
            })
          }
        })
        
        // Проверяем, является ли пользователь участником
        const currentUserId = parseInt(localStorage.getItem('userId'))
        console.log('CommunityDetail: Checking membership:', {
          currentUserId,
          communityId: communityData.id,
          creatorId: communityData.creatorId,
          members: communityData.members,
          membersCount: communityData.members?.length || 0
        })
        
        if (currentUserId && communityData.members && Array.isArray(communityData.members)) {
          isUserMember.value = communityData.members.some(member => {
            console.log('CommunityDetail: Checking member:', { memberUserId: member.userId, currentUserId })
            return member.userId === currentUserId
          })
        } else {
          isUserMember.value = false
        }
        
        // Проверяем, является ли пользователь создателем сообщества
        isCreator.value = currentUserId === communityData.creatorId
        console.log('CommunityDetail: Creator check details:', {
          currentUserId,
          creatorId: communityData.creatorId,
          isCreator: isCreator.value,
          userIdType: typeof currentUserId,
          creatorIdType: typeof communityData.creatorId
        })
        
        console.log('CommunityDetail: Is user member result:', isUserMember.value)
      } catch (err) {
        error.value = 'Ошибка при загрузке сообщества'
        console.error('Ошибка загрузки:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadCommunity()
    })

    const createPost = async () => {
      if (creating.value) {
        console.log('CommunityDetail: Already creating post, skipping...')
        return
      }
      
      if (!newPost.value.content.trim()) return

      creating.value = true
      try {
        let imageUrl = null
        
        // Если есть файл изображения, загружаем его на сервер
        if (newPost.value.imageFile) {
          try {
            const uploadResult = await communitiesService.uploadImage(newPost.value.imageFile)
            imageUrl = uploadResult.url
            // Освобождаем локальный blob URL
            if (newPost.value.image && newPost.value.image.startsWith('blob:')) {
              URL.revokeObjectURL(newPost.value.image)
            }
          } catch (uploadErr) {
            console.error('Ошибка при загрузке изображения:', uploadErr)
            error.value = 'Ошибка при загрузке изображения'
            creating.value = false
            return
          }
        }

        const postData = {
          content: newPost.value.content,
          image: imageUrl
        }

        const createdPost = await communitiesService.createPost(community.value.id, postData)
        posts.value.unshift(createdPost)
        // Освобождаем blob URL перед очисткой
        if (newPost.value.image && newPost.value.image.startsWith('blob:')) {
          URL.revokeObjectURL(newPost.value.image)
        }
        newPost.value = { content: '', image: null, imageFile: null }
      } catch (err) {
        console.error('Ошибка при создании поста:', err)
        error.value = 'Ошибка при создании поста'
      } finally {
        creating.value = false
      }
    }

    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          // Освобождаем предыдущий blob URL, если есть
          if (newPost.value.image && newPost.value.image.startsWith('blob:')) {
            URL.revokeObjectURL(newPost.value.image)
          }
          // Показываем превью локально
          newPost.value.image = URL.createObjectURL(file)
          // Сохраняем файл для последующей загрузки
          newPost.value.imageFile = file
        } catch (err) {
          console.error('Ошибка при обработке изображения:', err)
        }
      }
      // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
      event.target.value = ''
    }

    const removeImage = () => {
      // Освобождаем blob URL
      if (newPost.value.image && newPost.value.image.startsWith('blob:')) {
        URL.revokeObjectURL(newPost.value.image)
      }
      newPost.value.image = null
      newPost.value.imageFile = null
    }

    const joining = ref(false)
    
    const joinCommunity = async () => {
      if (joining.value) {
        console.log('CommunityDetail: Already joining, skipping...')
        return
      }
      
      joining.value = true
      try {
        console.log('CommunityDetail: Joining community:', community.value.id)
        await communitiesService.joinCommunity(community.value.id)
        console.log('CommunityDetail: Successfully joined community')
        
        // Обновляем данные сообщества
        await loadCommunity()
      } catch (err) {
        console.error('Ошибка при присоединении к сообществу:', err)
        error.value = 'Ошибка при присоединении к сообществу'
      } finally {
        joining.value = false
      }
    }

    const leaving = ref(false)
    
    const leaveCommunity = async () => {
      if (leaving.value) {
        console.log('CommunityDetail: Already leaving, skipping...')
        return
      }
      
      // Проверяем, не является ли пользователь создателем
      if (isCreator.value) {
        error.value = 'Создатель не может покинуть сообщество. Используйте удаление сообщества.'
        return
      }
      
      leaving.value = true
      try {
        console.log('CommunityDetail: Leaving community:', community.value.id)
        await communitiesService.leaveCommunity(community.value.id)
        console.log('CommunityDetail: Successfully left community')
        
        // Обновляем данные сообщества
        await loadCommunity()
      } catch (err) {
        console.error('Ошибка при выходе из сообщества:', err)
        error.value = 'Ошибка при выходе из сообщества'
      } finally {
        leaving.value = false
      }
    }

    const deleting = ref(false)
    
    const deleteCommunity = async () => {
      if (deleting.value) {
        return
      }
      
      // Подтверждение удаления
      const confirmed = confirm('Вы уверены, что хотите удалить это сообщество? Это действие нельзя отменить. Все посты и данные будут удалены.')
      if (!confirmed) {
        return
      }
      
      deleting.value = true
      try {
        console.log('CommunityDetail: Deleting community:', community.value.id)
        await communitiesService.deleteCommunity(community.value.id)
        console.log('CommunityDetail: Successfully deleted community')
        
        // Перенаправляем на страницу сообществ
        router.push('/community')
      } catch (err) {
        console.error('Ошибка при удалении сообщества:', err)
        error.value = err.response?.data?.message || 'Ошибка при удалении сообщества'
      } finally {
        deleting.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getAuthorName = (author) => {
      if (!author) return 'Неизвестный пользователь'
      if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`
      }
      if (author.firstName) return author.firstName
      if (author.lastName) return author.lastName
      return 'Неизвестный пользователь'
    }

    const getDefaultAvatar = (author) => {
      if (!author) {
        return getAvatarWithInitials('Н', 'П')
      }
      
      const firstName = author.firstName || ''
      const lastName = author.lastName || ''
      
      if (firstName || lastName) {
        const firstInitial = firstName.charAt(0).toUpperCase() || ''
        const lastInitial = lastName.charAt(0).toUpperCase() || ''
        return getAvatarWithInitials(firstInitial, lastInitial)
      }
      
      return getAvatarWithInitials('П', 'У')
    }

    const getAvatarWithInitials = (firstInitial, lastInitial) => {
      const initials = (firstInitial + lastInitial).trim() || 'ПУ'
      const colors = [
        { bg: '#2563eb', text: '#FFFFFF' },
        { bg: '#1d4ed8', text: '#FFFFFF' },
        { bg: '#3b82f6', text: '#FFFFFF' },
        { bg: '#0ea5e9', text: '#FFFFFF' },
        { bg: '#0284c7', text: '#FFFFFF' },
        { bg: '#0369a1', text: '#FFFFFF' },
        { bg: '#1e40af', text: '#FFFFFF' },
        { bg: '#1e3a8a', text: '#FFFFFF' }
      ]
      
      // Генерируем цвет на основе инициалов для консистентности
      const hash = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)
      const color = colors[hash % colors.length]
      
      const svg = `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" fill="${color.bg}" rx="20"/>
          <text x="20" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="600" 
                fill="${color.text}" text-anchor="middle" dominant-baseline="central">
            ${initials}
          </text>
        </svg>
      `.trim()
      
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
    }

    const getAuthorAvatar = (author) => {
      if (!author) {
        return getDefaultAvatar(null)
      }
      
      // Проверяем наличие аватарки в профиле
      if (author.profile?.avatar) {
        return author.profile.avatar
      }
      
      // Если аватарки нет, возвращаем дефолтную с инициалами
      return getDefaultAvatar(author)
    }

    const toggleLike = async (post) => {
      try {
        const result = await communitiesService.togglePostReaction(post.id)
        // Обновляем состояние поста
        post.isLiked = result.isLiked
        post.likesCount = result.likesCount
      } catch (err) {
        console.error('Ошибка при лайке поста:', err)
        error.value = 'Ошибка при лайке поста'
      }
    }

    // Открытие модального окна редактирования
    const openEditModal = () => {
      if (community.value) {
        editForm.value = {
          name: community.value.name || '',
          description: community.value.description || '',
          image: community.value.image || null,
          imagePreview: community.value.image ? getImageUrl(community.value.image) : null,
          imageFile: null
        }
        showEditModal.value = true
      }
    }

    // Обработка загрузки изображения сообщества
    const handleCommunityImageUpload = async (event) => {
      const file = event.target.files[0]
      if (file) {
        try {
          // Освобождаем предыдущий blob URL, если есть
          if (editForm.value.imagePreview && editForm.value.imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(editForm.value.imagePreview)
          }
          // Показываем превью локально
          editForm.value.imagePreview = URL.createObjectURL(file)
          editForm.value.imageFile = file
        } catch (err) {
          console.error('Ошибка при обработке изображения:', err)
        }
      }
      event.target.value = ''
    }

    // Удаление изображения сообщества
    const removeCommunityImage = () => {
      if (editForm.value.imagePreview && editForm.value.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(editForm.value.imagePreview)
      }
      editForm.value.imagePreview = null
      editForm.value.imageFile = null
      editForm.value.image = null
    }

    // Обновление сообщества
    const updateCommunity = async () => {
      if (updating.value) return
      
      if (!editForm.value.name.trim() || !editForm.value.description.trim()) {
        error.value = 'Заполните все обязательные поля'
        return
      }

      updating.value = true
      try {
        let imageUrl = editForm.value.image

        // Если есть новый файл изображения, загружаем его на сервер
        if (editForm.value.imageFile) {
          try {
            const uploadResult = await communitiesService.uploadImage(editForm.value.imageFile)
            imageUrl = uploadResult.url
            // Освобождаем локальный blob URL
            if (editForm.value.imagePreview && editForm.value.imagePreview.startsWith('blob:')) {
              URL.revokeObjectURL(editForm.value.imagePreview)
            }
          } catch (uploadErr) {
            console.error('Ошибка при загрузке изображения:', uploadErr)
            error.value = 'Ошибка при загрузке изображения'
            updating.value = false
            return
          }
        }

        const updateData = {
          name: editForm.value.name.trim(),
          description: editForm.value.description.trim(),
          image: imageUrl
        }

        const updatedCommunity = await communitiesService.updateCommunity(community.value.id, updateData)
        
        // Обновляем данные сообщества
        community.value = updatedCommunity
        
        // Закрываем модальное окно
        showEditModal.value = false
        
        // Очищаем форму
        editForm.value = {
          name: '',
          description: '',
          image: null,
          imagePreview: null,
          imageFile: null
        }
      } catch (err) {
        console.error('Ошибка при обновлении сообщества:', err)
        error.value = err.response?.data?.message || 'Ошибка при обновлении сообщества'
      } finally {
        updating.value = false
      }
    }

    const getImageUrl = (imagePath) => {
      if (!imagePath) return ''
      // Если URL уже полный (начинается с http:// или https://), возвращаем как есть
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      // Если это относительный путь, добавляем базовый URL API
      const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3001'
      
      // Если путь начинается с /api/, используем API URL
      if (imagePath.startsWith('/api/')) {
        return `${API_BASE_URL}${imagePath}`
      }
      
      // Если путь начинается с /uploads, используем статический путь
      if (imagePath.startsWith('/uploads/')) {
        return `${API_BASE_URL}${imagePath}`
      }
      
      // Если путь не начинается с /, предполагаем что это имя файла и формируем путь
      if (!imagePath.startsWith('/')) {
        // Проверяем, есть ли в пути упоминание images
        if (imagePath.includes('image') || imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return `${API_BASE_URL}/uploads/images/${imagePath}`
        }
        return `${API_BASE_URL}/api/files/image/${imagePath}`
      }
      
      return imagePath
    }

    return {
      community,
      posts,
      loading,
      postsLoading,
      error,
      creating,
      joining,
      leaving,
      deleting,
      isUserMember,
      isCreator,
      newPost,
      createPost,
      handleImageUpload,
      removeImage,
      joinCommunity,
      leaveCommunity,
      deleteCommunity,
      formatDate,
      getAuthorName,
      getImageUrl,
      getAuthorAvatar,
      toggleLike,
      showEditModal,
      editForm,
      updating,
      openEditModal,
      handleCommunityImageUpload,
      removeCommunityImage,
      updateCommunity
    }
  }
})
</script>

<style scoped>
.community-detail {
  padding: 2rem;
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
  background: #fee;
  color: #c53030;
  padding: 1rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.community-content {
  max-width: 1200px;
  margin: 0 auto;
}

.community-header {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
}

.community-cover {
  height: 300px;
  overflow: hidden;
}

.community-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.community-info {
  padding: 2rem;
}

.community-info h1 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 2rem;
}

.community-info p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.community-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 1rem;
}

.community-actions {
  display: flex;
  gap: 1rem;
}

.community-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.create-post-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.create-post-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-textarea {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  resize: vertical;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.post-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

.post-image-preview {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin-top: 0.5rem;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: #f8fafc;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-upload-btn:hover {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.posts-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.posts-section h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.posts-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.no-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.no-posts i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  background: #f8fafc;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.post-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.post-content {
  margin-bottom: 1rem;
}

.post-content p {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.post-image {
  width: 100%;
  max-width: 500px;
  border-radius: var(--radius-lg);
  margin-top: 1rem;
}

.post-footer {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.post-action {
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
  border: none;
}

.post-action:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.post-action.liked {
  color: #e91e63;
}

.post-action.liked i {
  color: #e91e63;
}

.post-action.liked:hover {
  background: #fce4ec;
}

.views-action {
  cursor: default;
  color: var(--text-secondary);
}

.views-action:hover {
  background: white;
  transform: none;
}

/* Стили для формы редактирования сообщества */
.edit-community-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem;
}

.edit-community-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-community-form .form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.edit-community-form .form-group input,
.edit-community-form .form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  background: #f8fafc;
  transition: all 0.3s ease;
  font-family: inherit;
}

.edit-community-form .form-group input:focus,
.edit-community-form .form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

.edit-community-form .form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.image-preview-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin-top: 0.5rem;
}

.image-preview-container .preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.image-preview-container .remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.image-preview-container .remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.image-upload-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.image-upload-label:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
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
  opacity: 0.7;
  cursor: not-allowed;
}

:deep(.modal-footer .btn-secondary) {
  background: #f1f5f9;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

:deep(.modal-footer .btn-secondary:hover) {
  background: #e2e8f0;
}
</style>
