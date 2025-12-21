<template>
  <div class="project-form">
    <h2>{{ project ? 'Редактирование проекта' : 'Создание проекта' }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Название проекта</label>
        <input 
          type="text" 
          v-model="formData.title"
          required
          placeholder="Введите название проекта"
        >
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea 
          v-model="formData.description"
          required
          rows="4"
          placeholder="Опишите ваш проект"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Требуемые инвестиции (₽)</label>
          <input 
            type="number" 
            v-model="formData.investmentNeeded"
            required
            min="0"
            step="1000"
          >
        </div>

        <div class="form-group">
          <label>Ожидаемый ROI (%)</label>
          <input 
            type="number" 
            v-model="formData.expectedRoi"
            required
            min="0"
            max="1000"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Категория</label>
        <select v-model="formData.categoryId" required>
          <option value="">Выберите категорию</option>
          <option 
            v-for="category in categories" 
            :key="category.id" 
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Изображение проекта</label>
        <input 
          type="file" 
          @change="handleImageUpload"
          accept="image/*"
        >
        <img 
          v-if="formData.image" 
          :src="formData.image" 
          alt="Preview" 
          class="image-preview"
        >
      </div>

      <div class="form-group">
        <label>Дополнительная информация</label>
        <div class="additional-info">
          <div class="info-item">
            <label>
              <input 
                type="checkbox" 
                v-model="formData.hasBusinessPlan"
              >
              Есть бизнес-план
            </label>
          </div>
          <div class="info-item">
            <label>
              <input 
                type="checkbox" 
                v-model="formData.hasTeam"
              >
              Есть команда
            </label>
          </div>
          <div class="info-item">
            <label>
              <input 
                type="checkbox" 
                v-model="formData.hasMVP"
              >
              Есть MVP
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton type="submit">
          {{ project ? 'Сохранить изменения' : 'Создать проект' }}
        </BaseButton>
        <BaseButton 
          type="button" 
          variant="secondary" 
          @click="$emit('cancel')"
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
import fileUploadService from '@/services/fileUpload.service'

export default {
  name: 'ProjectForm',
  components: {
    BaseButton
  },
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      categories: [],
      isUploadingImage: false,
      formData: {
        title: '',
        description: '',
        investmentNeeded: 0,
        expectedRoi: 0,
        categoryId: '',
        image: '',
        hasBusinessPlan: false,
        hasTeam: false,
        hasMVP: false
      }
    }
  },
  async created() {
    await this.loadCategories()
    if (this.project) {
      this.formData = { ...this.project }
    }
  },
  methods: {
    async loadCategories() {
      try {
        const response = await api.get('/projects/categories')
        this.categories = response.data
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      }
    },
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        this.isUploadingImage = true
        const result = await fileUploadService.uploadImage(file)
        this.formData.image = result.url
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error)
      } finally {
        this.isUploadingImage = false
      }
    },
    handleSubmit() {
      this.$emit('submit', this.formData)
    }
  }
}
</script>

<style scoped>
.project-form {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input[type="text"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.image-preview {
  max-width: 200px;
  margin-top: 10px;
  border-radius: 4px;
}

.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.info-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}
</style> 