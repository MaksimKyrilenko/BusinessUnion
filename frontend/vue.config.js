module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Сервер Nest.js
        changeOrigin: true,
        pathRewrite: { '^/api': '' }, // Убирает /api из запроса
      },
    },
  },
};