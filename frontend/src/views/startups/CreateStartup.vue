<template>
  <div class="create-startup">
    <h1>Создание стартапа</h1>
    
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="startup-form">
        <!-- Основная информация -->
        <div class="form-section">
          <h2>Основная информация</h2>
          
          <div class="form-group">
            <label>Название стартапа</label>
            <input 
              type="text" 
              v-model="formData.name" 
              required
              placeholder="Введите название"
            >
          </div>
          
          <div class="form-group">
            <label>Сектор</label>
            <select v-model="formData.sector" required>
              <option value="">Выберите сектор</option>
              <option v-for="sector in sectors" 
                      :key="sector.id" 
                      :value="sector.id"
              >
                {{ sector.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Стадия</label>
            <select v-model="formData.stage" required>
              <option value="">Выберите стадию</option>
              <option value="idea">Идея</option>
              <option value="mvp">MVP</option>
              <option value="growth">Рост</option>
              <option value="scaling">Масштабирование</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Требуемые инвестиции</label>
            <input 
              type="number" 
              v-model="formData.investment" 
              required
              min="0"
              placeholder="Сумма в рублях"
            >
          </div>
        </div>

        <!-- Описание -->
        <div class="form-section">
          <h2>Описание</h2>
          
          <div class="form-group">
            <label>Краткое описание</label>
            <textarea 
              v-model="formData.shortDescription" 
              required
              rows="3"
              placeholder="Краткое описание проекта"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Подробное описание</label>
            <textarea 
              v-model="formData.description" 
              required
              rows="5"
              placeholder="Подробное описание проекта"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Проблема</label>
            <textarea 
              v-model="formData.problem" 
              required
              rows="3"
              placeholder="Какую проблему решает ваш проект?"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Решение</label>
            <textarea 
              v-model="formData.solution" 
              required
              rows="3"
              placeholder="Как вы решаете эту проблему?"
            ></textarea>
          </div>
        </div>

        <!-- Технологии -->
        <div class="form-section">
          <h2>Технологии</h2>
          
          <div class="form-group">
            <label>Используемые технологии</label>
            <div class="tech-tags">
              <div v-for="tech in technologies" 
                   :key="tech.id" 
                   class="tech-tag"
                   :class="{ active: formData.technologies.includes(tech.id) }"
                   @click="toggleTechnology(tech.id)"
              >
                {{ tech.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Команда -->
        <div class="form-section">
          <h2>Команда</h2>
          
          <div class="team-members">
            <div v-for="(member, index) in formData.team" 
                 :key="index" 
                 class="team-member"
            >
              <div class="member-header">
                <h3>Участник команды {{ index + 1 }}</h3>
                <button 
                  type="button" 
                  class="remove-btn"
                  @click="removeTeamMember(index)"
                >
                  Удалить
                </button>
              </div>
              
              <div class="member-fields">
                <div class="form-group">
                  <label>ФИО</label>
                  <input 
                    type="text" 
                    v-model="member.name" 
                    required
                    placeholder="Введите ФИО"
                  >
                </div>
                
                <div class="form-group">
                  <label>Роль</label>
                  <input 
                    type="text" 
                    v-model="member.role" 
                    required
                    placeholder="Введите роль"
                  >
                </div>
                
                <div class="form-group">
                  <label>Опыт</label>
                  <textarea 
                    v-model="member.experience" 
                    required
                    rows="2"
                    placeholder="Опишите опыт"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <button 
              type="button" 
              class="add-btn"
              @click="addTeamMember"
            >
              Добавить участника
            </button>
          </div>
        </div>

        <!-- Документы -->
        <div class="form-section">
          <h2>Документы</h2>
          
          <div class="form-group">
            <label>Презентация</label>
            <div class="file-upload">
              <input 
                type="file" 
                @change="handleFileUpload('presentation', $event)"
                accept=".pdf,.ppt,.pptx"
              >
              <div class="file-info" v-if="formData.presentation">
                {{ formData.presentation.name }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Бизнес-план</label>
            <div class="file-upload">
              <input 
                type="file" 
                @change="handleFileUpload('businessPlan', $event)"
                accept=".pdf,.doc,.docx"
              >
              <div class="file-info" v-if="formData.businessPlan">
                {{ formData.businessPlan.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="form-actions">
          <BaseButton 
            type="button" 
            variant="secondary"
            @click="handleCancel"
          >
            Отмена
          </BaseButton>
          <BaseButton 
            type="submit" 
            variant="primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Сохранение...' : 'Создать стартап' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'
import fileUploadService from '@/services/fileUpload.service'

export default {
  name: 'CreateStartup',
  components: {
    BaseButton
  },
  data() {
    return {
      formData: {
        name: '',
        sector: '',
        stage: '',
        investment: null,
        shortDescription: '',
        description: '',
        problem: '',
        solution: '',
        technologies: [],
        team: [
          {
            name: '',
            role: '',
            experience: ''
          }
        ],
        presentation: null,
        presentationUrl: null,
        businessPlan: null,
        businessPlanUrl: null
      },
      sectors: [],
      technologies: [],
      isSubmitting: false,
      isUploadingPresentation: false,
      isUploadingBusinessPlan: false
    }
  },
  methods: {
    async loadData() {
      try {
        const [sectorsResponse, technologiesResponse] = await Promise.all([
          api.get('/startups/sectors'),
          api.get('/startups/technologies')
        ])
        
        this.sectors = sectorsResponse.data
        this.technologies = technologiesResponse.data
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },
    toggleTechnology(techId) {
      const index = this.formData.technologies.indexOf(techId)
      if (index === -1) {
        this.formData.technologies.push(techId)
      } else {
        this.formData.technologies.splice(index, 1)
      }
    },
    addTeamMember() {
      this.formData.team.push({
        name: '',
        role: '',
        experience: ''
      })
    },
    removeTeamMember(index) {
      if (this.formData.team.length > 1) {
        this.formData.team.splice(index, 1)
      }
    },
    async handleFileUpload(type, event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        if (type === 'presentation') {
          this.isUploadingPresentation = true
          const result = await fileUploadService.uploadProjectFile(file)
          this.formData.presentation = file.name
          this.formData.presentationUrl = result.url
        } else if (type === 'businessPlan') {
          this.isUploadingBusinessPlan = true
          const result = await fileUploadService.uploadProjectFile(file)
          this.formData.businessPlan = file.name
          this.formData.businessPlanUrl = result.url
        }
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error)
      } finally {
        this.isUploadingPresentation = false
        this.isUploadingBusinessPlan = false
      }
    },
    async handleSubmit() {
      this.isSubmitting = true
      try {
        // Подготавливаем данные для отправки
        const submitData = {
          name: this.formData.name,
          sector: this.formData.sector,
          stage: this.formData.stage,
          investment: this.formData.investment,
          shortDescription: this.formData.shortDescription,
          description: this.formData.description,
          problem: this.formData.problem,
          solution: this.formData.solution,
          technologies: this.formData.technologies,
          team: this.formData.team
        }
        
        // Добавляем URL файлов из MinIO
        if (this.formData.presentationUrl) {
          submitData.presentation = this.formData.presentationUrl
        }
        if (this.formData.businessPlanUrl) {
          submitData.businessPlan = this.formData.businessPlanUrl
        }
        
        await api.post('/startups/create', submitData)
        
        // Перенаправляем на страницу стартапа
        this.$router.push('/startups/my')
      } catch (error) {
        console.error('Ошибка при создании стартапа:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    handleCancel() {
      this.$router.push('/startups')
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>

<style scoped>
.create-startup {
  padding: 20px;
}

.form-container {
  max-width: 800px;
  margin: 20px auto;
}

.startup-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tech-tag.active {
  background: #007bff;
  color: white;
}

.team-members {
  display: grid;
  gap: 20px;
}

.team-member {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.member-header h3 {
  margin: 0;
  color: #2c3e50;
}

.remove-btn {
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.member-fields {
  display: grid;
  gap: 15px;
}

.add-btn {
  padding: 10px;
  background: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #e9ecef;
}

.file-upload {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
}

.file-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .form-container {
    padding: 0 10px;
  }
  
  .startup-form {
    padding: 20px;
  }
  
  .member-fields {
    grid-template-columns: 1fr;
  }
}
</style> 