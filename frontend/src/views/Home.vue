<template>
  <div class="home">
    <nav class="navbar">
      <div class="navbar-brand">BusinessUnion</div>
      <div class="navbar-links">
        <a href="#" class="nav-link" @click.prevent="showLoginModal = true">Вход</a>
        <a href="#" class="nav-link nav-link-primary" @click.prevent="showRegisterModal = true">Регистрация</a>
      </div>
    </nav>

    <section class="about">
      <h2>О проекте</h2>
      <div class="about-content">
        <div class="about-card">
          <h3>Что такое BusinessUnion?</h3>
          <p>Это уникальная платформа, объединяющая представителей различных бизнес-сообществ для взаимовыгодного сотрудничества и получения прибыли.</p>
        </div>
        <div class="about-card">
          <h3>Как это работает?</h3>
          <p>Мы создаем пространство, где инвесторы, стартаперы, бизнесмены и крипто-трейдеры могут эффективно взаимодействовать друг с другом, обмениваться опытом и находить новые возможности для развития.</p>
        </div>
        <div class="about-card">
          <h3>Наша миссия</h3>
          <p>Объединить различные бизнес-сообщества в единую экосистему, где каждый участник может найти свою нишу и реализовать свой потенциал.</p>
        </div>
      </div>
    </section>

    <section class="features">
      <h2 style="color: black !important; font-size: 2.5rem !important; margin-bottom: 3rem !important; font-weight: 600 !important; text-align: center !important; -webkit-text-fill-color: black !important; text-shadow: none !important;">Для кого наш проект?</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>Стартаперы</h3>
          <p>Создавайте и развивайте свои проекты, находите инвесторов и партнеров</p>
        </div>
        <div class="feature-card">
          <h3>Инвесторы</h3>
          <p>Ищите перспективные проекты и инвестируйте в их развитие</p>
        </div>
        <div class="feature-card">
          <h3>Крипто-трейдеры</h3>
          <p>Следите за курсами криптовалют и анализируйте рынок</p>
        </div>
        <div class="feature-card">
          <h3>Бизнесмены</h3>
          <p>Получайте аналитику рынка и находите новые возможности</p>
        </div>
      </div>
    </section>

    <section class="benefits">
      <h2 style="color: black !important; font-size: 2.5rem !important; margin-bottom: 3rem !important; font-weight: 600 !important; text-align: center !important; -webkit-text-fill-color: black !important; text-shadow: none !important;">Преимущества платформы</h2>
      <div class="benefits-grid">
        <div class="benefit-item">
          <h3>Безопасность</h3>
          <p>Защищенные транзакции и проверенные пользователи</p>
        </div>
        <div class="benefit-item">
          <h3>Аналитика</h3>
          <p>Детальный анализ проектов и рынка</p>
        </div>
        <div class="benefit-item">
          <h3>Сообщество</h3>
          <p>Взаимодействие с единомышленниками</p>
        </div>
      </div>
    </section>

    <Modal :show="showLoginModal" @close="showLoginModal = false">
      <Login @success="onLoginSuccess" />
    </Modal>

    <Modal :show="showRegisterModal" @close="showRegisterModal = false">
      <Register @success="onRegisterSuccess" />
    </Modal>
  </div>
</template>

<script>
import Modal from '@/components/Modal.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

export default {
  name: 'Home',
  components: {
    Modal,
    Login,
    Register
  },
  data() {
    return {
      showLoginModal: false,
      showRegisterModal: false
    }
  },
  methods: {
    onLoginSuccess() {
      this.showLoginModal = false;
      this.$router.push('/dashboard');
    },
    onRegisterSuccess() {
      this.showRegisterModal = false;
      this.$router.push('/dashboard');
    }
  },
  mounted() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target); // Отключаем наблюдение после анимации
        }
      });
    }, options);

    // Наблюдаем за всеми карточками
    document.querySelectorAll('.about-card, .feature-card, .benefit-item').forEach(card => {
      card.classList.add('pre-animation');
      observer.observe(card);
    });
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Raleway:wght@600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
}

body {
  margin: 0;
  padding: 0;
  background: #f5f5f5;
  overflow-x: hidden;
  width: 100%;
}

section {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 4rem 0;
  background: #f5f5f5;
  position: relative;
  overflow: visible;
}

.about-content,
.feature-grid,
.benefits-grid {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.home {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
  color: #333333;
  padding-top: 4rem;
  margin: 0;
  overflow-x: hidden;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
  z-index: 1000;
  box-sizing: border-box;
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #2196F3;
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #000000;
  font-weight: 500;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  border-radius: 4px;
}

.nav-link:hover {
  color: #2196F3;
}

.nav-link:hover::after {
  transform: translateX(0);
}

.nav-link-primary {
  color: #000000;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link-primary:hover {
  color: #2196F3;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 2rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.about {
  background: #f5f5f5;
  padding: 4rem 2rem;
  text-align: center;
}

.about h2 {
  color: #363636;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-weight: 600;
  text-align: center;
}

.about-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  text-align: center;
}

.about-card:hover {
  transform: translateY(-5px);
}

.about-card h3 {
  color: #2196F3;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}

.about-card p {
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
  margin: 0;
}

.features, .benefits {
  padding: 4rem 2rem;
  background: #f5f5f5;
}

.features h2, .benefits h2 {
  position: relative;
  z-index: 10;
  display: block !important;
  color: #000000 !important;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-weight: 600;
  text-align: center;
  background: none !important;
  -webkit-text-fill-color: #000000 !important;
  text-shadow: none !important;
}

.features h2::before, .benefits h2::before,
.features h2::after, .benefits h2::after {
  display: none !important;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-grid .feature-card:last-child {
  grid-column: 2 / 3;
  justify-self: center;
  width: 100%;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card, .benefit-item {
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover, .benefit-item:hover {
  transform: translateY(-5px);
  background: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.feature-card h3, .benefit-item h3 {
  color: #2196F3;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}

.feature-card p, .benefit-item p {
  color: #333333;
  line-height: 1.6;
  font-size: 1.1rem;
  margin: 0;
}

h2::after {
  display: none;
}

h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
}

p {
  color: #333333;
  line-height: 1.8;
  font-size: 1.3rem;
}

@media (max-width: 768px) {
  .about-content,
  .feature-grid,
  .benefits-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .feature-card:last-child {
    grid-column: auto;
  }

  section {
    padding: 3rem 1rem;
  }

  h2 {
    font-size: 2.5rem;
  }

  h3 {
    font-size: 1.6rem;
  }

  p {
    font-size: 1.2rem;
  }

  .navbar-brand {
    font-size: 1.8rem;
  }

  .nav-link {
    font-size: 1.1rem;
  }
}

@media (max-width: 1200px) {
  .feature-grid .feature-card:last-child {
    grid-column: auto;
  }
}

.pre-animation {
  opacity: 0;
  transform: translateY(20px);
}

.about-card.animate,
.feature-card.animate,
.benefit-item.animate {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.5s ease-out;
}

.about-card::before, .feature-card::before, .benefit-item::before,
.about-card::after, .feature-card::after, .benefit-item::after {
  display: none;
}

@keyframes gradientBorder {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.about-card:hover, .feature-card:hover, .benefit-item:hover {
  transform: translateY(-5px);
  background: #ffffff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

@keyframes neonPulse {
  0% { box-shadow: 0 0 5px rgba(33, 150, 243, 0.05), 0 0 10px rgba(33, 150, 243, 0.05); }
  50% { box-shadow: 0 0 10px rgba(33, 150, 243, 0.1), 0 0 20px rgba(33, 150, 243, 0.1); }
  100% { box-shadow: 0 0 5px rgba(33, 150, 243, 0.05), 0 0 10px rgba(33, 150, 243, 0.05); }
}

@keyframes floatingText {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

h2 {
  margin: 0;
  padding: 0;
}

.black-header {
  display: none;
}
</style> 