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
      <h2>Для кого наш проект?</h2>
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
      <h2>Преимущества платформы</h2>
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
  background: #000000;
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
  background: transparent;
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
  background: #000000;
  color: #ffffff;
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(33, 150, 243, 0.1);
  z-index: 1000;
  box-sizing: border-box;
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: transparent;
  background: linear-gradient(45deg, #2196F3, #64B5F6);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
}

.navbar-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #b3b3b3;
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
  color: #b3b3b3;
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
  margin-bottom: 3rem;
  padding: 4rem 2rem;
  background: transparent;
}

.about h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
  animation: floatingText 6s ease-in-out infinite;
  font-size: 2.5rem;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
}

.about-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about-card {
  padding: 3rem;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.4s ease;
  opacity: 1;
  animation: none;
  border: 2px solid transparent;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.about-card:nth-child(1),
.about-card:nth-child(2),
.about-card:nth-child(3) {
  animation: none;
  animation-delay: 0s;
}

.about-card:hover {
  transform: translateY(-10px) scale(1.02);
  animation: neonPulse 2s infinite;
  border-image: linear-gradient(45deg, #2196F3, #64B5F6) 1;
  animation: gradientBorder 3s linear infinite;
  background: rgba(22, 22, 22, 0.98);
  filter: brightness(1.1);
  border-radius: 1.2rem;
}

.about-card h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
  position: relative;
}

.about-card h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  transition: width 0.4s ease;
  border-radius: 4px;
}

.about-card:hover h3::after {
  width: 100%;
}

.about-card p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.about-card:hover p {
  color: #ffffff;
  text-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
}

.features {
  margin-bottom: 3rem;
  padding: 4rem 2rem;
  background: transparent;
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
  animation: fadeInUp 1s ease-out;
  font-size: 2.5rem;
  letter-spacing: 1px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 3rem;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.4s ease;
  opacity: 1;
  animation: none;
  border: 2px solid transparent;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.feature-card:last-child {
  grid-column: 2;
}

.feature-card:nth-child(1),
.feature-card:nth-child(2),
.feature-card:nth-child(3),
.feature-card:nth-child(4) {
  animation: none;
  animation-delay: 0s;
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  animation: neonPulse 2s infinite;
  border-image: linear-gradient(45deg, #2196F3, #64B5F6) 1;
  animation: gradientBorder 3s linear infinite;
  background: rgba(22, 22, 22, 0.98);
  filter: brightness(1.1);
  border-radius: 1.2rem;
}

.feature-card h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
  position: relative;
}

.feature-card h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  transition: width 0.4s ease;
  border-radius: 4px;
}

.feature-card:hover h3::after {
  width: 100%;
}

.feature-card p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.feature-card:hover p {
  color: #ffffff;
  text-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
}

.benefits {
  margin-bottom: 3rem;
  padding: 4rem 2rem;
  background: transparent;
}

.benefits h2 {
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
  animation: fadeInUp 1s ease-out;
  font-size: 2.5rem;
  letter-spacing: 1px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.benefit-item {
  padding: 3rem;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.4s ease;
  opacity: 1;
  animation: none;
  border: 2px solid transparent;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.benefit-item:nth-child(1),
.benefit-item:nth-child(2),
.benefit-item:nth-child(3) {
  animation: none;
  animation-delay: 0s;
}

.benefit-item:hover {
  transform: translateY(-10px) scale(1.02);
  animation: neonPulse 2s infinite;
  border-image: linear-gradient(45deg, #2196F3, #64B5F6) 1;
  animation: gradientBorder 3s linear infinite;
  background: rgba(22, 22, 22, 0.98);
  filter: brightness(1.1);
  border-radius: 1.2rem;
}

.benefit-item h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
  position: relative;
}

.benefit-item h3::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #2196F3, #64B5F6);
  transition: width 0.4s ease;
  border-radius: 4px;
}

.benefit-item:hover h3::after {
  width: 100%;
}

.benefit-item p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
  transition: all 0.3s ease;
}

.benefit-item:hover p {
  color: #ffffff;
  text-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
}

section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  transition: transform 0.5s ease-out;
}

section:hover::before {
  transform: scale(1.02);
}

h2::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%);
  border-radius: 6px;
}

h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
}

p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
}

@media (max-width: 768px) {
  .about-content,
  .feature-grid,
  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .feature-card:last-child {
    grid-column: 1;
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

.pre-animation {
  opacity: 0;
  transform: translateY(50px);
  filter: brightness(0.5);
}

.about-card.animate,
.feature-card.animate,
.benefit-item.animate {
  animation: none;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: brightness(1);
}

.about-card::before, .feature-card::before, .benefit-item::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, rgba(33, 150, 243, 0.2), rgba(100, 181, 246, 0.2));
  border-radius: 1.2rem;
  z-index: -1;
  opacity: 0;
  transition: all 0.4s ease;
  filter: blur(0.5px);
}

.about-card:hover::before, .feature-card:hover::before, .benefit-item:hover::before {
  opacity: 0.4;
}

.about-card, .feature-card, .benefit-item {
  position: relative;
  padding: 3rem;
  background: rgba(15, 15, 15, 0.97);
  border-radius: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.4s ease;
  border: none;
  backdrop-filter: blur(10px);
  z-index: 1;
}

@keyframes gradientBorder {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.about-card:hover, .feature-card:hover, .benefit-item:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(18, 18, 18, 0.98);
  filter: brightness(1.03);
  border: none;
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

section {
  position: relative;
  overflow: hidden;
}

section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(33, 150, 243, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

section:hover::after {
  opacity: 1;
}
</style> 