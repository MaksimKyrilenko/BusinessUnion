<template>
  <div class="startup-analysis">
    <div class="analysis-header">
      <h1>Анализ стартапа</h1>
      <div class="startup-selector" v-if="!selectedStartup">
        <BaseSelect
          v-model="selectedStartupId"
          :options="startupOptions"
          placeholder="Выберите стартап для анализа"
          @change="loadStartupData"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader />
    </div>

    <div v-else-if="selectedStartup" class="analysis-content">
      <!-- Основная информация о стартапе -->
      <div class="startup-overview card">
        <div class="card-header">
          <h2>{{ selectedStartup.title }}</h2>
          <div class="startup-rating">
            <span class="rating-value">{{ selectedStartup.rating }}/10</span>
            <div class="rating-stars">
              <i v-for="i in 5" 
                 :key="i" 
                 class="fas fa-star"
                 :class="{ active: i <= selectedStartup.rating/2 }"
              ></i>
            </div>
          </div>
        </div>
        <div class="startup-metrics">
          <div class="metric">
            <i class="fas fa-chart-line"></i>
            <div class="metric-content">
              <span class="metric-value">{{ formatMoney(selectedStartup.investmentNeeded) }}</span>
              <span class="metric-label">Требуемые инвестиции</span>
            </div>
          </div>
          <div class="metric">
            <i class="fas fa-percentage"></i>
            <div class="metric-content">
              <span class="metric-value">{{ selectedStartup.expectedRoi }}%</span>
              <span class="metric-label">Ожидаемый ROI</span>
            </div>
          </div>
          <div class="metric">
            <i class="fas fa-users"></i>
            <div class="metric-content">
              <span class="metric-value">{{ selectedStartup.teamSize }}</span>
              <span class="metric-label">Размер команды</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Анализ продукта -->
      <div class="analysis-section card">
        <h3><i class="fas fa-cube"></i> Анализ продукта</h3>
        <div class="analysis-grid">
          <div class="analysis-item">
            <h4>🛠️ Описание продукта</h4>
            <p>{{ selectedStartup.productDescription }}</p>
          </div>
          <div class="analysis-item">
            <h4>🔍 Бизнес-модель</h4>
            <div class="business-model">
              <span class="model-tag" 
                    v-for="model in selectedStartup.businessModels" 
                    :key="model">
                {{ model }}
              </span>
            </div>
          </div>
          <div class="analysis-item">
            <h4>🎯 Целевая аудитория</h4>
            <div class="target-audience">
              <span class="audience-tag" 
                    v-for="audience in selectedStartup.targetAudience" 
                    :key="audience"
                    :class="audience.toLowerCase()">
                {{ audience }}
              </span>
            </div>
          </div>
          <div class="analysis-item">
            <h4>🛎️ Конкуренты</h4>
            <div class="competitors-list">
              <div v-for="competitor in selectedStartup.competitors" 
                   :key="competitor.name" 
                   class="competitor-item">
                <span class="competitor-name">{{ competitor.name }}</span>
                <p class="competitor-diff">{{ competitor.difference }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Рыночный анализ -->
      <div class="analysis-section card">
        <h3><i class="fas fa-chart-pie"></i> Рыночный анализ</h3>
        <div class="market-analysis">
          <div class="market-size">
            <h4>🌎 Размер рынка</h4>
            <div class="market-metrics">
              <div class="market-metric">
                <span class="metric-title">TAM</span>
                <span class="metric-value">{{ formatMoney(selectedStartup.marketSize.tam) }}</span>
                <span class="metric-desc">Общий объем рынка</span>
              </div>
              <div class="market-metric">
                <span class="metric-title">SAM</span>
                <span class="metric-value">{{ formatMoney(selectedStartup.marketSize.sam) }}</span>
                <span class="metric-desc">Доступный объем рынка</span>
              </div>
              <div class="market-metric">
                <span class="metric-title">SOM</span>
                <span class="metric-value">{{ formatMoney(selectedStartup.marketSize.som) }}</span>
                <span class="metric-desc">Реально достижимый объем</span>
              </div>
            </div>
          </div>
          
          <div class="market-trends">
            <h4>📌 Тренды рынка</h4>
            <div class="trends-list">
              <div v-for="trend in selectedStartup.marketTrends" 
                   :key="trend.title" 
                   class="trend-item"
                   :class="trend.impact">
                <i :class="trend.icon"></i>
                <div class="trend-content">
                  <h5>{{ trend.title }}</h5>
                  <p>{{ trend.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="swot-analysis">
            <h4>📊 SWOT-анализ</h4>
            <div class="swot-grid">
              <div class="swot-item strengths">
                <h5>Сильные стороны</h5>
                <ul>
                  <li v-for="strength in selectedStartup.swot.strengths" 
                      :key="strength">
                    {{ strength }}
                  </li>
                </ul>
              </div>
              <div class="swot-item weaknesses">
                <h5>Слабые стороны</h5>
                <ul>
                  <li v-for="weakness in selectedStartup.swot.weaknesses" 
                      :key="weakness">
                    {{ weakness }}
                  </li>
                </ul>
              </div>
              <div class="swot-item opportunities">
                <h5>Возможности</h5>
                <ul>
                  <li v-for="opportunity in selectedStartup.swot.opportunities" 
                      :key="opportunity">
                    {{ opportunity }}
                  </li>
                </ul>
              </div>
              <div class="swot-item threats">
                <h5>Угрозы</h5>
                <ul>
                  <li v-for="threat in selectedStartup.swot.threats" 
                      :key="threat">
                    {{ threat }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Технический анализ -->
      <div class="analysis-section card" v-if="selectedStartup.techAnalysis">
        <h3><i class="fas fa-code"></i> Технический анализ</h3>
        <div class="tech-analysis">
          <div class="tech-stack">
            <h4>⚙️ Технологический стек</h4>
            <div class="tech-categories">
              <div v-for="(techs, category) in selectedStartup.techAnalysis.stack" 
                   :key="category" 
                   class="tech-category">
                <h5>{{ category }}</h5>
                <div class="tech-tags">
                  <span v-for="tech in techs" 
                        :key="tech" 
                        class="tech-tag">
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="blockchain" v-if="selectedStartup.techAnalysis.blockchain">
            <h4>🔗 Блокчейн-аспекты</h4>
            <div class="blockchain-details">
              <div class="blockchain-item" 
                   v-for="detail in selectedStartup.techAnalysis.blockchain" 
                   :key="detail.aspect">
                <h5>{{ detail.aspect }}</h5>
                <p>{{ detail.description }}</p>
              </div>
            </div>
          </div>

          <div class="security">
            <h4>🔐 Безопасность и приватность</h4>
            <div class="security-measures">
              <div class="security-item" 
                   v-for="measure in selectedStartup.techAnalysis.security" 
                   :key="measure.title">
                <div class="security-header">
                  <h5>{{ measure.title }}</h5>
                  <span :class="['security-status', measure.status]">
                    {{ measure.status }}
                  </span>
                </div>
                <p>{{ measure.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Оценка рисков -->
      <div class="analysis-section card">
        <h3><i class="fas fa-exclamation-triangle"></i> Оценка рисков</h3>
        <div class="risks-analysis">
          <div class="risk-category" v-for="(risks, category) in selectedStartup.risks" :key="category">
            <h4>
              <i :class="getRiskCategoryIcon(category)"></i>
              {{ getRiskCategoryTitle(category) }}
            </h4>
            <div class="risks-list">
              <div v-for="risk in risks" 
                   :key="risk.title" 
                   class="risk-item"
                   :class="risk.level">
                <div class="risk-header">
                  <h5>{{ risk.title }}</h5>
                  <span class="risk-level">{{ risk.level }}</span>
                </div>
                <p>{{ risk.description }}</p>
                <div class="risk-mitigation" v-if="risk.mitigation">
                  <strong>Меры снижения риска:</strong>
                  <p>{{ risk.mitigation }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Инвесторские прогнозы -->
      <div class="analysis-section card">
        <h3><i class="fas fa-chart-line"></i> Инвесторские прогнозы</h3>
        <div class="forecasts">
          <div class="growth-forecast">
            <h4>🔮 Прогноз роста</h4>
            <div class="forecast-chart">
              <!-- Здесь будет компонент графика -->
              <LineChart :data="selectedStartup.growthForecast" />
            </div>
          </div>

          <div class="startup-rating-details">
            <h4>⭐ Рейтинг стартапа</h4>
            <div class="rating-categories">
              <div v-for="category in selectedStartup.ratingCategories" 
                   :key="category.name" 
                   class="rating-category">
                <div class="category-header">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-score">{{ category.score }}/10</span>
                </div>
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: `${category.score * 10}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="investor-reviews" v-if="selectedStartup?.reviews?.length">
            <h4>📢 Отзывы инвесторов</h4>
            <div class="reviews-list">
              <div v-for="review in selectedStartup.reviews" 
                   :key="review.id" 
                   class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <img :src="review.avatar" :alt="review.name" class="reviewer-avatar">
                    <div class="reviewer-details">
                      <h5>{{ review.name }}</h5>
                      <span class="review-date">{{ formatDate(review.date) }}</span>
                    </div>
                  </div>
                  <div class="review-rating">
                    <i v-for="i in 5" 
                       :key="i" 
                       class="fas fa-star"
                       :class="{ active: i <= review.rating }"></i>
                  </div>
                </div>
                <p class="review-text">{{ review.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI-оценка -->
      <div class="analysis-section card ai-analysis">
        <h3><i class="fas fa-robot"></i> AI-оценка перспективности</h3>
        <div class="ai-score">
          <div class="score-circle" :style="getAIScoreStyle()">
            <span class="score-value">{{ selectedStartup.aiScore }}%</span>
          </div>
          <div class="score-details">
            <h4>Ключевые факторы успеха:</h4>
            <ul class="success-factors">
              <li v-for="factor in selectedStartup.aiAnalysis.factors" 
                  :key="factor.name"
                  :class="factor.impact">
                <span class="factor-name">{{ factor.name }}</span>
                <span class="factor-value">{{ factor.value }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="ai-recommendations">
          <h4>Рекомендации AI:</h4>
          <div class="recommendations-list">
            <div v-for="rec in selectedStartup.aiAnalysis.recommendations" 
                 :key="rec.title" 
                 class="recommendation-item">
              <h5>{{ rec.title }}</h5>
              <p>{{ rec.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Loader from '@/components/ui/Loader.vue'
import LineChart from '@/components/charts/LineChart.vue'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export default defineComponent({
  name: 'StartupAnalysis',
  components: {
    BaseSelect,
    Loader,
    LineChart
  },
  setup() {
    const selectedStartupId = ref('')
    const selectedStartup = ref(null)
    const loading = ref(false)
    const startupOptions = ref([])

    // Тестовые данные стартапов (такие же, как в каталоге)
    const startups = [
      {
        id: 1,
        title: 'Умная система автоматизации производства',
        description: 'Инновационная система, использующая ИИ для оптимизации производственных процессов и снижения затрат на 40%',
        category: 'tech',
        investmentNeeded: 5000000,
        minInvestment: 500000,
        investmentCollected: 2000000,
        expectedRoi: 25,
        createdAt: '2024-03-20',
        // Дополнительные данные для анализа
        rating: 8.5,
        teamSize: 12,
        productDescription: 'Система использует передовые алгоритмы машинного обучения для оптимизации производственных процессов. Включает модули планирования, контроля качества и предиктивного обслуживания.',
        businessModels: ['B2B', 'SaaS', 'HaaS'],
        targetAudience: ['Крупные производства', 'Средний бизнес'],
        competitors: [
          { name: 'IndustryAI', difference: 'Наше решение более гибкое и имеет лучшую точность прогнозов' },
          { name: 'SmartFactory', difference: 'Мы предлагаем более доступные цены и лучшую техподдержку' }
        ],
        marketSize: {
          tam: 50000000000,
          sam: 15000000000,
          som: 3000000000
        },
        marketTrends: [
          { title: 'Рост спроса на автоматизацию', description: 'Увеличение спроса на 25% ежегодно', impact: 'positive', icon: 'fas fa-chart-line' },
          { title: 'Развитие ИИ', description: 'Новые возможности для оптимизации', impact: 'positive', icon: 'fas fa-brain' }
        ],
        swot: {
          strengths: ['Передовые технологии', 'Опытная команда', 'Готовые клиенты'],
          weaknesses: ['Высокая стоимость внедрения', 'Длительный цикл продаж'],
          opportunities: ['Выход на международный рынок', 'Расширение функционала'],
          threats: ['Появление новых конкурентов', 'Изменение регулирования ИИ']
        },
        techAnalysis: {
          stack: {
            'Frontend': ['React', 'TypeScript', 'Material-UI'],
            'Backend': ['Python', 'TensorFlow', 'FastAPI'],
            'Infrastructure': ['AWS', 'Docker', 'Kubernetes']
          },
          security: [
            { title: 'Шифрование данных', status: 'implemented', description: 'AES-256 для всех данных' },
            { title: 'Аудит безопасности', status: 'partial', description: 'Проведен первичный аудит' }
          ]
        },
        risks: {
          financial: [
            { title: 'Превышение бюджета', level: 'medium', description: 'Риск увеличения затрат на разработку', mitigation: 'Детальное планирование и контроль расходов' }
          ],
          technical: [
            { title: 'Сложности интеграции', level: 'high', description: 'Риск проблем при внедрении', mitigation: 'Тщательное тестирование и пилотные проекты' }
          ],
          market: [
            { title: 'Конкуренция', level: 'low', description: 'Риск появления аналогов', mitigation: 'Постоянное развитие продукта' }
          ]
        },
        growthForecast: {
          labels: ['2024', '2025', '2026', '2027'],
          datasets: [{
            label: 'Прогноз роста',
            data: [100, 250, 400, 600],
            borderColor: '#7C4DFF'
          }]
        },
        ratingCategories: [
          { name: 'Технологии', score: 9 },
          { name: 'Команда', score: 8 },
          { name: 'Рынок', score: 8.5 },
          { name: 'Финансы', score: 7.5 }
        ],
        aiScore: 85,
        aiAnalysis: {
          factors: [
            { name: 'Технологическая инновация', value: '95%', impact: 'positive' },
            { name: 'Размер рынка', value: '85%', impact: 'positive' },
            { name: 'Конкуренция', value: '70%', impact: 'neutral' }
          ],
          recommendations: [
            { title: 'Расширение команды', description: 'Рекомендуется усилить отдел продаж' },
            { title: 'Международная экспансия', description: 'Высокий потенциал на рынках Азии' }
          ],
          reviews: [
            {
              id: 1,
              name: 'Александр Петров',
              avatar: 'https://i.pravatar.cc/100?img=1',
              date: '2024-03-20',
              rating: 5,
              text: 'Отличный проект с большим потенциалом. Команда показала высокий профессионализм и глубокое понимание рынка.'
            },
            {
              id: 2,
              name: 'Елена Соколова',
              avatar: 'https://i.pravatar.cc/100?img=2',
              date: '2024-03-18',
              rating: 4,
              text: 'Инновационное решение, которое действительно решает проблемы производства. Есть некоторые вопросы по масштабированию.'
            }
          ]
        }
      },
      {
        id: 2,
        title: 'Платформа телемедицины нового поколения',
        description: 'Революционная платформа для удаленных медицинских консультаций с использованием VR технологий',
        category: 'health',
        investmentNeeded: 8000000,
        minInvestment: 1000000,
        investmentCollected: 3500000,
        expectedRoi: 35,
        createdAt: '2024-03-18',
        rating: 9.0,
        teamSize: 15,
        productDescription: 'Инновационная телемедицинская платформа, использующая VR/AR технологии для проведения удаленных консультаций. Включает модули диагностики, мониторинга состояния пациента и электронной медкарты.',
        businessModels: ['B2B', 'B2C', 'SaaS'],
        targetAudience: ['Медицинские центры', 'Частные клиники', 'Пациенты'],
        competitors: [
          { name: 'MedConnect', difference: 'Мы предлагаем VR-консультации с эффектом присутствия' },
          { name: 'HealthTech', difference: 'У нас более продвинутая система диагностики' }
        ],
        marketSize: {
          tam: 80000000000,
          sam: 25000000000,
          som: 5000000000
        },
        marketTrends: [
          { title: 'Рост телемедицины', description: 'Ежегодный рост рынка на 35%', impact: 'positive', icon: 'fas fa-heartbeat' },
          { title: 'Развитие VR', description: 'Улучшение технологий и снижение стоимости', impact: 'positive', icon: 'fas fa-vr-cardboard' }
        ],
        swot: {
          strengths: ['Уникальная VR-технология', 'Сильная команда врачей', 'Готовые партнерства'],
          weaknesses: ['Зависимость от VR-оборудования', 'Высокий порог входа'],
          opportunities: ['Международная экспансия', 'Интеграция с клиниками'],
          threats: ['Регуляторные ограничения', 'Конкуренция со стороны крупных клиник']
        },
        techAnalysis: {
          stack: {
            'Frontend': ['Vue.js', 'WebXR', 'Three.js'],
            'Backend': ['Node.js', 'WebRTC', 'MongoDB'],
            'Infrastructure': ['Azure', 'Kubernetes']
          },
          security: [
            { title: 'Защита медданных', status: 'implemented', description: 'Соответствие HIPAA и GDPR' },
            { title: 'Шифрование видеосвязи', status: 'implemented', description: 'End-to-end encryption' }
          ]
        },
        risks: {
          financial: [
            { title: 'Высокие операционные расходы', level: 'medium', description: 'Затраты на поддержку VR-инфраструктуры', mitigation: 'Оптимизация расходов и партнерства' }
          ],
          technical: [
            { title: 'Стабильность соединения', level: 'high', description: 'Риск проблем со связью', mitigation: 'Резервные каналы и оптимизация' }
          ],
          market: [
            { title: 'Регуляторные риски', level: 'medium', description: 'Изменения в законодательстве', mitigation: 'Работа с регуляторами' }
          ]
        },
        growthForecast: {
          labels: ['2024', '2025', '2026', '2027'],
          datasets: [{
            label: 'Прогноз роста',
            data: [100, 300, 600, 1000],
            borderColor: '#7C4DFF'
          }]
        },
        ratingCategories: [
          { name: 'Технологии', score: 9.5 },
          { name: 'Команда', score: 9 },
          { name: 'Рынок', score: 9 },
          { name: 'Финансы', score: 8.5 }
        ],
        aiScore: 90,
        aiAnalysis: {
          factors: [
            { name: 'Инновационность', value: '95%', impact: 'positive' },
            { name: 'Рыночный потенциал', value: '90%', impact: 'positive' },
            { name: 'Регуляторные риски', value: '60%', impact: 'neutral' }
          ],
          recommendations: [
            { title: 'Расширение географии', description: 'Выход на рынки США и ЕС' },
            { title: 'Партнерства', description: 'Сотрудничество с производителями VR-оборудования' }
          ],
          reviews: [
            {
              id: 1,
              name: 'Александр Петров',
              avatar: 'https://i.pravatar.cc/100?img=1',
              date: '2024-03-20',
              rating: 5,
              text: 'Отличный проект с большим потенциалом. Команда показала высокий профессионализм и глубокое понимание рынка.'
            },
            {
              id: 2,
              name: 'Елена Соколова',
              avatar: 'https://i.pravatar.cc/100?img=2',
              date: '2024-03-18',
              rating: 4,
              text: 'Инновационное решение, которое действительно решает проблемы производства. Есть некоторые вопросы по масштабированию.'
            }
          ]
        }
      },
      {
        id: 3,
        title: 'Образовательная экосистема на базе AR',
        description: 'Интерактивная система обучения с использованием дополненной реальности для школ и университетов',
        category: 'education',
        investmentNeeded: 3000000,
        minInvestment: 300000,
        investmentCollected: 900000,
        expectedRoi: 20,
        createdAt: '2024-03-15',
        rating: 8.0,
        teamSize: 8,
        productDescription: 'Образовательная платформа, использующая AR для создания интерактивных уроков и практических занятий. Включает конструктор уроков, библиотеку 3D-моделей и систему оценки.',
        businessModels: ['B2B', 'B2G', 'SaaS'],
        targetAudience: ['Школы', 'Университеты', 'Образовательные центры'],
        competitors: [
          { name: 'EduAR', difference: 'Более широкая библиотека контента и простой интерфейс' },
          { name: 'LearnVision', difference: 'Лучшая интеграция с существующими LMS' }
        ],
        marketSize: {
          tam: 30000000000,
          sam: 10000000000,
          som: 2000000000
        },
        marketTrends: [
          { title: 'Цифровизация образования', description: 'Рост спроса на 30% в год', impact: 'positive', icon: 'fas fa-graduation-cap' },
          { title: 'Развитие AR', description: 'Улучшение технологий и доступности', impact: 'positive', icon: 'fas fa-mobile-alt' }
        ],
        swot: {
          strengths: ['Простота использования', 'Большая библиотека контента', 'Методическая поддержка'],
          weaknesses: ['Зависимость от устройств', 'Необходимость обучения учителей'],
          opportunities: ['Выход на международный рынок', 'Корпоративное обучение'],
          threats: ['Бюджетные ограничения школ', 'Консерватизм в образовании']
        },
        techAnalysis: {
          stack: {
            'Frontend': ['Unity', 'ARKit', 'ARCore'],
            'Backend': ['Python', 'Django', 'PostgreSQL'],
            'Infrastructure': ['GCP', 'Firebase']
          },
          security: [
            { title: 'Защита данных учащихся', status: 'implemented', description: 'Соответствие FERPA' },
            { title: 'Контроль доступа', status: 'implemented', description: 'Ролевая модель доступа' }
          ]
        },
        risks: {
          financial: [
            { title: 'Длительный цикл продаж', level: 'high', description: 'Долгие согласования с учебными заведениями', mitigation: 'Оптимизация процесса продаж' }
          ],
          technical: [
            { title: 'Совместимость устройств', level: 'medium', description: 'Разные модели смартфонов и планшетов', mitigation: 'Адаптивность и тестирование' }
          ],
          market: [
            { title: 'Сопротивление изменениям', level: 'high', description: 'Консерватизм в образовании', mitigation: 'Обучение и поддержка пользователей' }
          ]
        },
        growthForecast: {
          labels: ['2024', '2025', '2026', '2027'],
          datasets: [{
            label: 'Прогноз роста',
            data: [100, 200, 350, 500],
            borderColor: '#7C4DFF'
          }]
        },
        ratingCategories: [
          { name: 'Технологии', score: 8.5 },
          { name: 'Команда', score: 7.5 },
          { name: 'Рынок', score: 8 },
          { name: 'Финансы', score: 7 }
        ],
        aiScore: 75,
        aiAnalysis: {
          factors: [
            { name: 'Образовательная ценность', value: '85%', impact: 'positive' },
            { name: 'Рыночный потенциал', value: '75%', impact: 'positive' },
            { name: 'Барьеры внедрения', value: '60%', impact: 'negative' }
          ],
          recommendations: [
            { title: 'Упрощение внедрения', description: 'Разработка программы быстрого старта' },
            { title: 'Расширение контента', description: 'Создание маркетплейса для авторов' }
          ]
        }
      },
      {
        id: 4,
        title: 'Финтех-платформа для малого бизнеса',
        description: 'Комплексное решение для управления финансами, бухгалтерией и инвестициями малого бизнеса',
        category: 'finance',
        investmentNeeded: 10000000,
        minInvestment: 1000000,
        investmentCollected: 7000000,
        expectedRoi: 40,
        createdAt: '2024-03-10',
        rating: 9.5,
        teamSize: 20,
        productDescription: 'Интегрированная финансовая платформа для малого бизнеса, включающая онлайн-банкинг, бухгалтерию, аналитику и инвестиционные инструменты.',
        businessModels: ['B2B', 'SaaS', 'Freemium'],
        targetAudience: ['Малый бизнес', 'Индивидуальные предприниматели', 'Стартапы'],
        competitors: [
          { name: 'BusinessBank', difference: 'Более широкий спектр услуг и лучшая интеграция' },
          { name: 'FinanceHub', difference: 'Более выгодные тарифы и лучшая аналитика' }
        ],
        marketSize: {
          tam: 100000000000,
          sam: 40000000000,
          som: 8000000000
        },
        marketTrends: [
          { title: 'Цифровизация финансов', description: 'Рост на 40% ежегодно', impact: 'positive', icon: 'fas fa-chart-bar' },
          { title: 'Спрос на онлайн-услуги', description: 'Увеличение на 50% в год', impact: 'positive', icon: 'fas fa-laptop' }
        ],
        swot: {
          strengths: ['Комплексное решение', 'Сильная команда', 'Современные технологии'],
          weaknesses: ['Высокая конкуренция', 'Сложность интеграций'],
          opportunities: ['Международная экспансия', 'Новые финансовые продукты'],
          threats: ['Регуляторные изменения', 'Крупные конкуренты']
        },
        techAnalysis: {
          stack: {
            'Frontend': ['React', 'Redux', 'Material-UI'],
            'Backend': ['Java', 'Spring', 'PostgreSQL'],
            'Infrastructure': ['AWS', 'Kubernetes']
          },
          security: [
            { title: 'Финансовая безопасность', status: 'implemented', description: 'PCI DSS Level 1' },
            { title: 'Мониторинг транзакций', status: 'implemented', description: 'AI-based fraud detection' }
          ]
        },
        risks: {
          financial: [
            { title: 'Высокие операционные расходы', level: 'medium', description: 'Затраты на соответствие регуляторным требованиям', mitigation: 'Оптимизация процессов' }
          ],
          technical: [
            { title: 'Интеграция с банками', level: 'high', description: 'Сложности API-интеграций', mitigation: 'Партнерства с банками' }
          ],
          market: [
            { title: 'Конкуренция', level: 'high', description: 'Активность крупных игроков', mitigation: 'Фокус на нишевых решениях' }
          ]
        },
        growthForecast: {
          labels: ['2024', '2025', '2026', '2027'],
          datasets: [{
            label: 'Прогноз роста',
            data: [100, 400, 800, 1500],
            borderColor: '#7C4DFF'
          }]
        },
        ratingCategories: [
          { name: 'Технологии', score: 9.5 },
          { name: 'Команда', score: 9.5 },
          { name: 'Рынок', score: 9 },
          { name: 'Финансы', score: 9.5 }
        ],
        aiScore: 95,
        aiAnalysis: {
          factors: [
            { name: 'Рыночный потенциал', value: '95%', impact: 'positive' },
            { name: 'Технологическая база', value: '90%', impact: 'positive' },
            { name: 'Команда', value: '95%', impact: 'positive' }
          ],
          recommendations: [
            { title: 'Международная экспансия', description: 'Выход на рынки СНГ и Азии' },
            { title: 'Новые продукты', description: 'Развитие кредитного направления' }
          ]
        }
      },
      {
        id: 5,
        title: 'Умная система управления складом',
        description: 'Автоматизированная система управления складскими запасами с использованием роботов и ИИ',
        category: 'retail',
        investmentNeeded: 6000000,
        minInvestment: 500000,
        investmentCollected: 1500000,
        expectedRoi: 30,
        createdAt: '2024-03-05',
        rating: 8.0,
        teamSize: 10,
        productDescription: 'Автоматизированная система управления складом, использующая роботов и ИИ для оптимизации хранения, учета и перемещения товаров.',
        businessModels: ['B2B', 'HaaS', 'SaaS'],
        targetAudience: ['Логистические компании', 'Крупные ритейлеры', 'Производства'],
        competitors: [
          { name: 'WarehouseAI', difference: 'Более доступная цена и простота внедрения' },
          { name: 'SmartStorage', difference: 'Лучшая интеграция с существующими системами' }
        ],
        marketSize: {
          tam: 40000000000,
          sam: 12000000000,
          som: 2400000000
        },
        marketTrends: [
          { title: 'Автоматизация складов', description: 'Рост на 25% ежегодно', impact: 'positive', icon: 'fas fa-robot' },
          { title: 'E-commerce бум', description: 'Увеличение спроса на 35%', impact: 'positive', icon: 'fas fa-shopping-cart' }
        ],
        swot: {
          strengths: ['Инновационные технологии', 'Опыт в логистике', 'Масштабируемость'],
          weaknesses: ['Высокая стоимость внедрения', 'Зависимость от поставщиков'],
          opportunities: ['Рост e-commerce', 'Новые рынки'],
          threats: ['Конкуренция', 'Экономический спад']
        },
        techAnalysis: {
          stack: {
            'Frontend': ['Angular', 'NgRx', 'Bootstrap'],
            'Backend': ['Python', 'FastAPI', 'MongoDB'],
            'Robotics': ['ROS', 'Computer Vision', 'SLAM']
          },
          security: [
            { title: 'Безопасность роботов', status: 'implemented', description: 'ISO/TS 15066' },
            { title: 'Защита данных', status: 'implemented', description: 'End-to-end encryption' }
          ]
        },
        risks: {
          financial: [
            { title: 'Высокие начальные инвестиции', level: 'high', description: 'Затраты на оборудование', mitigation: 'Лизинговые программы' }
          ],
          technical: [
            { title: 'Надежность роботов', level: 'medium', description: 'Риск сбоев', mitigation: 'Предиктивное обслуживание' }
          ],
          market: [
            { title: 'Рыночная конкуренция', level: 'medium', description: 'Новые игроки', mitigation: 'Уникальные преимущества' }
          ]
        },
        growthForecast: {
          labels: ['2024', '2025', '2026', '2027'],
          datasets: [{
            label: 'Прогноз роста',
            data: [100, 200, 400, 700],
            borderColor: '#7C4DFF'
          }]
        },
        ratingCategories: [
          { name: 'Технологии', score: 8.5 },
          { name: 'Команда', score: 8 },
          { name: 'Рынок', score: 7.5 },
          { name: 'Финансы', score: 8 }
        ],
        aiScore: 80,
        aiAnalysis: {
          factors: [
            { name: 'Технологическая база', value: '85%', impact: 'positive' },
            { name: 'Рыночный спрос', value: '80%', impact: 'positive' },
            { name: 'Барьеры входа', value: '70%', impact: 'neutral' }
          ],
          recommendations: [
            { title: 'Оптимизация затрат', description: 'Разработка программы лизинга' },
            { title: 'Расширение функционала', description: 'Интеграция с e-commerce платформами' }
          ]
        }
      }
    ]

    // Загрузка списка стартапов
    const loadStartups = () => {
      startupOptions.value = startups.map(startup => ({
        value: startup.id,
        label: startup.title
      }))
    }

    // Загрузка данных выбранного стартапа
    const loadStartupData = () => {
      if (!selectedStartupId.value) return
      
      loading.value = true
      try {
        const startup = startups.find(s => s.id === Number(selectedStartupId.value))
        if (startup) {
          selectedStartup.value = startup
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных стартапа:', error)
      } finally {
        loading.value = false
      }
    }

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      return format(new Date(date), 'd MMMM yyyy', { locale: ru })
    }

    const getRiskCategoryIcon = (category) => {
      const icons = {
        financial: 'fas fa-money-bill-wave',
        technical: 'fas fa-cogs',
        market: 'fas fa-chart-line'
      }
      return icons[category] || 'fas fa-exclamation-circle'
    }

    const getRiskCategoryTitle = (category) => {
      const titles = {
        financial: 'Финансовые риски',
        technical: 'Технические риски',
        market: 'Рыночные риски'
      }
      return titles[category] || category
    }

    const getAIScoreStyle = () => {
      const score = selectedStartup.value?.aiScore || 0
      const hue = Math.min(score * 1.2, 120)
      return {
        background: `conic-gradient(hsl(${hue}, 70%, 50%) ${score}%, #f0f0f0 0)`
      }
    }

    onMounted(() => {
      loadStartups()
    })

    return {
      selectedStartupId,
      selectedStartup,
      startupOptions,
      loading,
      loadStartupData,
      formatMoney,
      formatDate,
      getRiskCategoryIcon,
      getRiskCategoryTitle,
      getAIScoreStyle
    }
  }
})
</script>

<style scoped>
.startup-analysis {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.analysis-header {
  margin-bottom: 2rem;
}

.analysis-header h1 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.startup-selector {
  max-width: 500px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.analysis-content {
  display: grid;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.startup-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.rating-stars i {
  color: #ddd;
}

.rating-stars i.active {
  color: #ffd700;
}

.startup-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.metric i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.analysis-section {
  margin-top: 2rem;
}

.analysis-section h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.analysis-section h3 i {
  color: var(--primary-color);
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.analysis-item {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.analysis-item h4 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.business-model, .target-audience {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.model-tag, .audience-tag {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.model-tag {
  background: #e3f2fd;
  color: #1976d2;
}

.audience-tag {
  background: #e8f5e9;
  color: #2e7d32;
}

.audience-tag.b2b { background: #e3f2fd; color: #1976d2; }
.audience-tag.b2c { background: #e8f5e9; color: #2e7d32; }
.audience-tag.b2g { background: #f3e5f5; color: #7b1fa2; }

.competitors-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.competitor-item {
  padding: 1rem;
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.competitor-name {
  font-weight: 500;
  color: var(--text-primary);
}

.competitor-diff {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.market-analysis {
  display: grid;
  gap: 2rem;
}

.market-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.market-metric {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
  text-align: center;
}

.metric-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.metric-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.trends-list {
  display: grid;
  gap: 1rem;
}

.trend-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.trend-item.positive { border-left: 4px solid var(--success-color); }
.trend-item.negative { border-left: 4px solid var(--error-color); }
.trend-item.neutral { border-left: 4px solid var(--secondary-color); }

.trend-content h5 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.swot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.swot-item {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.swot-item h5 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.swot-item.strengths { border-left: 4px solid #4caf50; }
.swot-item.weaknesses { border-left: 4px solid #f44336; }
.swot-item.opportunities { border-left: 4px solid #2196f3; }
.swot-item.threats { border-left: 4px solid #ff9800; }

.swot-item ul {
  list-style: none;
  padding: 0;
}

.swot-item li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.swot-item li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

.tech-analysis {
  display: grid;
  gap: 2rem;
}

.tech-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tech-category {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tech-tag {
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 20px;
  font-size: 0.875rem;
  box-shadow: var(--shadow-sm);
}

.security-measures {
  display: grid;
  gap: 1rem;
}

.security-item {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.security-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.security-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.security-status.implemented { background: #e8f5e9; color: #2e7d32; }
.security-status.partial { background: #fff3e0; color: #ef6c00; }
.security-status.missing { background: #ffebee; color: #c62828; }

.risks-analysis {
  display: grid;
  gap: 2rem;
}

.risk-category h4 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.risks-list {
  display: grid;
  gap: 1rem;
}

.risk-item {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.risk-item.high { border-color: #f44336; }
.risk-item.medium { border-color: #ff9800; }
.risk-item.low { border-color: #4caf50; }

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.risk-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.risk-item.high .risk-level { background: #ffebee; color: #c62828; }
.risk-item.medium .risk-level { background: #fff3e0; color: #ef6c00; }
.risk-item.low .risk-level { background: #e8f5e9; color: #2e7d32; }

.risk-mitigation {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.forecasts {
  display: grid;
  gap: 2rem;
}

.forecast-chart {
  margin-top: 1.5rem;
  height: 300px;
}

.rating-categories {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.rating-category {
  background: var(--background);
  padding: 1rem;
  border-radius: var(--radius-md);
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.category-score {
  font-weight: 500;
  color: var(--primary-color);
}

.score-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.reviews-list {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  background: var(--background);
  border-radius: var(--radius-md);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-details h5 {
  margin: 0;
  color: var(--text-primary);
}

.review-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.review-rating {
  color: #ffd700;
}

.ai-analysis {
  background: linear-gradient(135deg, #7c4dff0a 0%, #2196f30a 100%);
}

.ai-score {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: white;
}

.score-value {
  position: relative;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.success-factors {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.success-factors li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.success-factors li.positive { border-left: 4px solid var(--success-color); }
.success-factors li.negative { border-left: 4px solid var(--error-color); }
.success-factors li.neutral { border-left: 4px solid var(--secondary-color); }

.factor-value {
  font-weight: 500;
}

.ai-recommendations {
  margin-top: 2rem;
}

.recommendations-list {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.recommendation-item {
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.recommendation-item h5 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .startup-analysis {
    padding: 1rem;
  }

  .swot-grid {
    grid-template-columns: 1fr;
  }

  .market-metrics {
    grid-template-columns: 1fr;
  }

  .tech-categories {
    grid-template-columns: 1fr;
  }

  .ai-score {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style> 