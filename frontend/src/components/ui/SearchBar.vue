<template>
  <div class="search-container">
    <input 
      type="text" 
      v-model="searchQuery"
      :placeholder="placeholder"
      @input="debounceSearch"
    />
    <div class="search-results" v-if="showResults">
      <div 
        v-for="result in results" 
        :key="result.id"
        class="search-item"
        @click="selectResult(result)"
      >
        <div class="result-title">{{ result.title }}</div>
        <div class="result-type">{{ result.type }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash/debounce'
import api from '@/axios'

export default {
  name: 'SearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Поиск...'
    }
  },
  setup() {
    const searchQuery = ref('')
    const results = ref([])
    const showResults = ref(false)

    const search = async (query) => {
      if (!query.trim()) {
        results.value = []
        return
      }

      try {
        const response = await api.get(`/search?q=${query}`)
        results.value = response.data
      } catch (error) {
        console.error('Ошибка поиска:', error)
      }
    }

    const debounceSearch = debounce(() => {
      search(searchQuery.value)
    }, 300)

    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        showResults.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      searchQuery,
      results,
      showResults,
      debounceSearch
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-background);
  color: var(--text-color);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.search-item {
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}

.search-item:hover {
  background: var(--background-color);
}

.result-title {
  font-weight: 500;
}

.result-type {
  font-size: 0.8em;
  color: var(--text-color);
  opacity: 0.7;
}
</style> 