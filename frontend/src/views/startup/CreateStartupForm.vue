<template>
  <div class="create-startup-form">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Проверка данных...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="startup-form">
      <div class="form-group">
        <label for="modal-title">Название проекта</label>
        <input
          type="text"
          id="modal-title"
          v-model="form.title"
          class="form-control"
          required
          placeholder="Введите название вашего проекта"
        />
      </div>

      <div class="form-group">
        <label for="modal-description">Описание проекта</label>
        <textarea
          id="modal-description"
          v-model="form.description"
          class="form-control"
          rows="4"
          required
          placeholder="Опишите ваш проект, его цели и преимущества"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="modal-category">Категория</label>
        <select
          id="modal-category"
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
        <label for="modal-stage">Этап проекта</label>
        <select
          id="modal-stage"
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
          <label for="modal-investmentNeeded">Требуемые инвестиции</label>
          <div class="input-group">
            <input
              type="number"
              id="modal-investmentNeeded"
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
          <label for="modal-minInvestment">Минимальная инвестиция</label>
          <div class="input-group">
            <input
              type="number"
              id="modal-minInvestment"
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
        <label for="modal-expectedRoi">Ожидаемая ROI (%)</label>
        <div class="input-group">
          <input
            type="number"
            id="modal-expectedRoi"
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
        <label for="modal-location">Местоположение</label>
        <input
          type="text"
          id="modal-location"
          v-model="form.location"
          class="form-control"
          required
          placeholder="Введите местоположение проекта"
        />
      </div>

      <div class="form-group">
        <label for="modal-businessPlan">Бизнес-план</label>
        <input
          type="file"
          id="modal-businessPlan"
          @change="handleFileUpload"
          class="form-control"
          accept=".pdf,.doc,.docx"
        />
        <div class="form-text">
          Загрузите файл с бизнес-планом (PDF, DOC, DOCX)
        </div>
      </div>

      <div class="form-group">
        <label for="modal-presentation">Презентация</label>
        <input
          type="file"
          id="modal-presentation"
          @change="handleFileUpload"
          class="form-control"
          accept=".pdf,.ppt,.pptx"
        />
        <div class="form-text">
          Загрузите презентацию проекта (PDF, PPT, PPTX)
        </div>
      </div>

      <div class="form-group">
        <label for="modal-image">Изображение проекта</label>
        <input
          type="file"
          id="modal-image"
          @change="handleFileUpload"
          class="form-control"
          accept="image/*"
        />
        <div class="form-text">
          Загрузите изображение проекта
        </div>
      </div>

      <div class="form-group">
        <label for="modal-additionalInfo">Дополнительная информация</label>
        <div class="input-group">
          <input
            type="text"
            id="modal-additionalInfo"
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
          @click="$emit('cancel')"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Сохранение...' : (projectId ? 'Сохранить изменения' : 'Создать стартап') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { projectsService } from '@/services/projects.service';
import fileUploadService from '@/services/fileUpload.service';

export default {
  name: 'CreateStartupForm',
  props: {
    projectId: {
      type: [Number, String],
      default: null
    }
  },
  emits: ['success', 'cancel'],
  setup(props, { emit }) {
    const loading = ref(false);
    const error = ref(null);
    const categories = ref([]);
    const isUploadingImage = ref(false);
    const isUploadingBusinessPlan = ref(false);
    const isUploadingPresentation = ref(false);
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
      businessPlanUrl: null,
      presentation: null,
      presentationUrl: null,
      image: null,
      imageUrl: null,
      additionalInfo: {
        foundedAt: '',
        hasTeam: false,
        hasMVP: false,
        teamSize: '',
        market: ''
      }
    });

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
      const field = event.target.id.replace('modal-', '');
      
      if (!file) return;
      
      try {
        // Загружаем файлы в MinIO
        if (field === 'image' && file.type.startsWith('image/')) {
          isUploadingImage.value = true;
          const result = await fileUploadService.uploadImage(file);
          form.value.image = file.name;
          form.value.imageUrl = result.url;
        } else if (field === 'businessPlan') {
          isUploadingBusinessPlan.value = true;
          const result = await fileUploadService.uploadProjectFile(file);
          form.value.businessPlan = file.name;
          form.value.businessPlanUrl = result.url;
        } else if (field === 'presentation') {
          isUploadingPresentation.value = true;
          const result = await fileUploadService.uploadProjectFile(file);
          form.value.presentation = file.name;
          form.value.presentationUrl = result.url;
        }
      } catch (err) {
        console.error('Ошибка при загрузке файла:', err);
        error.value = 'Ошибка при загрузке файла';
      } finally {
        isUploadingImage.value = false;
        isUploadingBusinessPlan.value = false;
        isUploadingPresentation.value = false;
      }
    };

    const loadProjectData = async () => {
      if (!props.projectId) return;
      
      loading.value = true;
      try {
        const project = await projectsService.getProjectById(Number(props.projectId));
        
        // Заполняем форму данными проекта
        form.value.title = project.title || '';
        form.value.description = project.description || '';
        form.value.category = project.categoryId || project.category?.id || null;
        form.value.stage = project.stage || 'idea';
        form.value.investmentNeeded = project.investmentNeeded || 100000;
        form.value.minInvestment = project.minInvestment || 10000;
        form.value.expectedRoi = project.expectedRoi || 30;
        form.value.location = project.location || '';
        
        // Сохраняем изображение, если оно есть
        if (project.image) {
          form.value.image = project.image;
          if (project.image.startsWith('data:image')) {
            form.value.imageBase64 = project.image;
          }
        }
        
        if (project.additionalInfo) {
          form.value.additionalInfo = { ...form.value.additionalInfo, ...project.additionalInfo };
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных проекта:', err);
        error.value = 'Не удалось загрузить данные проекта';
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      try {
        loading.value = true;
        error.value = null;

        console.log('=== ОТЛАДКА СОЗДАНИЯ СТАРТАПА ===');
        console.log('form.value:', JSON.stringify(form.value, null, 2));
        console.log('form.value.businessPlanUrl:', form.value.businessPlanUrl);
        console.log('form.value.presentationUrl:', form.value.presentationUrl);

        // Создаем копию данных формы
        const { businessPlan, presentation, image, businessPlanUrl, presentationUrl, imageUrl, ...projectData } = form.value;
        
        console.log('После деструктуризации:');
        console.log('businessPlanUrl:', businessPlanUrl);
        console.log('presentationUrl:', presentationUrl);
        
        // Добавляем категорию
        projectData.category = { id: Number(form.value.category) };
        
        // Добавляем URL изображения из MinIO
        if (imageUrl) {
          projectData.image = imageUrl;
        }
        
        // Добавляем URL файлов из MinIO
        if (businessPlanUrl) {
          projectData.businessPlanUrl = businessPlanUrl;
          console.log('Добавлен businessPlanUrl в projectData:', businessPlanUrl);
        }
        if (presentationUrl) {
          projectData.presentationUrl = presentationUrl;
          console.log('Добавлен presentationUrl в projectData:', presentationUrl);
        }

        console.log('Итоговые projectData:', JSON.stringify(projectData, null, 2));

        let project;
        if (props.projectId) {
          // Режим редактирования
          project = await projectsService.updateProject(Number(props.projectId), projectData);
        } else {
          // Режим создания
          project = await projectsService.createProject(projectData);
        }

        // Эмитим событие успешного создания/обновления
        emit('success');
      } catch (err) {
        console.error('Ошибка при сохранении проекта:', err);
        error.value = err.response?.data?.message || 'Произошла ошибка при сохранении проекта';
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await fetchCategories();
      if (props.projectId) {
        await loadProjectData();
      }
    });

    return {
      form,
      loading,
      error,
      categories,
      stages,
      isUploadingImage,
      isUploadingBusinessPlan,
      isUploadingPresentation,
      handleFileUpload,
      handleSubmit,
      projectId: props.projectId
    };
  }
};
</script>

<style scoped>
.create-startup-form {
  max-width: 100%;
}

.startup-form {
  background: white;
  padding: 1rem;
  border-radius: 16px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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
  margin-bottom: 1.25rem;
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
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
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
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  color: #64748b;
  font-size: 0.95rem;
}

textarea.form-control {
  min-height: 100px;
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
  font-size: 0.8rem;
  color: #64748b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.95rem;
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
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

