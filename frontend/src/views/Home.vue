<template>
  <div class="home">
    <nav class="navbar">
      <div class="navbar-brand">BusinessUnion</div>
      <div class="navbar-links">
        <router-link to="/login" class="nav-link">Вход</router-link>
        <router-link to="/register" class="nav-link nav-link-primary">Регистрация</router-link>
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
  </div>
</template>

<script>
export default {
  name: 'Home'
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
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  box-sizing: border-box;
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Raleway', sans-serif;
  color: #ffffff;
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
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #2196F3;
}

.nav-link-primary {
  color: #b3b3b3;
  font-weight: 500;
  transition: color 0.3s ease;
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
  animation: fadeInUp 1s ease-out;
  font-size: 2.5rem;
  letter-spacing: 1px;
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
  opacity: 0;
  animation: scaleIn 0.6s ease-out forwards;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.about-card:nth-child(1) { animation-delay: 0.2s; }
.about-card:nth-child(2) { animation-delay: 0.4s; }
.about-card:nth-child(3) { animation-delay: 0.6s; }

.about-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.15);
  background: rgba(22, 22, 22, 0.95);
  border-color: #2196F3;
}

.about-card h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
}

.about-card p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
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
  opacity: 0;
  animation: slideInLeft 0.6s ease-out forwards;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.feature-card:last-child {
  grid-column: 2;
}

.feature-card:nth-child(1) { animation-delay: 0.2s; }
.feature-card:nth-child(2) { animation-delay: 0.4s; }
.feature-card:nth-child(3) { animation-delay: 0.6s; }
.feature-card:nth-child(4) { animation-delay: 0.8s; }

.feature-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.15);
  background: rgba(22, 22, 22, 0.95);
  border-color: #2196F3;
}

.feature-card h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
}

.feature-card p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
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
  opacity: 0;
  animation: scaleIn 0.6s ease-out forwards;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.benefit-item:nth-child(1) { animation-delay: 0.2s; }
.benefit-item:nth-child(2) { animation-delay: 0.4s; }
.benefit-item:nth-child(3) { animation-delay: 0.6s; }

.benefit-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.15);
  background: rgba(22, 22, 22, 0.95);
  border-color: #2196F3;
}

.benefit-item h3 {
  color: #2196F3;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-family: 'Raleway', sans-serif;
  letter-spacing: 0.5px;
}

.benefit-item p {
  color: #b3b3b3;
  line-height: 1.8;
  font-size: 1.3rem;
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

h2 {
  font-weight: 700;
  font-size: 3.2rem;
  font-family: 'Raleway', sans-serif;
  position: relative;
  margin-bottom: 4rem;
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
  border-radius: 3px;
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
</style> 