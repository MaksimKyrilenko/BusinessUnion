<template>
  <div class="profile">
    <div v-if="isLoading" class="loading">
      Загрузка профиля...
    </div>
    <div v-else-if="userData" class="profile-content">
      <div class="profile-header">
        <h1>Профиль пользователя</h1>
        <router-link to="/profile/edit" class="btn btn-outline">
          Редактировать
        </router-link>
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

          <div v-if="userData.middleName" class="profile-field">
            <span class="field-label">Отчество:</span>
            <span class="field-value">{{ userData.middleName }}</span>
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
          
          <div v-if="userData.profile.company || userData.profile.position" class="profile-field">
            <span class="field-label">Компания:</span>
            <span class="field-value">{{ userData.profile.company || 'Не указана' }}</span>
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

        <div v-if="userData.userType === 'INVESTOR' && userData.profile?.investmentSize" class="profile-section">
          <h2>Инвестиционная деятельность</h2>
          
          <div class="profile-field">
            <span class="field-label">Размер инвестиций:</span>
            <span class="field-value">{{ formatCurrency(userData.profile.investmentSize) }} ₽</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="error">
      Не удалось загрузить профиль
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'Profile',
  data() {
    return {
      isLoading: true,
      userData: null
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
        this.userData.profile.socialLinks.telegram
      );
    }
  },
  async created() {
    try {
      // Получим ID текущего пользователя из localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('ID пользователя не найден в localStorage');
        this.$router.push('/login');
        return;
      }
      
      console.log('Загружаем профиль для пользователя ID:', userId);
      
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
            telegram: ''
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
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('ru-RU').format(value);
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
</style> 