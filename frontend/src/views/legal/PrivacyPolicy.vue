<template>
  <div class="legal-page">
    <div class="legal-container">
      <router-link to="/" class="back-link">
        <i class="fas fa-arrow-left"></i>
        На главную
      </router-link>
      
      <h1>Политика конфиденциальности</h1>
      <p class="updated">Последнее обновление: 1 декабря 2025 г.</p>

      <section>
        <h2>1. Общие положения</h2>
        <p>Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей платформы BusinessUnion (далее — «Платформа»).</p>
        <p>Используя Платформу, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны с какими-либо положениями, пожалуйста, прекратите использование Платформы.</p>
      </section>

      <section>
        <h2>2. Какие данные мы собираем</h2>
        <p>Мы можем собирать следующие категории персональных данных:</p>
        <ul>
          <li><strong>Регистрационные данные:</strong> имя, фамилия, адрес электронной почты, номер телефона</li>
          <li><strong>Профильные данные:</strong> информация о компании, должность, профессиональные интересы</li>
          <li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, данные о посещениях</li>
          <li><strong>Коммуникационные данные:</strong> переписка в мессенджере, обращения в службу поддержки</li>
        </ul>
      </section>

      <section>
        <h2>3. Цели обработки данных</h2>
        <p>Мы обрабатываем ваши персональные данные для следующих целей:</p>
        <ul>
          <li>Предоставление доступа к функциям Платформы</li>
          <li>Идентификация пользователя и обеспечение безопасности аккаунта</li>
          <li>Улучшение качества сервиса и пользовательского опыта</li>
          <li>Отправка уведомлений о важных изменениях в работе Платформы</li>
          <li>Выполнение требований законодательства Российской Федерации</li>
        </ul>
      </section>

      <section>
        <h2>4. Защита данных</h2>
        <p>Мы применяем современные технические и организационные меры для защиты ваших персональных данных:</p>
        <ul>
          <li>Шифрование данных с использованием протокола SSL/TLS (256-bit)</li>
          <li>Регулярное резервное копирование данных</li>
          <li>Ограничение доступа к персональным данным</li>
          <li>Мониторинг безопасности системы</li>
        </ul>
      </section>

      <section>
        <h2>5. Передача данных третьим лицам</h2>
        <p>Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев:</p>
        <ul>
          <li>Получения вашего явного согласия</li>
          <li>Выполнения требований законодательства</li>
          <li>Защиты прав и безопасности пользователей Платформы</li>
        </ul>
      </section>

      <section>
        <h2>6. Ваши права</h2>
        <p>Вы имеете право:</p>
        <ul>
          <li>Получить информацию о ваших персональных данных, которые мы обрабатываем</li>
          <li>Требовать исправления неточных данных</li>
          <li>Требовать удаления ваших персональных данных</li>
          <li>Отозвать согласие на обработку персональных данных</li>
        </ul>
      </section>

      <section>
        <h2>7. Контактная информация</h2>
        <p>По вопросам, связанным с обработкой персональных данных, вы можете обратиться:</p>
        <p>Email: privacy@businessunion.ru</p>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy'
}
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E6BFF;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 2rem;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 0.5rem;
}

.updated {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
}

p {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1rem;
}

ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

li {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .legal-container {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>
