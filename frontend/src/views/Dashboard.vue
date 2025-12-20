<template>
  <div class="dashboard">
    <div class="dashboard-bg"></div>

    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-main">
          <div class="header-left">
            <div class="welcome-badge"><i class="fas fa-chart-line"></i> Панель управления</div>
            <h1>Добро пожаловать, {{ userStore.userName }}!</h1>
            <p>Управляйте своим бизнесом эффективно</p>
          </div>
          <div class="header-stats">
            <div class="h-stat"><div class="h-stat-icon"><i class="fas fa-envelope"></i></div><div><span class="h-stat-val">{{ messageStats.personal + messageStats.group }}</span><span class="h-stat-lbl">Сообщений</span></div></div>
            <div class="h-stat"><div class="h-stat-icon"><i class="fas fa-users"></i></div><div><span class="h-stat-val">{{ communityStats.totalMembers }}</span><span class="h-stat-lbl">Участников</span></div></div>
            <div class="h-stat"><div class="h-stat-icon"><i class="fas fa-graduation-cap"></i></div><div><span class="h-stat-val">{{ recommendedCourses.length }}</span><span class="h-stat-lbl">Курсов</span></div></div>
          </div>
        </div>
        <div class="header-date"><i class="fas fa-calendar"></i> {{ new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }) }}</div>
      </header>

      <!-- Row 1: Rates + Messages + Community -->
      <div class="grid-row row-1">
        <!-- Rates - Small -->
        <div class="card card-rates">
          <div class="card-head"><div class="card-title"><i class="fas fa-chart-bar"></i> Курсы валют</div><button class="icon-btn" @click="isSelectOpen = !isSelectOpen"><i class="fas fa-cog"></i></button></div>
          <div v-if="isSelectOpen" class="dropdown"><input v-model="currencySearch" placeholder="Поиск..." class="dropdown-search"><div class="dropdown-list"><label v-for="c in filteredCurrencies" :key="c.code"><input type="checkbox" :value="c.code" v-model="selectedCurrencies"> {{ c.code }}</label></div></div>
          <div class="card-body">
            <div v-if="!loading.rates" class="rates-grid">
              <div v-for="cur in selectedCurrencies.slice(0, 5)" :key="cur" class="rate-box">
                <span class="rate-code">{{ cur }}</span>
                <span class="rate-val">{{ formatCurrencyRate(exchangeRates[cur]?.rate) }}</span>
                <span class="rate-chg" :class="{ up: exchangeRates[cur]?.change > 0, down: exchangeRates[cur]?.change < 0 }">{{ formatChange(exchangeRates[cur]?.change) }}</span>
              </div>
            </div>
            <div v-else class="loader"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>

        <!-- Messages - Medium -->
        <div class="card card-messages">
          <div class="card-head"><div class="card-title"><i class="fas fa-comments"></i> Сообщения</div><router-link to="/messenger" class="card-link">Все →</router-link></div>
          <div class="card-body">
            <div v-if="!loading.messages">
              <div class="msg-stats">
                <div class="msg-stat"><div class="msg-icon personal"><i class="fas fa-user"></i></div><div><span class="msg-num">{{ messageStats.personal }}</span><span class="msg-lbl">Личные</span></div></div>
                <div class="msg-stat"><div class="msg-icon group"><i class="fas fa-users"></i></div><div><span class="msg-num">{{ messageStats.group }}</span><span class="msg-lbl">Групповые</span></div></div>
              </div>
              <div class="msg-list">
                <div v-for="m in recentMessages.slice(0, 3)" :key="m.id" class="msg-item" @click="goToChat(m.chatId)">
                  <div class="msg-avatar">{{ m.senderName?.charAt(0) || '?' }}</div>
                  <div class="msg-info"><span class="msg-name">{{ m.senderName }}</span><span class="msg-text">{{ truncateText(m.content, 30) }}</span></div>
                  <span class="msg-time">{{ formatMessageTime(m.timestamp) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="loader"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>

        <!-- Community - Medium -->
        <div class="card card-community">
          <div class="card-head"><div class="card-title"><i class="fas fa-globe"></i> Сообщество</div><router-link to="/community" class="card-link">Перейти →</router-link></div>
          <div class="card-body">
            <div v-if="!loading.community">
              <div class="comm-stats">
                <div class="comm-stat"><span class="comm-val">{{ communityStats.totalMembers }}</span><span class="comm-lbl">Участников</span></div>
                <div class="comm-stat"><span class="comm-val">{{ communityStats.activeDiscussions }}</span><span class="comm-lbl">Обсуждений</span></div>
                <div class="comm-stat"><span class="comm-val">{{ communityStats.yourContributions }}</span><span class="comm-lbl">Публикаций</span></div>
              </div>
              <div class="activity-list">
                <div v-for="a in (communityStats.activities || []).slice(0, 2)" :key="a.id" class="activity-item" @click="goToCommunityActivity(a)">
                  <div class="activity-avatar">{{ getInitials(a.userName) }}</div>
                  <div class="activity-info"><span class="activity-name">{{ a.userName }}</span> <span class="activity-action">{{ a.type === 'post' ? 'создал пост' : 'лайк' }}</span></div>
                  <span class="activity-time">{{ formatActivityTime(a.timestamp) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="loader"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>
      </div>

      <!-- Row 2: Education + Analytics + News -->
      <div class="grid-row row-2">
        <!-- Education - Large -->
        <div class="card card-education">
          <div class="card-head"><div class="card-title"><i class="fas fa-book-open"></i> Образование</div><router-link to="/education" class="card-link">Все курсы →</router-link></div>
          <div class="card-body">
            <div v-if="!loading.education && recommendedCourses.length" class="courses-list">
              <div v-for="c in recommendedCourses.slice(0, 3)" :key="c.id" class="course-item" @click="goToCourse(c.url)">
                <div class="course-icon">
                  <i v-if="c.icon && c.icon.startsWith('fa')" :class="c.icon"></i>
                  <span v-else>{{ c.icon || '📚' }}</span>
                </div>
                <div class="course-info">
                  <h4>{{ c.title }}</h4>
                  <p>{{ truncateText(c.description, 60) }}</p>
                  <div class="course-meta"><span class="course-tag">{{ getPlatformName(c.platform) }}</span><span v-if="c.duration"><i class="fas fa-clock"></i> {{ c.duration }}</span></div>
                </div>
              </div>
            </div>
            <div v-else-if="loading.education" class="loader"><i class="fas fa-spinner fa-spin"></i></div>
            <div v-else class="empty"><i class="fas fa-book"></i> Курсы не найдены</div>
          </div>
        </div>

        <!-- Analytics - Medium -->
        <div class="card card-analytics">
          <div class="card-head"><div class="card-title"><i class="fas fa-chart-pie"></i> Аналитика рынка</div><router-link to="/market-analytics" class="card-link">Подробнее →</router-link></div>
          <div class="card-body">
            <div v-if="!loading.analytics && marketTrends.length" class="trends-grid">
              <div v-for="t in marketTrends.slice(0, 4)" :key="t.id" class="trend-item">
                <div class="trend-head"><span class="trend-cat">{{ t.category }}</span><span class="trend-chg" :class="t.change >= 0 ? 'up' : 'down'">{{ t.change > 0 ? '+' : '' }}{{ t.change }}%</span></div>
                <h4>{{ t.title }}</h4>
                <p>{{ truncateText(t.description, 50) }}</p>
              </div>
            </div>
            <div v-else-if="loading.analytics" class="loader"><i class="fas fa-spinner fa-spin"></i></div>
            <div v-else class="empty"><i class="fas fa-chart-line"></i> Загрузка данных</div>
          </div>
        </div>

        <!-- News - Medium -->
        <div class="card card-news">
          <div class="card-head"><div class="card-title"><i class="fas fa-newspaper"></i> Новости</div><router-link to="/news" class="card-link">Все новости →</router-link></div>
          <div class="card-body">
            <div v-if="!loading.news && recentNews.length" class="news-list">
              <div v-for="n in recentNews.slice(0, 3)" :key="n.id" class="news-item" @click="goToNews(n.url)">
                <span class="news-cat">{{ n.category }}</span>
                <h4>{{ n.title }}</h4>
                <p>{{ truncateText(n.description, 60) }}</p>
                <span class="news-date">{{ formatDate(n.date) }}</span>
              </div>
            </div>
            <div v-else-if="loading.news" class="loader"><i class="fas fa-spinner fa-spin"></i></div>
            <div v-else class="empty"><i class="fas fa-newspaper"></i> Новостей нет</div>
          </div>
        </div>
      </div>

      <BusinessmanDashboard v-if="userRole === 'businessman'" />
      <StartupFounderDashboard v-if="userRole === 'startup_founder'" />
      <InvestorDashboard v-if="userRole === 'investor'" />
      <CryptoTraderDashboard v-if="userRole === 'crypto_trader'" />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import BusinessmanDashboard from '@/components/dashboards/BusinessmanDashboard.vue'
import StartupFounderDashboard from '@/components/dashboards/StartupFounderDashboard.vue'
import InvestorDashboard from '@/components/dashboards/InvestorDashboard.vue'
import CryptoTraderDashboard from '@/components/dashboards/CryptoTraderDashboard.vue'

export default defineComponent({
  name: 'Dashboard',
  components: { BusinessmanDashboard, StartupFounderDashboard, InvestorDashboard, CryptoTraderDashboard },
  setup() {
    const userStore = useUserStore()
    const userRole = ref('')
    const isSelectOpen = ref(false)
    const currencySearch = ref('')
    const selectedCurrencies = ref(['USD', 'EUR', 'RUB', 'GBP', 'CNY'])
    const availableCurrencies = ref([
      { code: 'USD', name: 'Доллар США' }, { code: 'EUR', name: 'Евро' }, { code: 'RUB', name: 'Рубль' },
      { code: 'GBP', name: 'Фунт' }, { code: 'CNY', name: 'Юань' }, { code: 'JPY', name: 'Иена' }
    ])
    const filteredCurrencies = computed(() => availableCurrencies.value.filter(c => c.name.toLowerCase().includes(currencySearch.value.toLowerCase()) || c.code.toLowerCase().includes(currencySearch.value.toLowerCase())))
    const exchangeRates = ref({})
    const messageStats = ref({ personal: 0, group: 0, notifications: 0 })
    const recentMessages = ref([])
    const communityStats = ref({ totalMembers: 0, activeDiscussions: 0, yourContributions: 0, activities: [] })
    const recommendedCourses = ref([])
    const marketTrends = ref([])
    const recentNews = ref([])
    const loading = ref({ rates: false, messages: false, community: false, education: false, analytics: false, news: false })

    const fetchExchangeRates = async () => {
      loading.value.rates = true
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/dashboard/exchange-rates', { headers: { 'Authorization': `Bearer ${token}` } })
        if (res.ok) exchangeRates.value = await res.json()
        else exchangeRates.value = { USD: { rate: 91.25, change: 0.5 }, EUR: { rate: 98.75, change: -0.3 }, GBP: { rate: 115.50, change: 0.2 }, CNY: { rate: 12.65, change: 0.1 }, RUB: { rate: 1, change: 0 } }
      } catch { exchangeRates.value = { USD: { rate: 91.25, change: 0.5 }, EUR: { rate: 98.75, change: -0.3 }, GBP: { rate: 115.50, change: 0.2 }, CNY: { rate: 12.65, change: 0.1 }, RUB: { rate: 1, change: 0 } } }
      finally { loading.value.rates = false }
    }
    const fetchMessageStats = async () => {
      loading.value.messages = true
      try {
        const token = localStorage.getItem('token')
        const [s, m] = await Promise.all([fetch('/api/dashboard/message-stats', { headers: { 'Authorization': `Bearer ${token}` } }), fetch('/api/dashboard/recent-messages', { headers: { 'Authorization': `Bearer ${token}` } })])
        if (s.ok) messageStats.value = await s.json()
        if (m.ok) recentMessages.value = await m.json() || []
      } catch (e) { console.error(e) }
      finally { loading.value.messages = false }
    }
    const fetchCommunityStats = async () => {
      loading.value.community = true
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/dashboard/community-stats', { headers: { 'Authorization': `Bearer ${token}` } })
        if (res.ok) communityStats.value = await res.json()
      } catch (e) { console.error(e) }
      finally { loading.value.community = false }
    }
    const fetchEducationData = async () => {
      loading.value.education = true
      try {
        const token = localStorage.getItem('token')
        const [c, t] = await Promise.all([fetch('/api/dashboard/recommended-courses', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false })), fetch('/api/dashboard/market-trends', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => ({ ok: false }))])
        if (c.ok) recommendedCourses.value = await c.json() || []
        if (t.ok) marketTrends.value = await t.json() || []
      } catch { recommendedCourses.value = []; marketTrends.value = [] }
      finally { loading.value.education = false }
    }
    const fetchAnalytics = async () => { loading.value.analytics = true; try { await fetch('/api/dashboard/analytics', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }) } catch {} finally { loading.value.analytics = false } }
    const fetchRecentNews = async () => {
      loading.value.news = true
      try {
        const api = (await import('@/services/newsApi')).default
        const d = await api.getTopNews('', 'publishedAt', 'ru')
        if (d?.length) { recentNews.value = d.slice(0, 5).map((a, i) => ({ id: i, category: a.category || 'Новости', title: a.title, description: a.description, date: a.publishedAt || new Date(), url: a.url || '/news' })); return }
        const res = await fetch('/api/dashboard/news', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        if (res.ok) recentNews.value = (await res.json() || []).map(n => ({ ...n, url: n.url || '/news' }))
      } catch {} finally { loading.value.news = false }
    }

    const formatDate = d => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
    const formatCurrencyRate = r => r ? (r >= 1 ? r.toFixed(2) : r.toFixed(4)) : '—'
    const formatChange = c => c != null ? `${c > 0 ? '↑' : c < 0 ? '↓' : ''}${Math.abs(c).toFixed(2)}%` : '—'
    const formatMessageTime = d => { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d)) / 60000); return m < 60 ? `${m} мин` : m < 1440 ? `${Math.floor(m/60)} ч` : `${Math.floor(m/1440)} дн` }
    const truncateText = (t, l) => t?.length > l ? t.substring(0, l) + '...' : t || ''
    const goToChat = id => id && (window.location.href = `/messenger?chat=${id}`)
    const goToNews = url => url?.startsWith('http') ? window.open(url, '_blank') : window.location.href = url || '/news'
    const goToCourse = url => url?.startsWith('http') ? window.open(url, '_blank') : window.location.href = url || '/education'
    const getPlatformName = p => ({ coursera: 'Coursera', udemy: 'Udemy', skillbox: 'Skillbox' }[p] || p || '')
    const getInitials = n => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '?'
    const formatActivityTime = formatMessageTime
    const goToCommunityActivity = a => window.location.href = a.communityId ? `/community/${a.communityId}` : '/community'

    onMounted(() => { userRole.value = userStore.user?.role || ''; Promise.all([fetchExchangeRates(), fetchMessageStats(), fetchCommunityStats(), fetchEducationData(), fetchAnalytics(), fetchRecentNews()]) })

    return { userRole, userStore, isSelectOpen, currencySearch, selectedCurrencies, availableCurrencies, filteredCurrencies, exchangeRates, messageStats, recentMessages, communityStats, recommendedCourses, marketTrends, recentNews, loading, formatDate, formatMessageTime, formatCurrencyRate, formatChange, truncateText, goToChat, goToNews, goToCourse, getPlatformName, getInitials, formatActivityTime, goToCommunityActivity }
  }
})
</script>

<style scoped>
.dashboard { min-height: 100vh; background: #f1f5f9; position: relative; }
.dashboard-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(circle at 1px 1px, rgba(37,99,235,0.02) 1px, transparent 1px); background-size: 20px 20px; }
.dashboard-container { position: relative; z-index: 1; padding: 1rem; }

/* Header */
.dashboard-header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1rem; color: #fff; box-shadow: 0 8px 30px rgba(37,99,235,0.2); }
.header-main { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
.welcome-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.9rem; background: rgba(255,255,255,0.18); border-radius: 20px; font-size: 0.8rem; margin-bottom: 0.6rem; backdrop-filter: blur(10px); }
.dashboard-header h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.35rem; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.header-left p { opacity: 0.9; font-size: 0.95rem; margin: 0; }
.header-stats { display: flex; gap: 0.875rem; }
.h-stat { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.15); border-radius: 12px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
.h-stat-icon { width: 42px; height: 42px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
.h-stat-val { display: block; font-size: 1.25rem; font-weight: 700; line-height: 1; }
.h-stat-lbl { display: block; font-size: 0.75rem; opacity: 0.85; margin-top: 0.15rem; }
.header-date { margin-top: 1rem; font-size: 0.85rem; opacity: 0.9; display: flex; align-items: center; gap: 0.5rem; text-transform: capitalize; }

/* Grid Rows */
.grid-row { display: grid; gap: 1rem; margin-bottom: 1rem; }
.row-1 { grid-template-columns: 280px 1fr 1fr; grid-template-rows: auto; }
.row-2 { grid-template-columns: 1fr 1fr 1fr; }
.row-1 > .card, .row-2 > .card { min-height: 280px; }

/* Cards */
.card { background: #fff; border-radius: 14px; border: none; overflow: hidden; transition: all 0.25s ease; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.06); transform: translateY(-2px); }
.card-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; background: #fff; flex-shrink: 0; }
.card-title { display: flex; align-items: center; gap: 0.6rem; font-size: 0.95rem; font-weight: 600; color: #1e293b; }
.card-title i { color: #2563eb; font-size: 1rem; width: 20px; text-align: center; }
.card-link { font-size: 0.8rem; color: #2563eb; text-decoration: none; font-weight: 500; padding: 0.35rem 0.75rem; background: #eff6ff; border-radius: 6px; transition: all 0.2s; }
.card-link:hover { background: #dbeafe; }
.card-body { padding: 1rem 1.25rem; flex: 1; display: flex; flex-direction: column; }
.icon-btn { width: 32px; height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; color: #64748b; cursor: pointer; transition: all 0.2s; }
.icon-btn:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

/* Dropdown */
.dropdown { position: absolute; top: 100%; right: 1rem; width: 180px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 50; padding: 0.5rem; }
.dropdown-search { width: 100%; padding: 0.4rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; margin-bottom: 0.4rem; }
.dropdown-list { max-height: 150px; overflow-y: auto; }
.dropdown-list label { display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem; font-size: 0.8rem; cursor: pointer; border-radius: 4px; }
.dropdown-list label:hover { background: #f1f5f9; }

/* Rates */
.card-rates { position: relative; }
.card-rates .card-body { justify-content: center; }
.rates-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.rate-box { padding: 1rem 0.75rem; background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); border-radius: 10px; text-align: center; border: 1px solid #e2e8f0; transition: all 0.2s; }
.rate-box:hover { border-color: #2563eb; background: #fff; }
.rate-code { display: block; font-size: 0.75rem; font-weight: 700; color: #2563eb; margin-bottom: 0.4rem; letter-spacing: 0.5px; }
.rate-val { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
.rate-chg { display: inline-flex; align-items: center; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px; }
.rate-chg.up { color: #059669; background: #d1fae5; }
.rate-chg.down { color: #dc2626; background: #fee2e2; }

/* Messages */
.msg-stats { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.msg-stat { flex: 1; display: flex; align-items: center; gap: 0.6rem; padding: 0.875rem; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
.msg-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.msg-icon.personal { background: #dbeafe; color: #2563eb; }
.msg-icon.group { background: #dcfce7; color: #16a34a; }
.msg-num { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; line-height: 1; }
.msg-lbl { display: block; font-size: 0.7rem; color: #64748b; margin-top: 0.15rem; }
.msg-list { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.msg-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 10px; cursor: pointer; transition: all 0.2s; background: #f8fafc; }
.msg-item:hover { background: #eff6ff; }
.msg-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
.msg-info { flex: 1; min-width: 0; }
.msg-name { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 0.15rem; }
.msg-text { display: block; font-size: 0.75rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.msg-time { font-size: 0.7rem; color: #94a3b8; flex-shrink: 0; background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; }

/* Community */
.comm-stats { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.comm-stat { flex: 1; text-align: center; padding: 1rem 0.75rem; background: linear-gradient(135deg, #f8fafc 0%, #fff 100%); border-radius: 10px; border: 1px solid #e2e8f0; }
.comm-val { display: block; font-size: 1.5rem; font-weight: 700; color: #2563eb; line-height: 1; margin-bottom: 0.25rem; }
.comm-lbl { display: block; font-size: 0.7rem; color: #64748b; }
.activity-list { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 10px; cursor: pointer; background: #f8fafc; transition: all 0.2s; }
.activity-item:hover { background: #eff6ff; }
.activity-avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #818cf8, #6366f1); color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
.activity-info { flex: 1; font-size: 0.8rem; }
.activity-name { font-weight: 600; color: #1e293b; }
.activity-action { color: #64748b; margin-left: 0.25rem; }
.activity-time { font-size: 0.7rem; color: #94a3b8; background: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; }

/* Education */
.courses-list { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
.course-item { display: flex; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; cursor: pointer; border: 1px solid #e2e8f0; transition: all 0.2s; }
.course-item:hover { background: #fff; border-color: #2563eb; box-shadow: 0 4px 15px rgba(37,99,235,0.1); transform: translateX(4px); }
.course-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #dbeafe, #eff6ff); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; color: #2563eb; }
.course-icon i { font-size: 1.25rem; }
.course-icon span { font-size: 1.5rem; }
.course-info { flex: 1; min-width: 0; overflow: hidden; }
.course-info h4 { font-size: 0.9rem; font-weight: 600; color: #1e293b; margin: 0 0 0.35rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.course-info p { font-size: 0.8rem; color: #64748b; margin: 0 0 0.5rem; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.course-meta { display: flex; gap: 0.75rem; font-size: 0.7rem; color: #94a3b8; align-items: center; }
.course-tag { background: #2563eb; color: #fff; padding: 0.25rem 0.6rem; border-radius: 5px; font-weight: 600; font-size: 0.65rem; }

/* Analytics */
.trends-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; flex: 1; align-content: start; }
.trend-item { padding: 1rem; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; transition: all 0.2s; }
.trend-item:hover { background: #fff; border-color: #cbd5e1; }
.trend-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.trend-cat { font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
.trend-chg { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; }
.trend-chg.up { color: #059669; background: #d1fae5; }
.trend-chg.down { color: #dc2626; background: #fee2e2; }
.trend-item h4 { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin: 0 0 0.35rem; line-height: 1.3; }
.trend-item p { font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4; }

/* News */
.news-list { display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
.news-item { padding: 1rem; background: #f8fafc; border-radius: 10px; cursor: pointer; border: 1px solid #e2e8f0; transition: all 0.2s; }
.news-item:hover { background: #fff; border-color: #2563eb; transform: translateX(4px); }
.news-cat { display: inline-block; font-size: 0.65rem; color: #fff; background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 0.25rem 0.6rem; border-radius: 5px; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
.news-item h4 { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin: 0 0 0.35rem; line-height: 1.3; }
.news-item p { font-size: 0.75rem; color: #64748b; margin: 0 0 0.5rem; line-height: 1.4; }
.news-date { font-size: 0.7rem; color: #94a3b8; display: flex; align-items: center; gap: 0.3rem; }
.news-date::before { content: '📅'; font-size: 0.8rem; }

/* States */
.loader { display: flex; align-items: center; justify-content: center; flex: 1; min-height: 150px; color: #2563eb; font-size: 1.5rem; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; min-height: 150px; color: #94a3b8; font-size: 0.85rem; gap: 0.5rem; text-align: center; }
.empty i { font-size: 2rem; opacity: 0.4; color: #cbd5e1; }

/* Responsive */
@media (max-width: 1200px) {
  .row-1 { grid-template-columns: 250px 1fr 1fr; }
}

@media (max-width: 1000px) {
  .row-1, .row-2 { grid-template-columns: 1fr 1fr; }
  .card-rates { grid-column: span 2; }
  .rates-grid { grid-template-columns: repeat(5, 1fr); }
}

@media (max-width: 700px) {
  .dashboard-container { padding: 0.75rem; padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
  .dashboard-header { padding: 1rem; border-radius: 12px; }
  .header-main { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .header-stats { width: 100%; }
  .dashboard-header h1 { font-size: 1.25rem; }
  .row-1, .row-2 { grid-template-columns: 1fr; }
  .card-rates { grid-column: span 1; }
  .rates-grid { grid-template-columns: repeat(3, 1fr); }
  .trends-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .dashboard-container { padding: 0.5rem; }
  .header-stats { flex-wrap: wrap; gap: 0.5rem; }
  .h-stat { flex: 1; min-width: 90px; }
  .rates-grid { grid-template-columns: repeat(2, 1fr); }
  .msg-stats, .comm-stats { flex-direction: column; }
}
</style>
