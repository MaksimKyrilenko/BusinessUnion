<template>
  <div class="dashboard">
    <BusinessmanDashboard v-if="userRole === 'businessman'" />
    <StartupFounderDashboard v-if="userRole === 'startup_founder'" />
    <InvestorDashboard v-if="userRole === 'investor'" />
    <CryptoTraderDashboard v-if="userRole === 'crypto_trader'" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BusinessmanDashboard from '@/components/dashboards/BusinessmanDashboard.vue'
import StartupFounderDashboard from '@/components/dashboards/StartupFounderDashboard.vue'
import InvestorDashboard from '@/components/dashboards/InvestorDashboard.vue'
import CryptoTraderDashboard from '@/components/dashboards/CryptoTraderDashboard.vue'

export default {
  name: 'Dashboard',
  components: {
    BusinessmanDashboard,
    StartupFounderDashboard,
    InvestorDashboard,
    CryptoTraderDashboard
  },
  setup() {
    const userStore = useUserStore()
    const userRole = ref('')

    onMounted(async () => {
      userRole.value = userStore.user?.role || ''
    })

    return {
      userRole
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}
</style> 