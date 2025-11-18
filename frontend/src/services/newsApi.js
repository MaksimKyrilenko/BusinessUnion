import axios from 'axios';

const API_KEY = '7394bf15bf5b427eaaaa9d6e5b07e771';
const BASE_URL = '/news-api'; // Используем прокси для обхода CORS

// Кэш для хранения результатов запросов
const newsCache = {
  topNews: {},
  categoryNews: {},
  searchResults: {},
  
  // Время жизни кэша в миллисекундах (10 минут)
  cacheTTL: 10 * 60 * 1000
};

const newsApiService = {
  async getTopNews(category = '', sortBy = 'publishedAt', language = 'ru') {
    try {
      // Проверяем, есть ли данные в кэше
      const cacheKey = `${category}_${sortBy}_${language}`;
      const cachedData = newsCache.topNews[cacheKey];
      
      if (cachedData && (Date.now() - cachedData.timestamp) < newsCache.cacheTTL) {
        console.log('Используем кэшированные топ-новости для:', cacheKey);
        return cachedData.data;
      }
      
      let url = `${BASE_URL}/top-headlines?language=${language}&apiKey=${API_KEY}`;
      
      if (category) {
        // Преобразуем наши категории в категории News API
        const categoryMapping = {
          'business': 'business',
          'startups': 'technology',
          'investments': 'business',
          'technology': 'technology',
          'crypto': 'business'
        };
        
        if (categoryMapping[category]) {
          url += `&category=${categoryMapping[category]}`;
        }
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.articles) {
        // Преобразуем данные в наш формат
        const formattedData = response.data.articles.map((article, index) => ({
          id: index + 1,
          title: article.title,
          description: article.description || 'Нет описания',
          date: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          category: mapArticleToCategory(article),
          image: article.urlToImage || 'https://via.placeholder.com/400x300?text=No+Image',
          source: article.source.name || 'Неизвестный источник',
          views: Math.floor(Math.random() * 3000) + 100, // Генерируем случайное число просмотров
          comments: Math.floor(Math.random() * 100), // Генерируем случайное число комментариев
          url: article.url,
          relevanceScore: 1.0 // Базовая релевантность
        }));
        
        // Сохраняем в кэш
        newsCache.topNews[cacheKey] = {
          data: formattedData,
          timestamp: Date.now()
        };
        
        return formattedData;
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка при получении новостей:', error);
      throw error;
    }
  },
  
  async searchNews(query, sortBy = 'publishedAt', language = 'ru') {
    try {
      // Проверяем, есть ли данные в кэше
      const cacheKey = `${query}_${sortBy}_${language}`;
      const cachedData = newsCache.searchResults[cacheKey];
      
      if (cachedData && (Date.now() - cachedData.timestamp) < newsCache.cacheTTL) {
        console.log('Используем кэшированные результаты поиска для:', query);
        return cachedData.data;
      }
      
      const response = await axios.get(
        `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=${sortBy}&apiKey=${API_KEY}`
      );
      
      if (response.data && response.data.articles) {
        // Ограничиваем количество результатов до 30
        const formattedData = response.data.articles.slice(0, 30).map((article, index) => ({
          id: index + 1,
          title: article.title,
          description: article.description || 'Нет описания',
          date: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          category: mapArticleToCategory(article),
          image: article.urlToImage || 'https://via.placeholder.com/400x300?text=No+Image',
          source: article.source.name || 'Неизвестный источник',
          views: Math.floor(Math.random() * 3000) + 100,
          comments: Math.floor(Math.random() * 100),
          url: article.url,
          relevanceScore: 1.0
        }));
        
        // Сохраняем в кэш
        newsCache.searchResults[cacheKey] = {
          data: formattedData,
          timestamp: Date.now()
        };
        
        return formattedData;
      }
      
      return [];
    } catch (error) {
      console.error('Ошибка при поиске новостей:', error);
      throw error;
    }
  },
  
  // Получение новостей по конкретной теме для категорий
  async getNewsByTopic(topic) {
    try {
      // Проверяем, есть ли данные в кэше
      const cachedData = newsCache.categoryNews[topic];
      
      if (cachedData && (Date.now() - cachedData.timestamp) < newsCache.cacheTTL) {
        console.log('Используем кэшированные новости для категории:', topic);
        return cachedData.data;
      }
      
      // Определяем ключевые слова для каждой категории
      const topicKeywords = {
        'business': 'бизнес OR предпринимательство OR компания',
        'startups': 'стартап OR инновации OR технологический проект',
        'investments': 'инвестиции OR финансирование OR венчурный капитал',
        'technology': 'технологии OR искусственный интеллект OR цифровизация',
        'crypto': 'криптовалюта OR биткоин OR блокчейн'
      };
      
      const query = topicKeywords[topic] || topic;
      
      const response = await axios.get(
        `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=ru&sortBy=publishedAt&apiKey=${API_KEY}`
      );
      
      if (response.data && response.data.articles) {
        // Ограничиваем количество новостей до 30 для каждой категории, чтобы не перегружать интерфейс
        const formattedData = response.data.articles.slice(0, 30).map((article, index) => ({
          id: index + 1,
          title: article.title,
          description: article.description || 'Нет описания',
          date: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          category: topic, // Устанавливаем категорию из параметра
          image: article.urlToImage || 'https://via.placeholder.com/400x300?text=No+Image',
          source: article.source.name || 'Неизвестный источник',
          views: Math.floor(Math.random() * 3000) + 100,
          comments: Math.floor(Math.random() * 100),
          url: article.url,
          relevanceScore: 1.0
        }));
        
        // Сохраняем в кэш
        newsCache.categoryNews[topic] = {
          data: formattedData,
          timestamp: Date.now()
        };
        
        return formattedData;
      }
      
      return [];
    } catch (error) {
      console.error(`Ошибка при получении новостей по теме ${topic}:`, error);
      throw error;
    }
  }
};

// Функция для определения категории статьи на основе ее содержимого
function mapArticleToCategory(article) {
  const title = (article.title || '').toLowerCase();
  const description = (article.description || '').toLowerCase();
  const content = title + ' ' + description;
  
  if (content.includes('крипто') || content.includes('биткоин') || content.includes('блокчейн') || 
      content.includes('crypto') || content.includes('bitcoin') || content.includes('blockchain')) {
    return 'crypto';
  }
  
  if (content.includes('стартап') || content.includes('startup') || 
      content.includes('инновац') || content.includes('innovat')) {
    return 'startups';
  }
  
  if (content.includes('инвестиц') || content.includes('invest') || 
      content.includes('фонд') || content.includes('fund')) {
    return 'investments';
  }
  
  if (content.includes('технолог') || content.includes('tech') || 
      content.includes('ai') || content.includes('ии') || content.includes('искусственный интеллект')) {
    return 'technology';
  }
  
  return 'business'; // Категория по умолчанию
}

export default newsApiService; 