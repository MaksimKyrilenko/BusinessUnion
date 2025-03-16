<template>
  <div class="profile-edit">
    <h1>Редактирование профиля</h1>
    
    <form @submit.prevent="saveProfile" class="edit-form">
      <div class="form-section">
        <h2>Основная информация</h2>
        
        <div class="form-group">
          <label>Имя пользователя</label>
          <input type="text" v-model="profile.username" required />
        </div>

        <div class="form-group">
          <label>Тип пользователя</label>
          <select v-model="profile.userType">
            <option value="businessman">Бизнесмен</option>
            <option value="investor">Инвестор</option>
            <option value="crypto_trader">Крипто-трейдер</option>
            <option value="startup_founder">Основатель стартапа</option>
          </select>
        </div>

        <div class="form-group">
          <label>Компания</label>
          <input type="text" v-model="profile.company" />
        </div>

        <div class="form-group">
          <label>Должность</label>
          <input type="text" v-model="profile.position" />
        </div>
      </div>

      <div class="form-section">
        <h2>Специализация</h2>
        <div class="form-group">
          <label>Области специализации (через запятую)</label>
          <input 
            type="text" 
            v-model="specializationInput"
            @input="updateSpecialization" 
            placeholder="Например: Финансы, Маркетинг, IT" 
          />
        </div>
      </div>

      <div class="form-section">
        <h2>Контакты</h2>
        <div class="form-group">
          <label>Веб-сайт</label>
          <input type="url" v-model="profile.website" placeholder="https://" />
        </div>

        <div class="form-group">
          <label>LinkedIn</label>
          <input 
            type="url" 
            v-model="profile.socialLinks.linkedin" 
            placeholder="https://linkedin.com/in/username" 
          />
        </div>

        <div class="form-group">
          <label>Twitter</label>
          <input 
            type="url" 
            v-model="profile.socialLinks.twitter" 
            placeholder="https://twitter.com/username" 
          />
        </div>

        <div class="form-group">
          <label>Telegram</label>
          <input 
            type="text" 
            v-model="profile.socialLinks.telegram" 
            placeholder="@username" 
          />
        </div>
      </div>

      <div class="form-actions">
        <BaseButton type="submit">Сохранить изменения</BaseButton>
        <BaseButton 
          type="button" 
          variant="secondary" 
          @click="cancel"
        >
          Отмена
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'

export default {
  name: 'ProfileEdit',
  components: {
    BaseButton
  },
  data() {
    return {
      profile: {
        username: '',
        userType: '',
        company: '',
        position: '',
        specialization: [],
        website: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          telegram: ''
        }
      },
      specializationInput: '',
    }
  },
  async created() {
    try {
      const response = await api.get('/users/profile')
      this.profile = { ...response.data }
      this.specializationInput = this.profile.specialization.join(', ')
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error)
    }
  },
  methods: {
    updateSpecialization(event) {
      this.profile.specialization = event.target.value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    },
    async saveProfile() {
      try {
        await api.put('/users/profile', this.profile)
        this.$router.push('/profile')
      } catch (error) {
        console.error('Ошибка при сохранении профиля:', error)
      }
    },
    cancel() {
      this.$router.push('/profile')
    }
  }
}
</script>

<style scoped>
.profile-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.edit-form {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus, select:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.2);
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}
</style> 