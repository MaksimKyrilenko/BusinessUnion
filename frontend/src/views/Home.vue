<template>
  <div class="landing">
    <!-- Navigation -->
    <nav class="nav" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-container">
        <div class="nav-brand">
          <img src="@/assets/icon.png" alt="Logo" class="brand-icon" />
          <span>BusinessUnion</span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Возможности</a>
          <a href="#benefits" class="nav-link">Преимущества</a>
          <router-link to="/login" class="nav-link">Вход</router-link>
          <router-link to="/register" class="nav-btn">Начать бесплатно</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content" :class="{ 'animate-in': mounted }">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Платформа №1 для бизнеса в России
        </div>
        <h1 class="hero-title">
          Объединяем
          <span class="gradient-text">бизнес-сообщества</span>
          для роста
        </h1>
        <p class="hero-subtitle">
          Инвесторы, стартапы и предприниматели на одной платформе. 
          Аналитика, нетворкинг и инструменты для принятия решений.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn-primary">
            <span>Создать аккаунт</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
          <router-link to="/login" class="btn-secondary">
            <i class="fas fa-play-circle"></i>
            <span>Войти в систему</span>
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-value">500+</div>
            <div class="stat-label">Активных проектов</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card">
            <div class="stat-value">1000+</div>
            <div class="stat-label">Инвесторов</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card">
            <div class="stat-value">₽100M+</div>
            <div class="stat-label">Инвестиций</div>
          </div>
        </div>
      </div>
      <div class="hero-visual" :class="{ 'animate-in-delay': mounted }">
        <div class="dashboard-preview">
          <div class="preview-header">
            <div class="preview-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="preview-title">BusinessUnion Dashboard</div>
          </div>
          <div class="preview-content">
            <!-- Sidebar -->
            <div class="preview-sidebar">
              <div class="sidebar-brand">
                <div class="sidebar-logo"></div>
                <span>BU</span>
              </div>
              <div class="sidebar-menu">
                <div class="menu-item active"><i class="fas fa-home"></i></div>
                <div class="menu-item"><i class="fas fa-comments"></i></div>
                <div class="menu-item"><i class="fas fa-users"></i></div>
                <div class="menu-item"><i class="fas fa-chart-pie"></i></div>
                <div class="menu-item"><i class="fas fa-coins"></i></div>
              </div>
            </div>
            <!-- Main Content -->
            <div class="preview-main">
              <!-- Header Card -->
              <div class="preview-header-card">
                <div class="header-card-left">
                  <div class="header-badge">📊 Панель управления</div>
                  <div class="header-title">Добро пожаловать!</div>
                </div>
                <div class="header-stats-row">
                  <div class="mini-stat"><span class="mini-val">24</span><span class="mini-lbl">Сообщения</span></div>
                  <div class="mini-stat"><span class="mini-val">156</span><span class="mini-lbl">Участники</span></div>
                  <div class="mini-stat"><span class="mini-val">8</span><span class="mini-lbl">Курсы</span></div>
                </div>
              </div>
              <!-- Cards Row -->
              <div class="preview-cards-row">
                <div class="preview-card rates">
                  <div class="card-title-mini">💱 Курсы валют</div>
                  <div class="rates-mini">
                    <div class="rate-mini"><span>USD</span><span class="rate-val">91.25</span></div>
                    <div class="rate-mini"><span>EUR</span><span class="rate-val">98.75</span></div>
                  </div>
                </div>
                <div class="preview-card messages">
                  <div class="card-title-mini">💬 Сообщения</div>
                  <div class="msg-mini">
                    <div class="msg-avatar-mini">А</div>
                    <div class="msg-text-mini">Новое сообщение...</div>
                  </div>
                </div>
                <div class="preview-card community">
                  <div class="card-title-mini">🌐 Сообщество</div>
                  <div class="comm-stats-mini">
                    <span>156 участников</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Logos Section -->
    <section class="logos" v-animate>
      <div class="logos-container">
        <p class="logos-title">Нам доверяют ведущие компании</p>
        <div class="logos-grid">
          <div class="logo-item">Сбербанк</div>
          <div class="logo-item">Тинькофф</div>
          <div class="logo-item">ВТБ</div>
          <div class="logo-item">Яндекс</div>
          <div class="logo-item">Mail.ru</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features" v-animate>
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">Возможности</span>
          <h2 class="section-title">Всё для вашего бизнеса</h2>
          <p class="section-subtitle">Мощные инструменты для каждого участника рынка</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon-wrapper">
              <i :class="feature.icon"></i>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <div class="feature-link">
              Подробнее <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="benefits" v-animate>
      <div class="section-container">
        <div class="benefits-header">
          <span class="section-badge">Преимущества</span>
          <h2 class="section-title left">Почему выбирают BusinessUnion</h2>
        </div>
        <div class="benefits-layout">
          <div class="benefits-list">
            <div class="benefit-card" v-for="(benefit, index) in benefits" :key="index">
              <div class="benefit-number">0{{ index + 1 }}</div>
              <div class="benefit-content">
                <h3>{{ benefit.title }}</h3>
                <p>{{ benefit.description }}</p>
              </div>
            </div>
          </div>
          <div class="benefits-visual">
            <div class="visual-card">
              <div class="visual-icon"><i class="fas fa-shield-alt"></i></div>
              <div class="visual-text">Защита данных</div>
              <div class="visual-badge">256-bit SSL</div>
            </div>
            <div class="visual-card">
              <div class="visual-icon"><i class="fas fa-chart-line"></i></div>
              <div class="visual-text">AI Аналитика</div>
              <div class="visual-badge">Real-time</div>
            </div>
            <div class="visual-card">
              <div class="visual-icon"><i class="fas fa-users"></i></div>
              <div class="visual-text">Сообщество</div>
              <div class="visual-badge">1000+ участников</div>
            </div>
            <div class="visual-card">
              <div class="visual-icon"><i class="fas fa-rocket"></i></div>
              <div class="visual-text">Быстрый старт</div>
              <div class="visual-badge">5 минут</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials" v-animate>
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">Отзывы</span>
          <h2 class="section-title">Что говорят наши пользователи</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card" v-for="(testimonial, index) in testimonials" :key="index">
            <div class="testimonial-rating">
              <i class="fas fa-star" v-for="n in 5" :key="n"></i>
            </div>
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testimonial.initials }}</div>
              <div class="author-info">
                <div class="author-name">{{ testimonial.name }}</div>
                <div class="author-role">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta" v-animate>
      <div class="cta-container">
        <h2>Готовы начать?</h2>
        <p>Присоединяйтесь к тысячам профессионалов уже сегодня</p>
        <div class="cta-actions">
          <router-link to="/register" class="cta-btn-primary">
            Создать бесплатный аккаунт
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
        <div class="cta-features">
          <div class="cta-feature">
            <i class="fas fa-check"></i>
            <span>Бесплатная регистрация</span>
          </div>
          <div class="cta-feature">
            <i class="fas fa-check"></i>
            <span>Без кредитной карты</span>
          </div>
          <div class="cta-feature">
            <i class="fas fa-check"></i>
            <span>Отмена в любое время</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-brand">
            <img src="@/assets/icon.png" alt="Logo" class="footer-logo" />
            <span>BusinessUnion</span>
          </div>
          <div class="footer-links">
            <a href="#">О нас</a>
            <a href="#">Контакты</a>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-legal">
            <router-link to="/privacy">Политика конфиденциальности</router-link>
            <router-link to="/terms">Пользовательское соглашение</router-link>
            <router-link to="/data-processing">Обработка персональных данных</router-link>
          </div>
          <div class="footer-copy">
            © 2025 BusinessUnion. Все права защищены.
          </div>
        </div>
      </div>
    </footer>

    
  </div>
</template>

<script>
export default {
  name: 'Home',
  directives: {
    animate: {
      mounted(el) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('visible');
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.1 });
        el.classList.add('animate-section');
        observer.observe(el);
      }
    }
  },
  data() {
    return {
      isScrolled: false,
      mounted: false,
      features: [
        {
          title: 'Для стартапов',
          description: 'Найдите инвесторов и получите экспертную поддержку на всех этапах развития проекта',
          icon: 'fas fa-rocket'
        },
        {
          title: 'Для инвесторов',
          description: 'Доступ к базе перспективных стартапов и аналитическим инструментам оценки рисков',
          icon: 'fas fa-chart-line'
        },
        {
          title: 'Для бизнесменов',
          description: 'Передовые инструменты аналитики рынка и новые возможности для развития',
          icon: 'fas fa-briefcase'
        },
        {
          title: 'Крипто трекер',
          description: 'Отслеживайте тренды крипторынка и получайте актуальную информацию в реальном времени',
          icon: 'fas fa-coins'
        }
      ],
      benefits: [
        {
          title: 'Безопасность данных',
          description: 'Все транзакции и данные защищены по международным стандартам безопасности'
        },
        {
          title: 'AI-аналитика',
          description: 'Используйте искусственный интеллект для анализа рынка и проектов'
        },
        {
          title: 'Поддержка 24/7',
          description: 'Круглосуточная поддержка и консультации от экспертов рынка'
        },
        {
          title: 'Быстрый старт',
          description: 'Начните работу за 5 минут — простая регистрация и интуитивный интерфейс'
        }
      ],
      testimonials: [
        {
          text: 'BusinessUnion помог нам найти идеального инвестора для нашего стартапа. Процесс был простым и эффективным.',
          name: 'Алексей Петров',
          role: 'CEO, TechStart',
          initials: 'АП'
        },
        {
          text: 'Отличная платформа для анализа рынка. Аналитические инструменты экономят мне часы работы каждую неделю.',
          name: 'Мария Иванова',
          role: 'Инвестор',
          initials: 'МИ'
        },
        {
          text: 'Крипто трекер — лучший инструмент для отслеживания рынка. Рекомендую всем трейдерам.',
          name: 'Дмитрий Сидоров',
          role: 'Трейдер',
          initials: 'ДС'
        }
      ]
    }
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    setTimeout(() => {
      this.mounted = true;
    }, 100);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.landing {
  width: 100%;
  overflow-x: hidden;
  background: #ffffff;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.nav-scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
}

.brand-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #1E6BFF;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  background: #1E6BFF;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #1557d9;
  transform: translateY(-2px);
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 8rem 2rem 4rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  gap: 4rem;
}

/* Animations */
.animate-in {
  animation: fadeInUp 0.8s ease forwards;
}

.animate-in-delay {
  animation: fadeInUp 0.8s ease 0.3s forwards;
  opacity: 0;
}

.animate-section {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.animate-section.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(30, 107, 255, 0.1);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1E6BFF;
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #1E6BFF;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #1E6BFF 0%, #6366f1 50%, #0ea5e9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: #1E6BFF;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1557d9;
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(30, 107, 255, 0.3);
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: white;
  color: #1a1a2e;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #1E6BFF;
  color: #1E6BFF;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: fit-content;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1E6BFF;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  z-index: 1;
}

.dashboard-preview {
  background: #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.3s ease;
}

.dashboard-preview:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #e2e8f0;
  border-bottom: 1px solid #cbd5e1;
}

.preview-dots {
  display: flex;
  gap: 0.375rem;
}

.preview-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5f57;
}

.preview-dots span:nth-child(2) { background: #ffbd2e; }
.preview-dots span:nth-child(3) { background: #28ca41; }

.preview-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
}

.preview-content {
  display: flex;
  min-height: 320px;
}

.preview-sidebar {
  width: 70px;
  background: #ffffff;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #e2e8f0;
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
}

.sidebar-logo {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #1E6BFF, #6366f1);
  border-radius: 8px;
}

.sidebar-brand span {
  font-size: 0.625rem;
  font-weight: 700;
  color: #1E6BFF;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.menu-item {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.menu-item.active {
  background: rgba(30, 107, 255, 0.1);
  color: #1E6BFF;
}

.preview-main {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #f1f5f9;
}

.preview-header-card {
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-badge {
  font-size: 0.625rem;
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.375rem;
}

.header-title {
  font-size: 1rem;
  font-weight: 700;
}

.header-stats-row {
  display: flex;
  gap: 0.75rem;
}

.mini-stat {
  background: rgba(255,255,255,0.15);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.mini-val {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
}

.mini-lbl {
  display: block;
  font-size: 0.5rem;
  opacity: 0.8;
}

.preview-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.preview-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 0.875rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-title-mini {
  font-size: 0.625rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.rates-mini {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.rate-mini {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: #64748b;
}

.rate-mini .rate-val {
  font-weight: 600;
  color: #1a1a2e;
}

.msg-mini {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.msg-avatar-mini {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1E6BFF, #6366f1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
}

.msg-text-mini {
  font-size: 0.5625rem;
  color: #64748b;
}

.comm-stats-mini {
  font-size: 0.625rem;
  color: #1E6BFF;
  font-weight: 500;
}

/* Logos Section */
.logos {
  padding: 4rem 2rem;
  background: #f8fafc;
}

.logos-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.logos-title {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.logos-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  flex-wrap: wrap;
}

.logo-item {
  font-size: 1.25rem;
  font-weight: 600;
  color: #cbd5e1;
}

/* Features Section */
.features {
  padding: 6rem 2rem;
  background: #ffffff;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(30, 107, 255, 0.1);
  color: #1E6BFF;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 1rem;
}

.section-title.left {
  text-align: left;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}

.feature-card {
  padding: 2rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature-card:hover {
  border-color: #1E6BFF;
  box-shadow: 0 20px 40px rgba(30, 107, 255, 0.1);
  transform: translateY(-5px);
}

.feature-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1E6BFF 0%, #6366f1 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.feature-icon-wrapper i {
  font-size: 1.5rem;
  color: white;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.75rem;
}

.feature-card p {
  font-size: 0.9375rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.feature-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E6BFF;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  margin-top: auto;
}

.feature-link i {
  transition: transform 0.2s;
}

.feature-card:hover .feature-link i {
  transform: translateX(4px);
}

/* Benefits Section */
.benefits {
  padding: 6rem 2rem;
  background: #f8fafc;
}

.benefits-header {
  margin-bottom: 2.5rem;
}

.benefits-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 90px;
  align-items: center;
}

.benefit-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1E6BFF;
  opacity: 0.3;
  flex-shrink: 0;
}

.benefit-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 0.25rem;
}

.benefit-content p {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

.benefits-visual {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.visual-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  min-height: 90px;
}

.visual-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E6BFF 0%, #6366f1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.visual-text {
  flex: 1;
  font-weight: 600;
  color: #1a1a2e;
}

.visual-badge {
  padding: 0.375rem 0.75rem;
  background: rgba(30, 107, 255, 0.1);
  color: #1E6BFF;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Testimonials */
.testimonials {
  padding: 6rem 2rem;
  background: #ffffff;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}

.testimonial-card {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}

.testimonial-rating {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.testimonial-rating i {
  color: #fbbf24;
  font-size: 0.875rem;
}

.testimonial-text {
  font-size: 1rem;
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E6BFF 0%, #6366f1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.author-name {
  font-weight: 600;
  color: #1a1a2e;
}

.author-role {
  font-size: 0.875rem;
  color: #64748b;
}

/* CTA Section */
.cta {
  position: relative;
  padding: 6rem 2rem;
  overflow: hidden;
  background: linear-gradient(135deg, #1E6BFF 0%, #6366f1 50%, #0ea5e9 100%);
}

.cta-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  color: white;
}

.cta h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.cta-actions {
  margin-bottom: 2rem;
}

.cta-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: white;
  color: #1E6BFF;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cta-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.cta-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  opacity: 0.9;
}

/* Footer */
.footer {
  padding: 2.5rem 2rem;
  background: #1a1a2e;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
}

.footer-logo {
  width: 32px;
  height: 32px;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-legal {
  display: flex;
  gap: 1.5rem;
}

.footer-legal a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: color 0.2s;
}

.footer-legal a:hover {
  color: white;
}

.footer-legal a:visited {
  color: rgba(255, 255, 255, 0.6);
}

.footer-copy {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8125rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding-top: 6rem;
  }
  
  .hero-content {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .hero-subtitle {
    max-width: 100%;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-stats {
    margin: 0 auto;
  }
  
  .hero-visual {
    display: none;
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .benefits-layout {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-divider {
    width: 40px;
    height: 1px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .cta-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-brand {
    font-size: 1.25rem;
  }
  
  .brand-icon {
    width: 32px;
    height: 32px;
  }
  
  .section-container {
    padding: 0 1rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .logos-grid {
    gap: 2rem;
  }
  
  .logo-item {
    font-size: 1rem;
  }
  
  .benefit-card {
    padding: 1rem;
  }
  
  .visual-card {
    padding: 1rem;
  }
  
  .cta h2 {
    font-size: 1.75rem;
  }
  
  .cta p {
    font-size: 1rem;
  }
  
  .footer-top {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-legal {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 5rem 1rem 2rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.75rem;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
    justify-content: center;
  }
  
  .hero-stats {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .section-badge {
    font-size: 0.75rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .feature-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .feature-card h3 {
    font-size: 1.1rem;
  }
  
  .testimonial-card {
    padding: 1.5rem;
  }
  
  .cta {
    padding: 4rem 1rem;
  }
  
  .cta-btn-primary {
    padding: 0.875rem 2rem;
    font-size: 0.9rem;
  }
  
  .footer {
    padding: 2rem 1rem;
  }
}
</style>
