<template>
  <div class="profile">
    <div v-if="isLoading" class="loading">
      Загрузка профиля...
    </div>
    <div v-else-if="userData" class="profile-content">
      <div class="profile-header">
        <h1>Профиль пользователя</h1>
        <div class="header-actions">
          <router-link v-if="isOwnProfile" to="/profile/edit" class="btn btn-outline">
            Редактировать
          </router-link>
          <router-link v-else to="/people" class="btn btn-outline">
            Назад к поиску
          </router-link>
        </div>
      </div>

      <div class="profile-info">
        <div class="profile-section">
          <h2>Личные данные</h2>
          
          <div class="profile-avatar">
            <div v-if="userData.profile && userData.profile.avatar" class="avatar-img" 
                 :style="{backgroundImage: `url(${userData.profile.avatar})`}"></div>
            <div v-else class="avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>
          
          <div class="profile-field">
            <span class="field-label">Имя:</span>
            <span class="field-value">{{ userData.firstName }}</span>
          </div>

          <div class="profile-field">
            <span class="field-label">Фамилия:</span>
            <span class="field-value">{{ userData.lastName }}</span>
          </div>

          <div class="profile-field">
            <span class="field-label">Отчество:</span>
            <span class="field-value">{{ userData.middleName || 'Не указано' }}</span>
          </div>

          <div class="profile-field">
            <span class="field-label">Email:</span>
            <span class="field-value">{{ userData.email }}</span>
          </div>
        </div>

        <div v-if="userData.profile" class="profile-section">
          <h2>О себе</h2>
          <div v-if="userData.profile.bio" class="profile-field bio">
            <p>{{ userData.profile.bio }}</p>
          </div>
          <div v-else class="profile-field empty-field">
            <p>Информация отсутствует</p>
          </div>
        </div>

        <div v-if="userData.profile" class="profile-section">
          <h2>Профессиональная информация</h2>
          
          <div v-if="userData.profile.company" class="profile-field">
            <span class="field-label">Компания:</span>
            <span class="field-value">{{ userData.profile.company }}</span>
          </div>
          
          <div v-if="userData.profile.position" class="profile-field">
            <span class="field-label">Должность:</span>
            <span class="field-value">{{ userData.profile.position }}</span>
          </div>
          
          <div v-if="userData.profile.website" class="profile-field">
            <span class="field-label">Веб-сайт:</span>
            <a :href="userData.profile.website" target="_blank" class="field-value link">{{ userData.profile.website }}</a>
          </div>

          <div v-if="!userData.profile.company && !userData.profile.position && !userData.profile.website" class="profile-field empty-field">
            <p>Информация отсутствует</p>
          </div>
        </div>

        <div v-if="userData.profile && hasSocialLinks" class="profile-section">
          <h2>Социальные сети</h2>
          
          <div v-if="userData.profile.socialLinks?.vk" class="profile-field">
            <span class="field-label">ВКонтакте:</span>
            <a :href="userData.profile.socialLinks.vk" target="_blank" class="field-value link">{{ userData.profile.socialLinks.vk }}</a>
          </div>
          
          <div v-if="userData.profile.socialLinks?.instagram" class="profile-field">
            <span class="field-label">Instagram:</span>
            <a :href="userData.profile.socialLinks.instagram" target="_blank" class="field-value link">{{ userData.profile.socialLinks.instagram }}</a>
          </div>
          
          <div v-if="userData.profile.socialLinks?.facebook" class="profile-field">
            <span class="field-label">Facebook:</span>
            <a :href="userData.profile.socialLinks.facebook" target="_blank" class="field-value link">{{ userData.profile.socialLinks.facebook }}</a>
          </div>
          
          <div v-if="userData.profile.socialLinks?.linkedin" class="profile-field">
            <span class="field-label">LinkedIn:</span>
            <a :href="userData.profile.socialLinks.linkedin" target="_blank" class="field-value link">{{ userData.profile.socialLinks.linkedin }}</a>
          </div>
          
          <div v-if="userData.profile.socialLinks?.twitter" class="profile-field">
            <span class="field-label">Twitter:</span>
            <a :href="userData.profile.socialLinks.twitter" target="_blank" class="field-value link">{{ userData.profile.socialLinks.twitter }}</a>
          </div>
          
          <div v-if="userData.profile.socialLinks?.telegram" class="profile-field">
            <span class="field-label">Telegram:</span>
            <span class="field-value">{{ userData.profile.socialLinks.telegram }}</span>
          </div>
        </div>
        
        <div v-if="userData.profile && userData.profile.gallery && userData.profile.gallery.length > 0" class="profile-section">
          <h2>Портфолио и галерея</h2>
          <div class="gallery-grid">
            <div v-for="(image, index) in userData.profile.gallery" :key="index" 
                 class="gallery-item" @click="openImageModal(image)">
              <div class="gallery-image" :style="{ backgroundImage: `url(${image})` }"></div>
            </div>
          </div>
        </div>

        <div v-if="userData.profile && (userData.profile.specialization?.length || userData.profile.interests?.length)" class="profile-section">
          <h2>Специализация и интересы</h2>
          
          <div v-if="userData.profile.specialization?.length" class="profile-field">
            <span class="field-label">Специализация:</span>
            <div class="tags">
              <span v-for="(tag, index) in userData.profile.specialization" :key="index" class="tag">{{ tag }}</span>
            </div>
          </div>
          
          <div v-if="userData.profile.interests?.length" class="profile-field">
            <span class="field-label">Интересы:</span>
            <div class="tags">
              <span v-for="(tag, index) in userData.profile.interests" :key="index" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div v-if="userData.userType === 'INVESTOR'" class="profile-section">
          <h2>Инвестиционная деятельность</h2>
          
          <div v-if="userData.profile?.investmentSize" class="profile-field">
            <span class="field-label">Размер инвестиций:</span>
            <span class="field-value">{{ formatCurrency(userData.profile.investmentSize) }} ₽</span>
          </div>
          <div v-else class="profile-field empty-field">
            <p>Информация отсутствует</p>
          </div>
        </div>

        <div v-if="userData.profile" class="profile-section">
          <h2>Контактная информация</h2>
          <div class="profile-field">
            <span class="field-label">Email:</span>
            <span class="field-value">{{ userData.email }}</span>
          </div>
          
          <div v-if="userData.profile.phoneNumber" class="profile-field">
            <span class="field-label">Телефон:</span>
            <span class="field-value">{{ userData.profile.phoneNumber }}</span>
          </div>
          
          <div v-if="userData.profile.region" class="profile-field">
            <span class="field-label">Регион:</span>
            <span class="field-value">{{ userData.profile.region }}</span>
          </div>
          
          <div v-if="userData.profile.address" class="profile-field">
            <span class="field-label">Адрес:</span>
            <span class="field-value">{{ userData.profile.address }}</span>
          </div>
        </div>
        
        <div v-if="userData.profile" class="profile-section">
          <h2>Образование и квалификация</h2>
          
          <div v-if="userData.profile.education" class="profile-field">
            <span class="field-label">Образование:</span>
            <span class="field-value">{{ userData.profile.education }}</span>
          </div>
          
          <div v-if="userData.profile.certifications && userData.profile.certifications.length > 0" class="profile-field">
            <span class="field-label">Сертификаты:</span>
            <div class="tags">
              <span v-for="(cert, index) in userData.profile.certifications" :key="index" class="tag">{{ cert }}</span>
            </div>
          </div>
          
          <div v-if="userData.profile.languages && userData.profile.languages.length > 0" class="profile-field">
            <span class="field-label">Языки:</span>
            <div class="tags">
              <span v-for="(lang, index) in userData.profile.languages" :key="index" class="tag">{{ lang }}</span>
            </div>
          </div>
          
          <div v-if="!userData.profile.education && (!userData.profile.certifications || userData.profile.certifications.length === 0) && (!userData.profile.languages || userData.profile.languages.length === 0)" class="profile-field empty-field">
            <p>Информация отсутствует</p>
          </div>
        </div>
      </div>

      <div v-if="!isOwnProfile" class="profile-actions">
        <button class="btn btn-primary" @click="connectWithUser">
          <i class="fas fa-envelope"></i> Связаться
        </button>
      </div>
    </div>
    <div v-else class="error">
      Не удалось загрузить профиль
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
    hasSocialLinks() {
      if (!this.userData.profile || !this.userData.profile.socialLinks) return false;
      return Boolean(
        this.userData.profile.socialLinks.linkedin ||
        this.userData.profile.socialLinks.twitter ||
        this.userData.profile.socialLinks.telegram ||
        this.userData.profile.socialLinks.vk ||
        this.userData.profile.socialLinks.instagram ||
        this.userData.profile.socialLinks.facebook
      );
    }
  },
  async created() {
    // Определяем свой профиль или чужой
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
        // Получим ID текущего пользователя из localStorage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          console.error('ID пользователя не найден в localStorage');
          this.$router.push('/login');
          return;
        }
        
        console.log('Загружаем свой профиль для пользователя ID:', userId);
        
        // Загружаем профиль
        const response = await api.get('/users/profile');
        
        // Проверяем, что ID загруженного профиля совпадает с ID в localStorage
        if (response.data.id && response.data.id.toString() !== userId) {
          console.warn('ID загруженного профиля не совпадает с ID в localStorage');
          // Принудительно обновим localStorage
          localStorage.setItem('userId', response.data.id.toString());
        }
        
        if (response.data.profile === null) {
          // Создаем новый профиль с валидными данными
          const profileData = {
            bio: '',
            company: '',
            position: '',
            website: '',
            socialLinks: {
              linkedin: '',
              twitter: '',
              telegram: '',
              vk: '',
              instagram: '',
              facebook: ''
            },
            specialization: [],
            interests: [],
            investmentSize: 0
          };
          
          try {
            // Используем обработку ошибок при создании профиля
            const createResponse = await api.post('/users/profile', profileData);
            console.log('Профиль успешно создан:', createResponse.data);
            
            // Получаем обновленные данные профиля
            const updatedResponse = await api.get('/users/profile');
            this.userData = updatedResponse.data;
          } catch (profileError) {
            console.error('Ошибка при создании профиля:', profileError.response?.data || profileError.message);
            // Если не удалось создать профиль, все равно показываем основные данные пользователя
            this.userData = response.data;
            
            if (profileError.response && profileError.response.status === 400) {
              console.warn('Неверный формат данных при создании профиля');
            }
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
        console.log('Загружаем профиль пользователя ID:', userId);
        
        // Загружаем данные пользователя через API сервис
        const userData = await usersApiService.getUserById(userId);
        this.userData = userData;
        
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    handleError(error) {
      console.error('Ошибка при загрузке профиля:', error.response?.data || error.message);
      
      // Если ошибка 401, перенаправляем на логин
      if (error.response && error.response.status === 401) {
        // Очищаем данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        this.$router.push('/login');
        return;
      }
      
      let errorMessage = 'Не удалось загрузить профиль.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage += ' ' + error.response.data.message;
      } else {
        errorMessage += ' Пожалуйста, попробуйте позже.';
      }
      
      this.$emit('error', errorMessage);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('ru-RU').format(value);
    },
    
    openImageModal(image) {
      // Здесь можно добавить логику для открытия модального окна с полноразмерным изображением
      window.open(image, '_blank');
    },
    
    connectWithUser() {
      this.showConnectModal = true;
    },
    
    async sendMessage() {
      if (!this.messageText.trim()) return;

      try {
        // Здесь будет отправка сообщения на сервер
        console.log('Отправка сообщения пользователю:', this.userData.id, this.messageText);
        
        this.showConnectModal = false;
        this.messageText = '';
        
        // Показываем уведомление об успехе
        alert('Сообщение успешно отправлено');
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      }
    }
  }
}
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.profile-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #333;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-bottom: 1rem;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f4ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #4361ee;
}

.profile-field {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 500;
  width: 150px;
  color: #666;
}

.field-value {
  flex: 1;
  min-width: 200px;
}

.link {
  color: #4361ee;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.empty-field {
  color: #999;
  font-style: italic;
}

.bio {
  display: block;
}

.bio p {
  margin: 0;
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #f0f4ff;
  color: #4361ee;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.profile-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e53e3e;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  text-decoration: none;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-outline {
  background-color: transparent;
  color: #4361ee;
  border: 1px solid #4361ee;
}

.btn-outline:hover {
  background-color: #f0f4ff;
}

@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .profile-content {
    padding: 1rem;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.gallery-item {
  height: 150px;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.profile-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: #cbd5e0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
}

.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  resize: vertical;
}
</style> 