<template>
  <div class="edit-profile">
    <div v-if="isLoading" class="loading">
      Загрузка профиля...
    </div>
    <div v-else class="profile-content">
      <div class="profile-header">
        <h1>Редактирование профиля</h1>
        <div class="header-actions">
          <router-link to="/profile" class="btn btn-outline">Отмена</router-link>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-section">
          <h2>Основная информация</h2>
          <div class="avatar-section">
            <div class="avatar-preview" :style="{ backgroundImage: userData.profile?.avatar ? `url(${userData.profile.avatar})` : 'none' }">
              <div v-if="!userData.profile?.avatar" class="avatar-placeholder">
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="avatar-actions">
              <label class="btn btn-outline btn-sm">
                Загрузить фото
                <input type="file" accept="image/*" @change="handleAvatarChange" hidden />
              </label>
              <button v-if="userData.profile?.avatar" type="button" class="btn btn-danger btn-sm" @click="removeAvatar">
                Удалить
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="firstName">Имя</label>
            <input
              type="text"
              id="firstName"
              v-model="userData.firstName"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Фамилия</label>
            <input
              type="text"
              id="lastName"
              v-model="userData.lastName"
              required
            />
          </div>

          <div class="form-group">
            <label for="middleName">Отчество</label>
            <input
              type="text"
              id="middleName"
              v-model="userData.middleName"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>О себе</h2>
          <div class="form-group">
            <label for="bio">Биография</label>
            <textarea
              id="bio"
              v-model="profileData.bio"
              rows="4"
              placeholder="Расскажите о себе"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h2>Профессиональная информация</h2>
          <div class="form-group">
            <label for="company">Компания</label>
            <input
              type="text"
              id="company"
              v-model="profileData.company"
              placeholder="Название компании"
            />
          </div>

          <div class="form-group">
            <label for="position">Должность</label>
            <input
              type="text"
              id="position"
              v-model="profileData.position"
              placeholder="Ваша должность"
            />
          </div>

          <div class="form-group">
            <label for="website">Веб-сайт</label>
            <input
              type="url"
              id="website"
              v-model="profileData.website"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Социальные сети</h2>
          <div class="form-group">
            <label for="linkedin">LinkedIn</label>
            <input
              type="url"
              id="linkedin"
              v-model="profileData.socialLinks.linkedin"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div class="form-group">
            <label for="twitter">Twitter</label>
            <input
              type="url"
              id="twitter"
              v-model="profileData.socialLinks.twitter"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div class="form-group">
            <label for="telegram">Telegram</label>
            <input
              type="text"
              id="telegram"
              v-model="profileData.socialLinks.telegram"
              placeholder="@username"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Специализация и интересы</h2>
          <div class="form-group">
            <label>Специализация</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(tag, index) in profileData.specialization" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeSpecialization(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newSpecialization" 
                @keydown.enter.prevent="addSpecialization"
                placeholder="Добавьте специализацию и нажмите Enter"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Интересы</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(tag, index) in profileData.interests" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeInterest(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newInterest" 
                @keydown.enter.prevent="addInterest"
                placeholder="Добавьте интерес и нажмите Enter"
              />
            </div>
          </div>

          <div v-if="userData.userType === 'INVESTOR'" class="form-group">
            <label for="investmentSize">Размер инвестиций (₽)</label>
            <input
              type="number"
              id="investmentSize"
              v-model.number="profileData.investmentSize"
              min="0"
              step="10000"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <router-link to="/profile" class="btn btn-outline">Отмена</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'EditProfile',
  data() {
    return {
      isLoading: true,
      isSaving: false,
      userData: {
        id: null,
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        userType: '',
        profile: null
      },
      profileData: {
        bio: '',
        avatar: null,
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
      },
      newSpecialization: '',
      newInterest: '',
      avatarFile: null
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
      
      console.log('Загружаем профиль для редактирования, пользователь ID:', userId);
      
      const response = await api.get('/users/profile');
      
      // Проверяем, что ID загруженного профиля совпадает с ID в localStorage
      if (response.data.id && response.data.id.toString() !== userId) {
        console.warn('ID загруженного профиля не совпадает с ID в localStorage');
        // Принудительно обновим localStorage
        localStorage.setItem('userId', response.data.id.toString());
      }
      
      this.userData = response.data;
      
      if (this.userData.profile) {
        // Заполняем данные профиля
        const profile = this.userData.profile;
        
        // Инициализируем socialLinks с пустыми строками, если они null или undefined
        const socialLinks = profile.socialLinks || {};
        
        this.profileData = {
          bio: profile.bio || '',
          avatar: profile.avatar || null,
          company: profile.company || '',
          position: profile.position || '',
          website: profile.website || '',
          socialLinks: {
            linkedin: socialLinks.linkedin || '',
            twitter: socialLinks.twitter || '',
            telegram: socialLinks.telegram || ''
          },
          specialization: Array.isArray(profile.specialization) ? [...profile.specialization] : [],
          interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
          investmentSize: profile.investmentSize || 0
        };
      } else {
        // Инициализируем пустой профиль, если его нет
        this.profileData = {
          bio: '',
          avatar: null,
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
        
        // Если профиля нет, перенаправляем на страницу профиля
        // чтобы сначала создать его
        this.$router.push('/profile');
        return;
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
      
      this.$emit('error', 'Не удалось загрузить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    getUserInitials() {
      if (!this.userData.firstName && !this.userData.lastName) return '?';
      return (this.userData.firstName?.charAt(0) || '') + (this.userData.lastName?.charAt(0) || '');
    },
    async handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Здесь должна быть логика загрузки изображения на сервер
      this.avatarFile = file;
      
      // Предпросмотр изображения
      const reader = new FileReader();
      reader.onload = e => {
        this.profileData.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeAvatar() {
      this.profileData.avatar = null;
      this.avatarFile = null;
    },
    addSpecialization() {
      if (this.newSpecialization.trim()) {
        this.profileData.specialization.push(this.newSpecialization.trim());
        this.newSpecialization = '';
      }
    },
    removeSpecialization(index) {
      this.profileData.specialization.splice(index, 1);
    },
    addInterest() {
      if (this.newInterest.trim()) {
        this.profileData.interests.push(this.newInterest.trim());
        this.newInterest = '';
      }
    },
    removeInterest(index) {
      this.profileData.interests.splice(index, 1);
    },
    async handleSubmit() {
      try {
        this.isSaving = true;
        
        // Подготовим данные для отправки
        const dataToSend = { ...this.profileData };
        
        // Обработка числовых полей
        if (dataToSend.investmentSize === null || dataToSend.investmentSize === undefined || dataToSend.investmentSize === '') {
          dataToSend.investmentSize = 0; // Устанавливаем значение по умолчанию, если поле пустое
        } else {
          // Убедимся, что значение является числом
          dataToSend.investmentSize = Number(dataToSend.investmentSize);
          
          // Если после преобразования получился NaN, устанавливаем 0
          if (isNaN(dataToSend.investmentSize)) {
            dataToSend.investmentSize = 0;
          }
        }
        
        // Обработка URL-полей (если они пустые, отправляем пустую строку)
        if (dataToSend.website === null || dataToSend.website === undefined) {
          dataToSend.website = '';
        }
        
        // Обработка socialLinks
        if (!dataToSend.socialLinks) {
          dataToSend.socialLinks = {
            linkedin: '',
            twitter: '',
            telegram: ''
          };
        } else {
          // Заполняем пустыми строками, если значения отсутствуют
          dataToSend.socialLinks = {
            linkedin: dataToSend.socialLinks.linkedin || '',
            twitter: dataToSend.socialLinks.twitter || '',
            telegram: dataToSend.socialLinks.telegram || ''
          };
        }
        
        // Обновляем профиль
        try {
          console.log('Отправляемые данные:', dataToSend);
          await api.patch('/users/profile', dataToSend);
          this.$router.push('/profile');
          this.$emit('success', 'Профиль успешно обновлен');
        } catch (error) {
          console.error('Ошибка при обновлении профиля:', error.response?.data || error.message);
          let errorMessage = 'Не удалось сохранить изменения.';
          
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage += ' ' + error.response.data.message;
          } else {
            errorMessage += ' Пожалуйста, попробуйте позже.';
          }
          
          this.$emit('error', errorMessage);
        }
      } finally {
        this.isSaving = false;
      }
    }
  }
}
</script>

<style scoped>
.edit-profile {
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

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="url"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
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

.btn-danger {
  background-color: transparent;
  color: #e53e3e;
  border: 1px solid #e53e3e;
}

.btn-danger:hover {
  background-color: #fff5f5;
}

.avatar-section {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: #4361ee;
  background-size: cover;
  background-position: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-input {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: #fff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background-color: #f0f4ff;
  color: #4361ee;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #4361ee;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags-input input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}
</style> 