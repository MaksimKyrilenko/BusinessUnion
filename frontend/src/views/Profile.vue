<template>
  <div class="profile">
    <div v-if="isLoading" class="loading">
      Загрузка профиля...
    </div>
    <div v-else-if="userData" class="profile-content">
      <div class="profile-header">
        <h1>Профиль пользователя</h1>
        <button @click="isEditing = !isEditing" class="btn btn-outline">
          {{ isEditing ? 'Отменить' : 'Редактировать' }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-section">
          <h2>Личные данные</h2>
          <div class="form-group">
            <label for="firstName">Имя</label>
            <input
              type="text"
              id="firstName"
              v-model="userData.firstName"
              :disabled="!isEditing"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Фамилия</label>
            <input
              type="text"
              id="lastName"
              v-model="userData.lastName"
              :disabled="!isEditing"
              required
            />
          </div>

          <div class="form-group">
            <label for="middleName">Отчество</label>
            <input
              type="text"
              id="middleName"
              v-model="userData.middleName"
              :disabled="!isEditing"
            />
          </div>

          <div class="form-group">
            <label for="gender">Пол</label>
            <select
              id="gender"
              v-model="userData.gender"
              :disabled="!isEditing"
            >
              <option value="">Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <h2>Контактная информация</h2>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="userData.email"
              :disabled="!isEditing"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              v-model="userData.phone"
              :disabled="!isEditing"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Интересы и опыт</h2>
          <div class="form-group">
            <label for="interests">Интересы</label>
            <textarea
              id="interests"
              v-model="userData.interests"
              :disabled="!isEditing"
              rows="4"
              placeholder="Опишите ваши интересы и опыт"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h2>Настройки</h2>
          <div class="form-group">
            <label for="notifications">Уведомления</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="userData.notifications.email"
                  :disabled="!isEditing"
                />
                Email уведомления
              </label>
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="userData.notifications.push"
                  :disabled="!isEditing"
                />
                Push уведомления
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="theme">Тема</label>
            <select
              id="theme"
              v-model="userData.theme"
              :disabled="!isEditing"
            >
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
              <option value="system">Системная</option>
            </select>
          </div>
        </div>

        <div class="form-actions" v-if="isEditing">
          <button type="submit" class="btn btn-primary">Сохранить изменения</button>
        </div>
      </form>
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
      isEditing: false,
      isLoading: true,
      userData: {
        firstName: '',
        lastName: '',
        middleName: '',
        gender: '',
        email: '',
        phone: '',
        interests: '',
        notifications: {
          email: false,
          push: false
        },
        theme: 'light'
      }
    }
  },
  async created() {
    try {
      const response = await api.get('/users/profile');
      if (response.data.profile === null) {
        // Создаем новый профиль
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
        await api.post('/users/profile', profileData);
        // Получаем обновленные данные профиля
        const updatedResponse = await api.get('/users/profile');
        this.userData = updatedResponse.data;
      } else {
        this.userData = response.data;
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      this.$emit('error', 'Не удалось загрузить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async handleSubmit() {
      try {
        await api.put('/users/profile', this.userData);
        this.isEditing = false;
        this.$emit('success', 'Профиль успешно обновлен');
      } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
        this.$emit('error', 'Не удалось сохранить изменения. Пожалуйста, попробуйте позже.');
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

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

input[type="text"]:disabled,
input[type="email"]:disabled,
input[type="tel"]:disabled,
select:disabled,
textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-outline {
  border: 1px solid #28a745;
  color: #28a745;
  background: none;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .profile-content {
    padding: 1rem;
  }
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #dc3545;
}
</style> 