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
          <img :src="community.image || 'https://picsum.photos/800/300'" :alt="community.name">
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
                    :src="post.author?.avatar || 'https://via.placeholder.com/40'" 
                    :alt="post.author?.name"
                    class="author-avatar"
                  >
                  <div class="author-info">
                    <h4>{{ post.author?.name || 'Неизвестный пользователь' }}</h4>
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="post-content">
                <p>{{ post.content }}</p>
                <img v-if="post.image" :src="post.image" alt="Post image" class="post-image">
              </div>
              <div class="post-footer">
                <button class="post-action">
                  <i class="fas fa-heart"></i>
                  {{ post.likesCount }}
                </button>
                <button class="post-action">
                  <i class="fas fa-comment"></i>
                  {{ post.commentsCount }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import communitiesService from '@/services/communitiesService'

export default defineComponent({
  name: 'CommunityDetail',
  components: {
    BaseButton
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

    const newPost = ref({
      content: '',
      image: null
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
      if (!newPost.value.content.trim()) return

      creating.value = true
      try {
        const postData = {
          content: newPost.value.content,
          image: newPost.value.image
        }

        const createdPost = await communitiesService.createPost(community.value.id, postData)
        posts.value.unshift(createdPost)
        newPost.value = { content: '', image: null }
      } catch (err) {
        console.error('Ошибка при создании поста:', err)
        error.value = 'Ошибка при создании поста'
      } finally {
        creating.value = false
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        newPost.value.image = URL.createObjectURL(file)
      }
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

    return {
      community,
      posts,
      loading,
      postsLoading,
      error,
      creating,
      joining,
      leaving,
      isUserMember,
      isCreator,
      newPost,
      createPost,
      handleImageUpload,
      joinCommunity,
      leaveCommunity,
      formatDate
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
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);
  background: white;
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
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
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
}

.post-action:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
</style>
