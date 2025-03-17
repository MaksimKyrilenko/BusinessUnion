<template>
  <div class="home">
    <header class="hero">
      <h1>BusinessUnion</h1>
      <p class="subtitle">Платформа для взаимодействия бизнес-сообщества</p>
      <div class="cta-buttons">
        <router-link to="/register" class="btn btn-primary">Регистрация</router-link>
        <router-link to="/login" class="btn btn-secondary">Вход</router-link>
      </div>
    </header>

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
          <h3>Бизнесмены</h3>
          <p>Получайте аналитику рынка и находите новые возможности</p>
        </div>
        <div class="feature-card">
          <h3>Крипто-трейдеры</h3>
          <p>Следите за курсами криптовалют и анализируйте рынок</p>
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
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
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

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.feature-card h3 {
  color: #28a745;
  margin-bottom: 1rem;
}

.benefits {
  background: #f8f9fa;
  padding: 3rem;
  border-radius: 1rem;
}

.benefits h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-item {
  text-align: center;
}

.benefit-item h3 {
  color: #28a745;
  margin-bottom: 1rem;
}
</style> 