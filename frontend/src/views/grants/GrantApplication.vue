<template>
  <div class="grant-application">
    <div class="header">
      <h1>Подача заявки на грант</h1>
      <div class="grant-info">
        <h2>{{ grant.title }}</h2>
        <div class="grant-meta">
          <span class="amount">{{ formatMoney(grant.amount) }}</span>
          <span class="deadline">Срок подачи: {{ formatDate(grant.deadline) }}</span>
        </div>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="application-form">
        <!-- Информация о проекте -->
        <div class="form-section">
          <h3>Информация о проекте</h3>
          
          <div class="form-group">
            <label>Название проекта</label>
            <input 
              type="text" 
              v-model="formData.projectName" 
              required
              placeholder="Введите название проекта"
            >
          </div>
          
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
            <label>Цели проекта</label>
            <textarea 
              v-model="formData.goals" 
              required
              rows="3"
              placeholder="Опишите цели проекта"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Ожидаемые результаты</label>
            <textarea 
              v-model="formData.expectedResults" 
              required
              rows="3"
              placeholder="Опишите ожидаемые результаты"
            ></textarea>
          </div>
        </div>

        <!-- Бюджет -->
        <div class="form-section">
          <h3>Бюджет проекта</h3>
          
          <div class="form-group">
            <label>Общая стоимость проекта</label>
            <input 
              type="number" 
              v-model="formData.totalCost" 
              required
              min="0"
              placeholder="Сумма в рублях"
            >
          </div>
          
          <div class="form-group">
            <label>Запрашиваемая сумма</label>
            <input 
              type="number" 
              v-model="formData.requestedAmount" 
              required
              min="0"
              :max="grant.amount"
              placeholder="Сумма в рублях"
            >
          </div>
          
          <div class="form-group">
            <label>Источники финансирования</label>
            <textarea 
              v-model="formData.fundingSources" 
              required
              rows="3"
              placeholder="Опишите источники финансирования"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Смета расходов</label>
            <div class="budget-items">
              <div v-for="(item, index) in formData.budget" 
                   :key="index" 
                   class="budget-item"
              >
                <div class="item-header">
                  <h4>Статья {{ index + 1 }}</h4>
                  <button 
                    type="button" 
                    class="remove-btn"
                    @click="removeBudgetItem(index)"
                  >
                    Удалить
                  </button>
                </div>
                
                <div class="item-fields">
                  <div class="form-group">
                    <label>Наименование</label>
                    <input 
                      type="text" 
                      v-model="item.name" 
                      required
                      placeholder="Введите наименование"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label>Сумма</label>
                    <input 
                      type="number" 
                      v-model="item.amount" 
                      required
                      min="0"
                      placeholder="Сумма в рублях"
                    >
                  </div>
                  
                  <div class="form-group">
                    <label>Обоснование</label>
                    <textarea 
                      v-model="item.justification" 
                      required
                      rows="2"
                      placeholder="Обоснуйте расходы"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <button 
                type="button" 
                class="add-btn"
                @click="addBudgetItem"
              >
                Добавить статью расходов
              </button>
            </div>
          </div>
        </div>

        <!-- Команда -->
        <div class="form-section">
          <h3>Команда проекта</h3>
          
          <div class="team-members">
            <div v-for="(member, index) in formData.team" 
                 :key="index" 
                 class="team-member"
            >
              <div class="member-header">
                <h4>Участник команды {{ index + 1 }}</h4>
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
                  <label>Роль в проекте</label>
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
                
                <div class="form-group">
                  <label>Обязанности</label>
                  <textarea 
                    v-model="member.responsibilities" 
                    required
                    rows="2"
                    placeholder="Опишите обязанности"
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
          <h3>Документы</h3>
          
          <div class="form-group">
            <label>Презентация проекта</label>
            <div class="file-upload">
              <input 
                type="file" 
                @change="handleFileUpload('presentation', $event)"
                accept=".pdf,.ppt,.pptx"
                required
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
                required
              >
              <div class="file-info" v-if="formData.businessPlan">
                {{ formData.businessPlan.name }}
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Дополнительные документы</label>
            <div class="file-upload">
              <input 
                type="file" 
                @change="handleFileUpload('additionalDocs', $event)"
                accept=".pdf,.doc,.docx,.jpg,.png"
                multiple
              >
              <div class="file-info" v-if="formData.additionalDocs.length">
                {{ formData.additionalDocs.length }} файлов выбрано
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
            {{ isSubmitting ? 'Отправка...' : 'Отправить заявку' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/axios'

export default {
  name: 'GrantApplication',
  components: {
    BaseButton
  },
  data() {
    return {
      grant: {
        title: '',
        amount: 0,
        deadline: null
      },
      formData: {
        projectName: '',
        shortDescription: '',
        description: '',
        goals: '',
        expectedResults: '',
        totalCost: null,
        requestedAmount: null,
        fundingSources: '',
        budget: [
          {
            name: '',
            amount: null,
            justification: ''
          }
        ],
        team: [
          {
            name: '',
            role: '',
            experience: '',
            responsibilities: ''
          }
        ],
        presentation: null,
        businessPlan: null,
        additionalDocs: []
      },
      isSubmitting: false
    }
  },
  methods: {
    async loadGrantData() {
      try {
        const grantId = this.$route.params.id
        const response = await api.get(`/grants/${grantId}`)
        this.grant = response.data
      } catch (error) {
        console.error('Ошибка при загрузке данных гранта:', error)
      }
    },
    formatMoney(amount) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU')
    },
    addBudgetItem() {
      this.formData.budget.push({
        name: '',
        amount: null,
        justification: ''
      })
    },
    removeBudgetItem(index) {
      if (this.formData.budget.length > 1) {
        this.formData.budget.splice(index, 1)
      }
    },
    addTeamMember() {
      this.formData.team.push({
        name: '',
        role: '',
        experience: '',
        responsibilities: ''
      })
    },
    removeTeamMember(index) {
      if (this.formData.team.length > 1) {
        this.formData.team.splice(index, 1)
      }
    },
    handleFileUpload(type, event) {
      const files = event.target.files
      if (files.length) {
        if (type === 'additionalDocs') {
          this.formData[type] = Array.from(files)
        } else {
          this.formData[type] = files[0]
        }
      }
    },
    async handleSubmit() {
      this.isSubmitting = true
      try {
        const formData = new FormData()
        
        // Добавляем все поля формы
        Object.keys(this.formData).forEach(key => {
          if (key === 'budget' || key === 'team') {
            formData.append(key, JSON.stringify(this.formData[key]))
          } else if (key === 'additionalDocs') {
            this.formData[key].forEach(file => {
              formData.append('additionalDocs', file)
            })
          } else if (key === 'presentation' || key === 'businessPlan') {
            if (this.formData[key]) {
              formData.append(key, this.formData[key])
            }
          } else {
            formData.append(key, this.formData[key])
          }
        })
        
        await api.post(`/grants/${this.$route.params.id}/apply`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        // Перенаправляем на страницу успешной отправки
        this.$router.push('/grants/application-success')
      } catch (error) {
        console.error('Ошибка при отправке заявки:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    handleCancel() {
      this.$router.push('/grants')
    }
  },
  mounted() {
    this.loadGrantData()
  }
}
</script>

<style scoped>
.grant-application {
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.grant-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.grant-info h2 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.grant-meta {
  display: flex;
  gap: 20px;
  color: #666;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.application-form {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
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

.budget-items,
.team-members {
  display: grid;
  gap: 20px;
}

.budget-item,
.team-member {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.item-header,
.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.item-header h4,
.member-header h4 {
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

.item-fields,
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
  
  .application-form {
    padding: 20px;
  }
  
  .item-fields,
  .member-fields {
    grid-template-columns: 1fr;
  }
  
  .grant-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 