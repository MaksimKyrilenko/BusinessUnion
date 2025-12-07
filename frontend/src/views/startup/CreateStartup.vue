<template>
  <div class="create-startup">
    <h1>{{ isEditMode ? 'Редактирование' : 'Создание' }} стартапа</h1>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>{{ isEditMode ? 'Загрузка данных стартапа...' : 'Проверка данных...' }}</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="startup-form">
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

      <div class="form-group">
        <label for="stage">Этап проекта</label>
        <select
          id="stage"
          v-model="form.stage"
          class="form-control"
          required
        >
          <option value="">Выберите этап проекта</option>
          <option v-for="stage in stages" :key="stage.id" :value="stage.id">
            {{ stage.name }}
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
        <label for="location">Местоположение</label>
        <input
          type="text"
          id="location"
          v-model="form.location"
          class="form-control"
          required
          placeholder="Введите местоположение проекта"
        />
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

      <div class="form-group">
        <label for="image">Изображение проекта</label>
        <input
          type="file"
          id="image"
          @change="handleFileUpload"
          class="form-control"
          accept="image/*"
        />
        <div class="form-text">
          Загрузите изображение проекта
        </div>
      </div>

      <div class="form-group">
        <label for="additionalInfo">Дополнительная информация</label>
        <div class="input-group">
          <input
            type="text"
            id="additionalInfo"
            v-model="form.additionalInfo.foundedAt"
            class="form-control"
            required
            placeholder="Год основания"
          />
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
          {{ loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать стартап') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { projectsService } from '@/services/projects.service';

export default {
  name: 'CreateStartup',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const loading = ref(false);
    const error = ref(null);
    const categories = ref([]);
    const isEditMode = ref(false);
    const stages = ref([
      { id: 'idea', name: 'Идея' },
      { id: 'mvp', name: 'MVP' },
      { id: 'growth', name: 'Рост' },
      { id: 'scaling', name: 'Масштабирование' }
    ]);

    const form = ref({
      title: '',
      description: '',
      category: null,
      stage: 'idea',
      investmentNeeded: 100000,
      minInvestment: 10000,
      expectedRoi: 30,
      location: '',
      businessPlan: null,
      presentation: null,
      image: null,
      imageBase64: null,
      additionalInfo: {
        foundedAt: '',
        hasTeam: false,
        hasMVP: false,
        teamSize: '',
        market: ''
      }
    });

    // Проверяем, находимся ли мы в режиме редактирования
    const checkEditMode = async () => {
      if (props.id || route.params.id) {
        const startupId = props.id || route.params.id;
        
        // Проверка валидности ID
        if (!startupId || isNaN(Number(startupId))) {
          error.value = 'Неверный идентификатор стартапа';
          return;
        }
        
        isEditMode.value = true;
        
        loading.value = true;
        try {
          const response = await projectsService.getProjectById(Number(startupId));
          
          // Заполняем форму данными проекта
          form.value.title = response.title;
          form.value.description = response.description;
          form.value.category = response.categoryId || response.category?.id;
          form.value.stage = response.stage;
          form.value.investmentNeeded = response.investmentNeeded;
          form.value.minInvestment = response.minInvestment;
          form.value.expectedRoi = response.expectedRoi;
          form.value.location = response.location;
          
          // Сохраняем изображение, если оно есть (может быть base64 или URL)
          if (response.image) {
            form.value.image = response.image;
            // Если это base64, сохраняем также в imageBase64
            if (response.image.startsWith('data:image')) {
              form.value.imageBase64 = response.image;
            }
          }
          
          if (response.additionalInfo) {
            form.value.additionalInfo = response.additionalInfo;
          }
        } catch (error) {
          console.error('Ошибка при получении данных проекта:', error);
          error.value = 'Не удалось загрузить данные проекта. Пожалуйста, попробуйте позже.';
        } finally {
          loading.value = false;
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await projectsService.getAllCategories();
        categories.value = response;
        console.log('Категории загружены:', categories.value);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      const field = event.target.id;
      
      if (!file) return;
      
      // Для изображений конвертируем в base64
      if (field === 'image' && file.type.startsWith('image/')) {
        try {
          const base64 = await convertFileToBase64(file);
          form.value[field] = base64;
          form.value.imageBase64 = base64; // Сохраняем также отдельно для отправки
        } catch (error) {
          console.error('Ошибка при конвертации изображения в base64:', error);
          error.value = 'Ошибка при обработке изображения';
        }
      } else {
        // Для других файлов оставляем как есть
        form.value[field] = file;
      }
    };

    const convertFileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        error.value = null;

        // Создаем копию данных формы
        const { businessPlan, presentation, image, imageBase64, ...projectData } = form.value;
        
        // Добавляем категорию
        projectData.category = { id: Number(form.value.category) };
        
        // Добавляем base64 изображение, если оно есть
        if (imageBase64) {
          projectData.image = imageBase64;
        }

        let project;
        if (isEditMode.value) {
          project = await projectsService.updateProject(props.id || route.params.id, projectData);
        } else {
          project = await projectsService.createProject(projectData);
        }

        // Если есть другие файлы для загрузки (не изображения)
        if (businessPlan || presentation) {
          const formData = new FormData();
          if (businessPlan) formData.append('businessPlan', businessPlan);
          if (presentation) formData.append('presentation', presentation);

          try {
            await projectsService.uploadProjectFiles(project.id, formData);
          } catch (uploadError) {
            console.error('Ошибка при загрузке файлов:', uploadError);
            // Продолжаем выполнение даже при ошибке загрузки файлов
          }
        }

        // Перенаправляем на страницу "Мои стартапы"
        router.push('/startup/my-startups');
      } catch (err) {
        console.error('Ошибка при сохранении проекта:', err);
        error.value = err.response?.data?.message || 'Произошла ошибка при сохранении проекта';
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchCategories();
      checkEditMode();
    });

    return {
      form,
      loading,
      error,
      categories,
      stages,
      isEditMode,
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

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
}
</style> 