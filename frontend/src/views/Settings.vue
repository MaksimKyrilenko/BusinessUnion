<template>
  <div class="settings-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-cog"></i>
          </div>
          <div>
            <h1>Настройки</h1>
            <p class="header-subtitle">Персонализация и конфиденциальность</p>
          </div>
        </div>
      </div>
    </header>

    <div class="settings-container">
      <!-- Sidebar Navigation -->
      <aside class="settings-sidebar">
        <nav class="settings-nav">
          <button 
            v-for="section in sections" 
            :key="section.id"
            :class="['nav-item', { active: activeSection === section.id }]"
            @click="activeSection = section.id"
          >
            <i :class="section.icon"></i>
            <span>{{ section.title }}</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <!-- Внешний вид -->
        <section v-show="activeSection === 'appearance'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-palette"></i>
            <div>
              <h2>Внешний вид</h2>
              <p>Настройте тему и отображение интерфейса</p>
            </div>
          </div>

          <div class="settings-card">
            <h3>Тема оформления</h3>
            <div class="theme-selector">
              <button 
                v-for="t in themes" 
                :key="t.id"
                :class="['theme-option', { active: theme === t.id }]"
                @click="setTheme(t.id)"
              >
                <div class="theme-preview" :class="t.id">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-header"></div>
                    <div class="preview-cards">
                      <div class="preview-card"></div>
                      <div class="preview-card"></div>
                    </div>
                  </div>
                </div>
                <span class="theme-name">{{ t.name }}</span>
                <i v-if="theme === t.id" class="fas fa-check-circle check-icon"></i>
              </button>
            </div>
          </div>

          <div class="settings-card">
            <h3>Размер шрифта</h3>
            <div class="font-size-selector">
              <button 
                v-for="size in fontSizes" 
                :key="size.id"
                :class="['size-option', { active: fontSize === size.id }]"
                @click="setFontSize(size.id)"
              >
                <span :style="{ fontSize: size.preview }">Аа</span>
                <span class="size-label">{{ size.name }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Уведомления -->
        <section v-show="activeSection === 'notifications'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-bell"></i>
            <div>
              <h2>Уведомления</h2>
              <p>Управляйте оповещениями и звуками</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <h4>Уведомления о сообщениях</h4>
                <p>Показывать уведомления о новых сообщениях</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.messages" @change="saveNotificationSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Звуковые уведомления</h4>
                <p>Воспроизводить звук при получении сообщений</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.sounds" @change="saveNotificationSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Email-уведомления</h4>
                <p>Получать важные уведомления на почту</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.email" @change="saveNotificationSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Push-уведомления</h4>
                <p>Уведомления в браузере</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="notifications.desktop" @change="saveNotificationSettings">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        <!-- Приватность -->
        <section v-show="activeSection === 'privacy'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-shield-alt"></i>
            <div>
              <h2>Приватность</h2>
              <p>Настройки конфиденциальности профиля</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <h4>Показывать статус онлайн</h4>
                <p>Другие пользователи видят, когда вы в сети</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="privacy.showOnline" @change="savePrivacySettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Показывать время последнего визита</h4>
                <p>Отображать когда вы были в сети</p>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="privacy.showLastSeen" @change="savePrivacySettings">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <h4>Кто видит мой профиль</h4>
                <p>Выберите, кто может просматривать ваш профиль</p>
              </div>
              <select v-model="privacy.showProfile" @change="savePrivacySettings" class="select-input">
                <option value="all">Все пользователи</option>
                <option value="contacts">Только контакты</option>
                <option value="nobody">Никто</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Язык -->
        <section v-show="activeSection === 'language'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-globe"></i>
            <div>
              <h2>Язык и регион</h2>
              <p>Выберите язык интерфейса</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="language-grid">
              <button 
                v-for="lang in languages" 
                :key="lang.id"
                :class="['language-option', { active: language === lang.id }]"
                @click="setLanguage(lang.id)"
              >
                <span class="lang-flag">{{ lang.flag }}</span>
                <span class="lang-name">{{ lang.name }}</span>
                <i v-if="language === lang.id" class="fas fa-check"></i>
              </button>
            </div>
          </div>
        </section>

        <!-- Безопасность -->
        <section v-show="activeSection === 'security'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-lock"></i>
            <div>
              <h2>Безопасность</h2>
              <p>Защита вашего аккаунта</p>
            </div>
          </div>

          <div class="settings-card">
            <div class="security-item" @click="changePassword">
              <div class="security-icon">
                <i class="fas fa-key"></i>
              </div>
              <div class="security-info">
                <h4>Изменить пароль</h4>
                <p>Обновите пароль для защиты аккаунта</p>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>

            <div class="security-item" @click="manageSessions">
              <div class="security-icon">
                <i class="fas fa-desktop"></i>
              </div>
              <div class="security-info">
                <h4>Активные сессии</h4>
                <p>Управление устройствами, где выполнен вход</p>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>

            <div class="security-item" @click="twoFactorAuth">
              <div class="security-icon">
                <i class="fas fa-mobile-alt"></i>
              </div>
              <div class="security-info">
                <h4>Двухфакторная аутентификация</h4>
                <p>Дополнительная защита при входе</p>
              </div>
              <span class="security-badge">Скоро</span>
            </div>
          </div>
        </section>

        <!-- О приложении -->
        <section v-show="activeSection === 'about'" class="settings-section">
          <div class="section-header">
            <i class="fas fa-info-circle"></i>
            <div>
              <h2>О приложении</h2>
              <p>Информация о BusinessUnion</p>
            </div>
          </div>

          <div class="settings-card about-card">
            <div class="app-info">
              <img src="@/assets/icon.png" alt="Logo" class="app-logo">
              <h3>BusinessUnion</h3>
              <p class="app-version">Версия 1.0.0</p>
            </div>

            <div class="about-links">
              <a href="/privacy" class="about-link">
                <i class="fas fa-file-alt"></i>
                <span>Политика конфиденциальности</span>
              </a>
              <a href="/terms" class="about-link">
                <i class="fas fa-file-contract"></i>
                <span>Условия использования</span>
              </a>
              <a href="mailto:support@businessunion.ru" class="about-link">
                <i class="fas fa-envelope"></i>
                <span>Связаться с поддержкой</span>
              </a>
            </div>

            <p class="copyright">© 2024 BusinessUnion. Все права защищены.</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'Settings',
  setup() {
    const settingsStore = useSettingsStore()
    const { theme, fontSize, language } = storeToRefs(settingsStore)
    
    const activeSection = ref('appearance')
    
    const sections = [
      { id: 'appearance', title: 'Внешний вид', icon: 'fas fa-palette' },
      { id: 'notifications', title: 'Уведомления', icon: 'fas fa-bell' },
      { id: 'privacy', title: 'Приватность', icon: 'fas fa-shield-alt' },
      { id: 'language', title: 'Язык', icon: 'fas fa-globe' },
      { id: 'security', title: 'Безопасность', icon: 'fas fa-lock' },
      { id: 'about', title: 'О приложении', icon: 'fas fa-info-circle' }
    ]
    
    const themes = [
      { id: 'light', name: 'Светлая' },
      { id: 'dark', name: 'Тёмная' },
      { id: 'auto', name: 'Авто' }
    ]
    
    const fontSizes = [
      { id: 'small', name: 'Маленький', preview: '12px' },
      { id: 'medium', name: 'Средний', preview: '14px' },
      { id: 'large', name: 'Большой', preview: '16px' }
    ]
    
    const languages = [
      { id: 'ru', name: 'Русский', flag: '🇷🇺' },
      { id: 'en', name: 'English', flag: '🇬🇧' },
      { id: 'kz', name: 'Қазақша', flag: '🇰🇿' }
    ]
    
    const notifications = reactive({
      messages: true,
      sounds: true,
      email: true,
      desktop: true
    })
    
    const privacy = reactive({
      showOnline: true,
      showLastSeen: true,
      showProfile: 'all'
    })
    
    onMounted(() => {
      // Загружаем настройки из store
      const stored = settingsStore.notifications
      notifications.messages = stored.messages
      notifications.sounds = stored.sounds
      notifications.email = stored.email
      notifications.desktop = stored.desktop
      
      const storedPrivacy = settingsStore.privacy
      privacy.showOnline = storedPrivacy.showOnline
      privacy.showLastSeen = storedPrivacy.showLastSeen
      privacy.showProfile = storedPrivacy.showProfile
    })
    
    const setTheme = (newTheme) => {
      settingsStore.applyTheme(newTheme)
    }
    
    const setFontSize = (size) => {
      settingsStore.saveFontSize(size)
    }
    
    const setLanguage = (lang) => {
      settingsStore.saveLanguage(lang)
    }
    
    const saveNotificationSettings = () => {
      settingsStore.saveNotifications({ ...notifications })
    }
    
    const savePrivacySettings = () => {
      settingsStore.savePrivacy({ ...privacy })
    }
    
    const changePassword = () => {
      alert('Функция изменения пароля будет доступна в ближайшем обновлении')
    }
    
    const manageSessions = () => {
      alert('Управление сессиями будет доступно в ближайшем обновлении')
    }
    
    const twoFactorAuth = () => {
      alert('Двухфакторная аутентификация будет доступна в ближайшем обновлении')
    }
    
    return {
      activeSection,
      sections,
      themes,
      fontSizes,
      languages,
      theme,
      fontSize,
      language,
      notifications,
      privacy,
      setTheme,
      setFontSize,
      setLanguage,
      saveNotificationSettings,
      savePrivacySettings,
      changePassword,
      manageSessions,
      twoFactorAuth
    }
  }
})
</script>


<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.page-header {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Container */
.settings-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1rem;
  max-width: 1400px;
}

/* Sidebar */
.settings-sidebar {
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  height: fit-content;
  position: sticky;
  top: 1.5rem;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.settings-nav .nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
  text-align: left;
}

.settings-nav .nav-item:hover {
  background: #f0f7ff;
  color: #1E6BFF;
}

.settings-nav .nav-item.active {
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  color: white;
}

.settings-nav .nav-item i {
  width: 20px;
  text-align: center;
}

/* Content */
.settings-content {
  min-height: 500px;
}

.settings-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-header i {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E6BFF;
  font-size: 1.25rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.section-header p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Cards */
.settings-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 1rem;
}

.settings-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 1.25rem 0;
}

/* Theme Selector */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.theme-option {
  position: relative;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option:hover {
  border-color: #1E6BFF;
}

.theme-option.active {
  border-color: #1E6BFF;
  background: #f0f7ff;
}

.theme-preview {
  display: flex;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.theme-preview.light {
  background: #f8fafc;
}

.theme-preview.light .preview-sidebar {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
}

.theme-preview.light .preview-header {
  background: #ffffff;
}

.theme-preview.light .preview-card {
  background: #ffffff;
}

.theme-preview.dark {
  background: #1a1a2e;
}

.theme-preview.dark .preview-sidebar {
  background: #252540;
}

.theme-preview.dark .preview-header {
  background: #252540;
}

.theme-preview.dark .preview-card {
  background: #252540;
}

.theme-preview.auto {
  background: linear-gradient(135deg, #f8fafc 50%, #1a1a2e 50%);
}

.theme-preview.auto .preview-sidebar {
  background: linear-gradient(180deg, #ffffff 50%, #252540 50%);
}

.preview-sidebar {
  width: 30%;
}

.preview-content {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-header {
  height: 20%;
  border-radius: 4px;
}

.preview-cards {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}

.preview-card {
  flex: 1;
  border-radius: 4px;
}

.theme-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
}

.check-icon {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: #1E6BFF;
  font-size: 1.125rem;
}

/* Font Size Selector */
.font-size-selector {
  display: flex;
  gap: 1rem;
}

.size-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.size-option:hover {
  border-color: #1E6BFF;
}

.size-option.active {
  border-color: #1E6BFF;
  background: #f0f7ff;
}

.size-option span:first-child {
  font-weight: 600;
  color: #1a1a2e;
}

.size-label {
  font-size: 0.75rem;
  color: #64748b;
}

/* Setting Rows */
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.setting-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-row:first-child {
  padding-top: 0;
}

.setting-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.setting-info p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Select Input */
.select-input {
  padding: 0.625rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  color: #1a1a2e;
  background: white;
  cursor: pointer;
  min-width: 180px;
}

.select-input:focus {
  outline: none;
  border-color: #1E6BFF;
}

/* Language Grid */
.language-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.language-option:hover {
  border-color: #1E6BFF;
}

.language-option.active {
  border-color: #1E6BFF;
  background: #f0f7ff;
}

.lang-flag {
  font-size: 1.5rem;
}

.lang-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1a1a2e;
}

.language-option i {
  margin-left: auto;
  color: #1E6BFF;
}

/* Security Items */
.security-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin: -0.5rem;
  margin-bottom: 0.5rem;
}

.security-item:hover {
  background: #f8fafc;
}

.security-item:last-child {
  margin-bottom: -0.5rem;
}

.security-icon {
  width: 44px;
  height: 44px;
  background: #f0f7ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E6BFF;
  font-size: 1.125rem;
}

.security-info {
  flex: 1;
}

.security-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.security-info p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.security-item > i {
  color: #94a3b8;
}

.security-badge {
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #d97706;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* About Card */
.about-card {
  text-align: center;
}

.app-info {
  margin-bottom: 2rem;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.app-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.app-version {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
}

.about-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.about-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #f8fafc;
  border-radius: 10px;
  color: #475569;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.about-link:hover {
  background: #f0f7ff;
  color: #1E6BFF;
}

.copyright {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .settings-container {
    grid-template-columns: 220px 1fr;
  }
  
  .theme-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .language-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
  
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .settings-sidebar {
    position: static;
    margin-bottom: 1rem;
  }
  
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .settings-nav .nav-item {
    flex-shrink: 0;
    padding: 0.75rem 1rem;
  }
  
  .settings-nav .nav-item span {
    display: none;
  }
  
  .settings-nav .nav-item i {
    margin: 0;
  }
  
  .theme-selector,
  .language-grid {
    grid-template-columns: 1fr;
  }
  
  .font-size-selector {
    flex-direction: column;
  }
  
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .select-input {
    width: 100%;
  }
  
  .page-header {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .header-left h1 {
    font-size: 1.25rem;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 0.75rem;
  }
  
  .settings-card {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .section-header {
    margin-bottom: 1rem;
  }
  
  .section-header i {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.1rem;
  }
}
</style>
