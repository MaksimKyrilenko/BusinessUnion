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
  margin: 10px 0;
}

input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  color: #2d3748;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

input::placeholder {
  color: #a0aec0;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-top: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;
}

.search-item:hover {
  background: #f8fafc;
}

.search-item:last-child {
  border-bottom: none;
}

.result-title {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
}

.result-type {
  font-size: 12px;
  color: #718096;
}

/* Стили для скроллбара */
.search-results::-webkit-scrollbar {
  width: 4px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.search-results::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 2px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style> 