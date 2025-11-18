<template>
  <div class="home">
    <nav class="navbar">
      <div class="navbar-brand">BusinessUnion</div>
      <div class="navbar-links">
        <a href="#" class="nav-link" @click.prevent="showLoginModal = true">Вход</a>
        <a href="#" class="nav-link nav-link-primary" @click.prevent="showRegisterModal = true">Регистрация</a>
      </div>
    </nav>

    <section class="hero" v-animate>
      <div class="hero-content">
        <h1 class="hero-title">Объединяем бизнес-сообщества</h1>
        <p class="hero-subtitle">Платформа для эффективного взаимодействия инвесторов, стартапов и бизнесменов</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Активных проектов</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <span class="stat-label">Инвесторов</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">₽100M+</span>
            <span class="stat-label">Инвестиций</span>
          </div>
        </div>
      </div>
      <div class="hero-image"></div>
    </section>

    <section class="features" v-animate>
      <h2 class="section-title">Ваши возможности с BusinessUnion</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon" :class="feature.icon"></div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <div class="feature-bg"></div>
        </div>
      </div>
    </section>

    <section class="benefits" v-animate>
      <div class="benefits-content">
        <div class="benefits-text">
          <h2 class="section-title">Почему выбирают нас</h2>
          <div class="benefits-list">
            <div class="benefit-item" v-for="(benefit, index) in benefits" :key="index">
              <div class="benefit-icon" :class="benefit.icon"></div>
              <div class="benefit-info">
                <h3>{{ benefit.title }}</h3>
                <p>{{ benefit.description }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="benefits-image"></div>
      </div>
    </section>

    <section class="cta" v-animate>
      <div class="cta-content">
        <h2>Готовы начать?</h2>
        <p>Присоединяйтесь к сообществу профессионалов прямо сейчас</p>
        <button class="cta-button" @click="showRegisterModal = true">
          Создать аккаунт
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </section>

    <LoginModal 
      v-if="showLoginModal" 
      @close="showLoginModal = false"
      @success="onLoginSuccess"
    />

    <RegisterModal
      v-if="showRegisterModal"
      @close="showRegisterModal = false"
      @success="onRegisterSuccess"
    />
  </div>
</template>

<script>
import LoginModal from '@/components/auth/LoginModal.vue'
import RegisterModal from '@/components/auth/RegisterModal.vue'

export default {
  name: 'Home',
  components: {
    LoginModal,
    RegisterModal
  },
  data() {
    return {
      showLoginModal: false,
      showRegisterModal: false,
      features: [
        {
          title: 'Для стартапов',
          description: 'Найдите инвесторов для вашего проекта и получите экспертную поддержку на всех этапах развития',
          icon: 'fas fa-rocket'
        },
        {
          title: 'Для инвесторов',
          description: 'Получите доступ к базе перспективных стартапов и аналитическим инструментам для оценки рисков',
          icon: 'fas fa-chart-line'
        },
        {
          title: 'Для бизнесменов',
          description: 'Используйте передовые инструменты аналитики рынка и находите новые возможности для развития',
          icon: 'fas fa-briefcase'
        },
        {
          title: 'Для трейдеров',
          description: 'Отслеживайте тренды крипторынка и получайте актуальную информацию для принятия решений',
          icon: 'fas fa-coins'
        }
      ],
      benefits: [
        {
          title: 'Безопасность',
          description: 'Все транзакции и данные защищены по международным стандартам',
          icon: 'fas fa-shield-alt'
        },
        {
          title: 'Аналитика',
          description: 'Используйте AI-powered инструменты для анализа рынка и проектов',
          icon: 'fas fa-chart-bar'
        },
        {
          title: 'Поддержка',
          description: '24/7 поддержка и консультации от экспертов рынка',
          icon: 'fas fa-headset'
        }
      ]
    }
  },
  methods: {
    async onLoginSuccess() {
      this.showLoginModal = false;
      await new Promise(resolve => setTimeout(resolve, 300)); // Ждем завершения анимации
      this.$router.push('/dashboard');
    },
    onRegisterSuccess() {
      this.showRegisterModal = false;
      this.$router.push('/dashboard');
    },
    initializeAnimations() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      }, options);

      document.querySelectorAll('[v-animate]').forEach(element => {
        element.classList.add('pre-animate');
        observer.observe(element);
      });

      // Анимация статистики
      this.animateNumbers();
    },
    animateNumbers() {
      const stats = document.querySelectorAll('.stat-number');
      stats.forEach(stat => {
        const finalValue = stat.textContent;
        let startValue = 0;
        const duration = 2000;
        const increment = parseInt(finalValue) / (duration / 16);
        
        const animate = () => {
          startValue += increment;
          if (startValue < parseInt(finalValue)) {
            stat.textContent = Math.floor(startValue);
            requestAnimationFrame(animate);
          } else {
            stat.textContent = finalValue;
          }
        };
        
        animate();
      });
    }
  },
  mounted() {
    this.initializeAnimations();
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Raleway:wght@600;700&display=swap');

.home {
  width: 100%;
  overflow-x: hidden;
  background: #ffffff;
}

/* Навигационная панель */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #2196F3;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  color: #2196F3;
  background: rgba(33, 150, 243, 0.1);
}

.nav-link-primary {
  color: white;
  background: #2196F3;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.nav-link-primary:hover {
  background: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

/* Главный блок */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 4rem 4rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 600px;
  z-index: 1;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(45deg, #2196F3, #21CBF3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 3rem;
  margin-top: 4rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2196F3;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 1rem;
}

.hero-image {
  position: absolute;
  right: -10%;
  top: 50%;
  transform: translateY(-50%);
  width: 60%;
  height: 80%;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1));
  border-radius: 50%;
  opacity: 0.8;
}

/* Блок возможностей */
.features {
  padding: 8rem 4rem;
  background: #ffffff;
}

.section-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 4rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  position: relative;
  padding: 2rem;
  border-radius: 20px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #2196F3;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.feature-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 203, 243, 0.1));
  border-radius: 50%;
  transform: translate(50%, -50%);
  z-index: 0;
}

/* Блок преимуществ */
.benefits {
  padding: 8rem 4rem;
  background: #f8fafc;
}

.benefits-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 4rem;
}

.benefits-text {
  flex: 1;
}

.benefits-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.benefit-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.benefit-item:hover {
  transform: translateX(10px);
}

.benefit-icon {
  font-size: 2rem;
  color: #2196F3;
}

.benefit-info h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.benefit-info p {
  color: #666;
  line-height: 1.6;
}

.benefits-image {
  flex: 1;
  height: 500px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(33, 203, 243, 0.05));
  border-radius: 20px;
}

/* Блок призыва к действию */
.cta {
  padding: 8rem 4rem;
  background: linear-gradient(135deg, #2196F3, #21CBF3);
  color: white;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta h2 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.cta p {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 3rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2196F3;
  background: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Анимации */
.pre-animate {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate {
  opacity: 1;
  transform: translateY(0);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .hero {
    padding: 6rem 2rem 4rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-image {
    opacity: 0.3;
  }

  .benefits-content {
    flex-direction: column;
  }

  .benefits-image {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
  }

  .navbar-brand {
    font-size: 1.5rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 2rem;
  }

  .features,
  .benefits,
  .cta {
    padding: 4rem 2rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style> 