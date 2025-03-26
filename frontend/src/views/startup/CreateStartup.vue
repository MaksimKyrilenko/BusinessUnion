<template>
  <div class="create-startup">
    <h1>Создание стартапа</h1>

    <form @submit.prevent="handleSubmit" class="startup-form">
      <div class="form-group">
        <label for="title">Название проекта</label>
        <input
          type="text"
          id="title"
          v-model="form.title"
          class="form-control"
          required
          placeholder="Введите название вашего проекта"
        />
      </div>

      <div class="form-group">
        <label for="description">Описание проекта</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="5"
          required
          placeholder="Опишите ваш проект, его цели и преимущества"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="category">Категория</label>
        <select
          id="category"
          v-model="form.category"
          class="form-control"
          required
        >
          <option value="">Выберите категорию</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="investmentNeeded">Требуемые инвестиции</label>
          <div class="input-group">
            <input
              type="number"
              id="investmentNeeded"
              v-model="form.investmentNeeded"
              class="form-control"
              required
              min="100000"
              step="100000"
            />
            <span class="input-group-text">₽</span>
          </div>
        </div>

        <div class="form-group">
          <label for="minInvestment">Минимальная инвестиция</label>
          <div class="input-group">
            <input
              type="number"
              id="minInvestment"
              v-model="form.minInvestment"
              class="form-control"
              required
              min="10000"
              step="10000"
            />
            <span class="input-group-text">₽</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="expectedRoi">Ожидаемая ROI (%)</label>
        <div class="input-group">
          <input
            type="number"
            id="expectedRoi"
            v-model="form.expectedRoi"
            class="form-control"
            required
            min="0"
            max="1000"
            step="1"
          />
          <span class="input-group-text">%</span>
        </div>
      </div>

      <div class="form-group">
        <label for="businessPlan">Бизнес-план</label>
        <input
          type="file"
          id="businessPlan"
          @change="handleFileUpload"
          class="form-control"
          accept=".pdf,.doc,.docx"
        />
        <div class="form-text">
          Загрузите файл с бизнес-планом (PDF, DOC, DOCX)
        </div>
      </div>

      <div class="form-group">
        <label for="presentation">Презентация</label>
        <input
          type="file"
          id="presentation"
          @change="handleFileUpload"
          class="form-control"
          accept=".pdf,.ppt,.pptx"
        />
        <div class="form-text">
          Загрузите презентацию проекта (PDF, PPT, PPTX)
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          class="btn btn-secondary"
          @click="goBack"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Создание...' : 'Создать стартап' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';

export default {
  name: 'CreateStartup',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const categories = ref([]);

    const form = ref({
      title: '',
      description: '',
      category: '',
      investmentNeeded: 100000,
      minInvestment: 10000,
      expectedRoi: 30,
      businessPlan: null,
      presentation: null
    });

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/categories');
        categories.value = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const field = event.target.id;
      form.value[field] = file;
    };

    const handleSubmit = async () => {
      loading.value = true;
      try {
        const formData = new FormData();
        Object.keys(form.value).forEach(key => {
          if (form.value[key] !== null) {
            formData.append(key, form.value[key]);
          }
        });

        await axios.post('/projects', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        router.push('/startup/my-startups');
      } catch (error) {
        console.error('Error creating startup:', error);
        alert('Произошла ошибка при создании стартапа');
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      form,
      loading,
      categories,
      handleFileUpload,
      handleSubmit,
      goBack
    };
  }
};
</script>

<style scoped>
.create-startup {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.startup-form {
  background: white;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group .form-control {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group-text {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: none;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  color: #64748b;
}

textarea.form-control {
  min-height: 120px;
  resize: vertical;
}

input[type="file"].form-control {
  padding: 0.5rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  cursor: pointer;
}

input[type="file"].form-control:hover {
  border-color: #2196F3;
  background: #f1f5f9;
}

.form-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 16px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: #2196F3;
  color: white;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
}

.btn-primary:hover {
  background: #1976D2;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-primary:disabled {
  background: #2196F3;
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background: #e2e8f0;
}
</style> 