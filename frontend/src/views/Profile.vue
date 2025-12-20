<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-user"></i>
          </div>
          <div>
            <h1>Профиль пользователя</h1>
            <p class="header-subtitle">Личная информация и настройки</p>
          </div>
        </div>
        <div class="header-right">
          <router-link v-if="isOwnProfile" to="/profile/edit" class="btn-edit">
            <i class="fas fa-pen"></i>
            Редактировать
          </router-link>
          <router-link v-else to="/people" class="btn-edit">
            <i class="fas fa-arrow-left"></i>
            Назад к поиску
          </router-link>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="loader"></div>
      <p>Загрузка профиля...</p>
    </div>

    <div v-else-if="userData" class="profile-grid">
      <!-- Row 1: Avatar Card + Personal Info -->
      <div class="row row-1">
        <div class="profile-card avatar-card">
          <div class="avatar-section">
            <div v-if="userData.profile && userData.profile.avatar" class="avatar-img" 
                 :style="{backgroundImage: `url(${userData.profile.avatar})`}"></div>
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
            <div class="user-name">
              <h2>{{ userData.firstName }} {{ userData.lastName }}</h2>
              <span class="user-role">{{ getUserRole }}</span>
            </div>
            <div v-if="!isOwnProfile" class="connect-btn-wrapper">
              <button class="btn-connect" @click="connectWithUser">
                <i class="fas fa-envelope"></i>
                Связаться
              </button>
            </div>
          </div>
        </div>

        <div class="profile-card personal-card">
          <div class="card-header">
            <i class="fas fa-id-card"></i>
            <h3>Личные данные</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Имя</span>
              <span class="info-value">{{ userData.firstName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Фамилия</span>
              <span class="info-value">{{ userData.lastName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Отчество</span>
              <span class="info-value">{{ userData.middleName || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ userData.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: About + Professional -->
      <div class="row row-2">
        <div class="profile-card">
          <div class="card-header">
            <i class="fas fa-user-circle"></i>
            <h3>О себе</h3>
          </div>
          <div class="bio-content">
            <p v-if="userData.profile?.bio">{{ userData.profile.bio }}</p>
            <p v-else class="empty-text">Информация отсутствует</p>
          </div>
        </div>

        <div class="profile-card">
          <div class="card-header">
            <i class="fas fa-briefcase"></i>
            <h3>Профессиональная информация</h3>
          </div>
          <div class="info-grid" v-if="hasWorkInfo">
            <div class="info-item" v-if="userData.profile?.company">
              <span class="info-label">Компания</span>
              <span class="info-value">{{ userData.profile.company }}</span>
            </div>
            <div class="info-item" v-if="userData.profile?.position">
              <span class="info-label">Должность</span>
              <span class="info-value">{{ userData.profile.position }}</span>
            </div>
            <div class="info-item full-width" v-if="userData.profile?.website">
              <span class="info-label">Веб-сайт</span>
              <a :href="userData.profile.website" target="_blank" class="info-link">
                {{ userData.profile.website }}
              </a>
            </div>
          </div>
          <p v-else class="empty-text">Информация отсутствует</p>
        </div>
      </div>

      <!-- Row 3: Contact + Social -->
      <div class="row row-2">
        <div class="profile-card">
          <div class="card-header">
            <i class="fas fa-address-book"></i>
            <h3>Контактная информация</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ userData.email }}</span>
            </div>
            <div class="info-item" v-if="userData.profile?.phoneNumber">
              <span class="info-label">Телефон</span>
              <span class="info-value">{{ userData.profile.phoneNumber }}</span>
            </div>
            <div class="info-item" v-if="userData.profile?.region">
              <span class="info-label">Регион</span>
              <span class="info-value">{{ userData.profile.region }}</span>
            </div>
            <div class="info-item" v-if="userData.profile?.address">
              <span class="info-label">Адрес</span>
              <span class="info-value">{{ userData.profile.address }}</span>
            </div>
          </div>
        </div>

        <div class="profile-card" v-if="hasSocialLinks">
          <div class="card-header">
            <i class="fas fa-share-alt"></i>
            <h3>Социальные сети</h3>
          </div>
          <div class="social-grid">
            <a v-if="userData.profile?.socialLinks?.vk" :href="userData.profile.socialLinks.vk" target="_blank" class="social-item vk">
              <i class="fab fa-vk"></i>
              <span>ВКонтакте</span>
            </a>
            <a v-if="userData.profile?.socialLinks?.telegram" :href="'https://t.me/' + userData.profile.socialLinks.telegram" target="_blank" class="social-item telegram">
              <i class="fab fa-telegram"></i>
              <span>Telegram</span>
            </a>
            <a v-if="userData.profile?.socialLinks?.instagram" :href="userData.profile.socialLinks.instagram" target="_blank" class="social-item instagram">
              <i class="fab fa-instagram"></i>
              <span>Instagram</span>
            </a>
            <a v-if="userData.profile?.socialLinks?.linkedin" :href="userData.profile.socialLinks.linkedin" target="_blank" class="social-item linkedin">
              <i class="fab fa-linkedin"></i>
              <span>LinkedIn</span>
            </a>
            <a v-if="userData.profile?.socialLinks?.twitter" :href="userData.profile.socialLinks.twitter" target="_blank" class="social-item twitter">
              <i class="fab fa-twitter"></i>
              <span>Twitter</span>
            </a>
            <a v-if="userData.profile?.socialLinks?.facebook" :href="userData.profile.socialLinks.facebook" target="_blank" class="social-item facebook">
              <i class="fab fa-facebook"></i>
              <span>Facebook</span>
            </a>
          </div>
        </div>
        <div class="profile-card" v-else>
          <div class="card-header">
            <i class="fas fa-share-alt"></i>
            <h3>Социальные сети</h3>
          </div>
          <p class="empty-text">Социальные сети не указаны</p>
        </div>
      </div>

      <!-- Row 4: Education + Skills -->
      <div class="row row-2">
        <div class="profile-card">
          <div class="card-header">
            <i class="fas fa-graduation-cap"></i>
            <h3>Образование и квалификация</h3>
          </div>
          <div class="info-grid" v-if="hasEducation">
            <div class="info-item full-width" v-if="userData.profile?.education">
              <span class="info-label">Образование</span>
              <span class="info-value">{{ userData.profile.education }}</span>
            </div>
            <div class="info-item full-width" v-if="userData.profile?.certifications?.length">
              <span class="info-label">Сертификаты</span>
              <div class="tags">
                <span v-for="(cert, index) in userData.profile.certifications" :key="index" class="tag">{{ cert }}</span>
              </div>
            </div>
            <div class="info-item full-width" v-if="userData.profile?.languages?.length">
              <span class="info-label">Языки</span>
              <div class="tags">
                <span v-for="(lang, index) in userData.profile.languages" :key="index" class="tag">{{ lang }}</span>
              </div>
            </div>
          </div>
          <p v-else class="empty-text">Информация отсутствует</p>
        </div>

        <div class="profile-card">
          <div class="card-header">
            <i class="fas fa-star"></i>
            <h3>Специализация и интересы</h3>
          </div>
          <div class="skills-content" v-if="hasSkills">
            <div v-if="userData.profile?.specialization?.length" class="skill-group">
              <span class="skill-label">Специализация</span>
              <div class="tags">
                <span v-for="(tag, index) in userData.profile.specialization" :key="index" class="tag primary">{{ tag }}</span>
              </div>
            </div>
            <div v-if="userData.profile?.interests?.length" class="skill-group">
              <span class="skill-label">Интересы</span>
              <div class="tags">
                <span v-for="(tag, index) in userData.profile.interests" :key="index" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
          <p v-else class="empty-text">Информация отсутствует</p>
        </div>
      </div>

      <!-- Row 5: Investment (for investors) + Gallery -->
      <div class="row row-2" v-if="userData.userType === 'INVESTOR' || hasGallery">
        <div class="profile-card" v-if="userData.userType === 'INVESTOR'">
          <div class="card-header">
            <i class="fas fa-chart-line"></i>
            <h3>Инвестиционная деятельность</h3>
          </div>
          <div class="investment-content" v-if="userData.profile?.investmentSize">
            <div class="investment-amount">
              <span class="amount-label">Размер инвестиций</span>
              <span class="amount-value">{{ formatCurrency(userData.profile.investmentSize) }} ₽</span>
            </div>
          </div>
          <p v-else class="empty-text">Информация отсутствует</p>
        </div>

        <div class="profile-card" v-if="hasGallery">
          <div class="card-header">
            <i class="fas fa-images"></i>
            <h3>Портфолио и галерея</h3>
          </div>
          <div class="gallery-grid">
            <div v-for="(image, index) in userData.profile.gallery" :key="index" 
                 class="gallery-item" @click="openImageModal(image)">
              <div class="gallery-image" :style="{ backgroundImage: `url(${image})` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>Не удалось загрузить профиль</p>
    </div>
    
    <Modal v-if="showConnectModal" @close="showConnectModal = false">
      <template #header>
        <h3>Связаться с {{ userData?.firstName }} {{ userData?.lastName }}</h3>
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
    </Modal>
  </div>
</template>

<script>
import api from '@/axios';
import usersApiService from '@/services/usersApi';
import Modal from '@/components/ui/Modal.vue';

export default {
  name: 'Profile',
  components: {
    Modal
  },
  props: {
    id: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      isLoading: true,
      userData: null,
      isOwnProfile: false,
      showConnectModal: false,
      messageText: ''
    }
  },
  computed: {
    userInitials() {
      if (!this.userData) return '';
      return (this.userData.firstName?.charAt(0) || '') + (this.userData.lastName?.charAt(0) || '');
    },
    getUserRole() {
      const roles = {
        'INVESTOR': 'Инвестор',
        'BUSINESSMAN': 'Предприниматель',
        'ADMIN': 'Администратор'
      };
      return roles[this.userData?.userType] || 'Пользователь';
    },
    hasSocialLinks() {
      if (!this.userData?.profile?.socialLinks) return false;
      const links = this.userData.profile.socialLinks;
      return Boolean(links.linkedin || links.twitter || links.telegram || links.vk || links.instagram || links.facebook);
    },
    hasWorkInfo() {
      return this.userData?.profile?.company || this.userData?.profile?.position || this.userData?.profile?.website;
    },
    hasEducation() {
      return this.userData?.profile?.education || 
             this.userData?.profile?.certifications?.length || 
             this.userData?.profile?.languages?.length;
    },
    hasSkills() {
      return this.userData?.profile?.specialization?.length || this.userData?.profile?.interests?.length;
    },
    hasGallery() {
      return this.userData?.profile?.gallery?.length > 0;
    }
  },
  async created() {
    const currentUserId = localStorage.getItem('userId');
    if (!this.id) {
      this.isOwnProfile = true;
      await this.loadOwnProfile();
    } else {
      this.isOwnProfile = this.id == currentUserId;
      await this.loadUserProfile(this.id);
    }
  },
  methods: {
    async loadOwnProfile() {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.$router.push('/login');
          return;
        }
        
        const response = await api.get('/users/profile');
        
        if (response.data.id && response.data.id.toString() !== userId) {
          localStorage.setItem('userId', response.data.id.toString());
        }
        
        if (response.data.profile === null) {
          const profileData = {
            bio: '',
            company: '',
            position: '',
            website: '',
            socialLinks: { linkedin: '', twitter: '', telegram: '', vk: '', instagram: '', facebook: '' },
            specialization: [],
            interests: [],
            investmentSize: 0
          };
          
          try {
            await api.post('/users/profile', profileData);
            const updatedResponse = await api.get('/users/profile');
            this.userData = updatedResponse.data;
          } catch (profileError) {
            this.userData = response.data;
          }
        } else {
          this.userData = response.data;
        }
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadUserProfile(userId) {
      try {
        const userData = await usersApiService.getUserById(userId);
        this.userData = userData;
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleError(error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        this.$router.push('/login');
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('ru-RU').format(value);
    },
    
    openImageModal(image) {
      window.open(image, '_blank');
    },
    
    connectWithUser() {
      this.showConnectModal = true;
    },
    
    async sendMessage() {
      if (!this.messageText.trim()) return;
      try {
        this.showConnectModal = false;
        this.messageText = '';
        alert('Сообщение успешно отправлено');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  }
}
</script>


<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.page-header {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #1E6BFF;
  color: white;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #1557d9;
}

/* Grid Layout */
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.row {
  display: grid;
  gap: 0.75rem;
}

.row-1 {
  grid-template-columns: 1fr 2fr;
}

.row-2 {
  grid-template-columns: 1fr 1fr;
}

/* Cards */
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header i {
  width: 36px;
  height: 36px;
  background: #f0f7ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E6BFF;
  font-size: 1rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* Avatar Card */
.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 4px solid #f0f7ff;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  border: 4px solid #f0f7ff;
}

.user-name h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.user-role {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
  display: block;
}

.btn-connect {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1E6BFF;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-connect:hover {
  background: #1557d9;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-value {
  font-size: 0.9375rem;
  color: #1a1a2e;
  font-weight: 500;
}

.info-link {
  font-size: 0.9375rem;
  color: #1E6BFF;
  text-decoration: none;
  font-weight: 500;
}

.info-link:hover {
  text-decoration: underline;
}

/* Bio */
.bio-content {
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.6;
}

.empty-text {
  font-size: 0.875rem;
  color: #94a3b8;
  font-style: italic;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 10px;
  text-decoration: none;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.social-item:hover {
  background: #f0f7ff;
  color: #1E6BFF;
}

.social-item i {
  font-size: 1.125rem;
}

.social-item.vk:hover { color: #4a76a8; }
.social-item.telegram:hover { color: #0088cc; }
.social-item.instagram:hover { color: #e4405f; }
.social-item.linkedin:hover { color: #0077b5; }
.social-item.twitter:hover { color: #1da1f2; }
.social-item.facebook:hover { color: #1877f2; }

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: #f0f7ff;
  color: #1E6BFF;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.tag.primary {
  background: #1E6BFF;
  color: white;
}

/* Skills */
.skills-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.skill-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skill-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

/* Investment */
.investment-content {
  display: flex;
  justify-content: center;
}

.investment-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 12px;
}

.amount-label {
  font-size: 0.875rem;
  color: #64748b;
}

.amount-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1E6BFF;
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.gallery-item:hover {
  transform: scale(1.03);
}

.gallery-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
  gap: 1rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f7ff;
  border-top-color: #1E6BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state i {
  font-size: 3rem;
  color: #ef4444;
}

/* Modal */
.connect-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.connect-form label {
  font-weight: 500;
  color: #1a1a2e;
}

.connect-form textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-size: 0.9375rem;
}

.btn-primary {
  background: #1E6BFF;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .row-1 {
    grid-template-columns: 1fr;
  }
  
  .social-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .row-2 {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .page-header {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .header-left h1 {
    font-size: 1.25rem;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .btn-edit {
    width: 100%;
    justify-content: center;
  }
  
  .profile-card {
    padding: 1.25rem;
    border-radius: 12px;
  }
  
  .avatar-img,
  .avatar-placeholder {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }
  
  .user-name h2 {
    font-size: 1.1rem;
  }
  
  .social-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .social-item {
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .social-item span {
    display: none;
  }
  
  .social-item i {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 0.75rem;
  }
  
  .page-header {
    padding: 0.875rem;
  }
  
  .header-left {
    gap: 0.75rem;
  }
  
  .header-left h1 {
    font-size: 1.1rem;
  }
  
  .header-subtitle {
    font-size: 0.8rem;
  }
  
  .profile-card {
    padding: 1rem;
  }
  
  .card-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }
  
  .card-header h3 {
    font-size: 0.9rem;
  }
  
  .card-header i {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
  
  .avatar-img,
  .avatar-placeholder {
    width: 80px;
    height: 80px;
    font-size: 1.75rem;
  }
  
  .tags {
    gap: 0.375rem;
  }
  
  .tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
}
</style>
