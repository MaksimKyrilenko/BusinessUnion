<template>
  <div class="filter-panel">
    <div class="filter-group">
      <label>Сортировать по:</label>
      <select v-model="sortBy">
        <option value="date">Дате</option>
        <option value="name">Названию</option>
        <option value="rating">Рейтингу</option>
      </select>
    </div>

    <div class="filter-group">
      <label>Категории:</label>
      <div class="checkbox-group">
        <label v-for="category in categories" :key="category.id">
          <input 
            type="checkbox" 
            v-model="selectedCategories" 
            :value="category.id"
          />
          {{ category.name }}
        </label>
      </div>
    </div>

    <div class="filter-group">
      <label>Диапазон цен:</label>
      <div class="range-inputs">
        <input 
          type="number" 
          v-model="priceRange.min" 
          placeholder="От"
        />
        <input 
          type="number" 
          v-model="priceRange.max" 
          placeholder="До"
        />
      </div>
    </div>

    <button class="apply-filters" @click="applyFilters">
      Применить фильтры
    </button>
  </div>
</template>

<script>
export default {
  name: 'FilterPanel',
  data() {
    return {
      sortBy: 'date',
      selectedCategories: [],
      priceRange: {
        min: null,
        max: null
      }
    }
  },
  props: {
    categories: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    applyFilters() {
      this.$emit('filter', {
        sort: this.sortBy,
        categories: this.selectedCategories,
        priceRange: this.priceRange
      })
    }
  }
}
</script>

<style scoped>
.filter-panel {
  background: var(--card-background);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}

select, input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-color);
  color: var(--text-color);
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.apply-filters {
  width: 100%;
  padding: 10px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 