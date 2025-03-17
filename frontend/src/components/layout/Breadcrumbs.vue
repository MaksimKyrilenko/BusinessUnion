<template>
  <nav class="breadcrumbs" v-if="items.length > 1">
    <ul>
      <li v-for="(item, index) in items" :key="index">
        <router-link 
          v-if="index < items.length - 1" 
          :to="item.path"
        >
          {{ item.name }}
        </router-link>
        <span v-else>{{ item.name }}</span>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumbs',
  computed: {
    items() {
      const routes = this.$route.matched.map(route => {
        return {
          name: route.name || route.path.split('/').pop(),
          path: route.path
        }
      })
      return [{ name: 'Главная', path: '/' }, ...routes]
    }
  }
}
</script>

<style scoped>
.breadcrumbs {
  margin-bottom: 20px;
  padding: 10px 0;
}

.breadcrumbs ul {
  display: flex;
  list-style: none;
  gap: 10px;
}

.breadcrumbs li:not(:last-child)::after {
  content: '>';
  margin-left: 10px;
  color: var(--text-color);
  opacity: 0.5;
}

.breadcrumbs a {
  color: var(--primary-color);
  text-decoration: none;
}
</style> 