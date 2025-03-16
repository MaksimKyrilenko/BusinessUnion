<template>
  <div class="register-container" v-animate="'fadeIn'">
    <h2>Регистрация</h2>
    <form @submit.prevent="register" class="register-form">
      <BaseInput
        v-model="user.username"
        label="Имя пользователя"
        :error="v$.username.$errors[0]?.message"
        required
      />
      
      <BaseInput
        v-model="user.email"
        type="email"
        label="Email"
        :error="v$.email.$errors[0]?.message"
        required
      />
      
      <BaseInput
        v-model="user.password"
        type="password"
        label="Пароль"
        :error="v$.password.$errors[0]?.message"
        required
      />
      
      <BaseSelect
        v-model="user.userType"
        label="Тип пользователя"
        :options="userTypes"
        :error="v$.userType.$errors[0]?.message"
        required
      />
      
      <BaseButton 
        type="submit"
        :loading="isLoading"
      >
        Зарегистрироваться
      </BaseButton>
    </form>

    <div class="login-link">
      <p>Уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import { useUserStore } from '@/stores/user'
import { useNotification } from '@/utils/notification'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default defineComponent({
  name: 'RegisterForm',
  components: {
    BaseInput,
    BaseSelect,
    BaseButton
  },
  setup() {
    const user = reactive({
      username: '',
      email: '',
      password: '',
      userType: 'businessman'
    })
    
    const rules = {
      username: { required, minLength: minLength(3) },
      email: { required, email },
      password: { required, minLength: minLength(6) },
      userType: { required }
    }
    
    const v$ = useVuelidate(rules, user)
    const userStore = useUserStore()
    const notification = useNotification()

    return { 
      v$,
      userStore,
      notification,
      user
    }
  },
  data() {
    return {
      userTypes: [
        { value: 'businessman', label: 'Бизнесмен' },
        { value: 'investor', label: 'Инвестор' },
        { value: 'crypto_trader', label: 'Крипто-трейдер' },
        { value: 'startup_founder', label: 'Основатель стартапа' }
      ],
      isLoading: false
    }
  },
  methods: {
    async register() {
      try {
        const isValid = await this.v$.$validate()
        if (!isValid) {
          this.notification.error('Пожалуйста, заполните все поля корректно')
          return
        }

        this.isLoading = true
        await this.userStore.register(this.user)
        
        this.notification.success('Регистрация успешна!')
        this.$router.push('/dashboard')
      } catch (error) {
        this.notification.error(
          error.response?.data?.message || 'Ошибка при регистрации'
        )
      } finally {
        this.isLoading = false
      }
    }
  }
})
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--card-background);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>