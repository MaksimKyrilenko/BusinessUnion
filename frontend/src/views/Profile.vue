<template>
  <div class="profile">
    <div class="profile-header">
      <div class="profile-info">
        <img :src="profile.avatar || '/default-avatar.png'" alt="Avatar" class="avatar">
        <div class="user-info">
          <h1>{{ profile.username }}</h1>
          <p class="user-type">{{ formatUserType(profile.userType) }}</p>
        </div>
      </div>
      <BaseButton @click="editProfile">Редактировать профиль</BaseButton>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>Основная информация</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ profile.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Компания:</span>
            <span class="value">{{ profile.company || 'Не указано' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Должность:</span>
            <span class="value">{{ profile.position || 'Не указано' }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>Специализация</h2>
        <div class="tags">
          <span v-for="spec in profile.specialization" 
                :key="spec" 
                class="tag">
            {{ spec }}
          </span>
        </div>
      </div>

      <div class="profile-section">
        <h2>Контакты</h2>
        <div class="social-links">
          <a v-if="profile.website" 
             :href="profile.website" 
             target="_blank" 
             class="social-link">
            🌐 Веб-сайт
          </a>
          <a v-for="(link, platform) in profile.socialLinks" 
             :key="platform"
             :href="link"
             target="_blank"
             class="social-link">
            {{ getSocialIcon(platform) }} {{ platform }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'

export default {
  name: 'Profile',
  components: {
    BaseButton
  },
  data() {
    return {
      profile: {
        username: '',
        email: '',
        userType: '',
        avatar: '',
        company: '',
        position: '',
        specialization: [],
        website: '',
        socialLinks: {}
      }
    }
  },
  async created() {
    try {
      const response = await api.get('/users/profile')
      this.profile = response.data
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
    }
  },
  methods: {
    formatUserType(type) {
      const types = {
        businessman: 'Бизнесмен',
        investor: 'Инвестор',
        crypto_trader: 'Крипто-трейдер',
        startup_founder: 'Основатель стартапа'
      }
      return types[type] || type
    },
    getSocialIcon(platform) {
      const icons = {
        linkedin: '💼',
        twitter: '🐦',
        telegram: '📱'
      }
      return icons[platform.toLowerCase()] || '🔗'
    },
    editProfile() {
      this.$router.push('/profile/edit')
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h1 {
  margin: 0;
  color: #2c3e50;
}

.user-type {
  color: #666;
  margin: 5px 0;
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.value {
  color: #2c3e50;
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.tag {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.social-link {
  color: #2c3e50;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 5px;
  background: #f8f9fa;
  transition: background-color 0.2s;
}

.social-link:hover {
  background: #e9ecef;
}
</style> 