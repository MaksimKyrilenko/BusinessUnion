const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },
  devServer: {
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
        logLevel: 'debug',
        onError: (err) => {
          console.log('Proxy error:', err);
        },
        onProxyReq: (proxyReq, req) => {
          console.log('Proxy request:', req.method, req.url);
        }
      },
      '/news-api': {
        target: 'https://newsapi.org/v2',
        changeOrigin: true,
        pathRewrite: {
          '^/news-api': ''
        },
        onProxyReq: (proxyReq, req) => {
          console.log('News API request:', req.method, req.url);
        }
      }
    }
  },
});