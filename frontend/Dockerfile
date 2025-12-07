# Стадия сборки
FROM node:18-alpine AS builder

# Принимаем аргумент сборки для API URL (должен быть пустым для production!)
ARG VUE_APP_API_URL=
ENV VUE_APP_API_URL=${VUE_APP_API_URL}

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install && \
    npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение для продакшна
RUN npm run build

# Продакшн образ с nginx
FROM nginx:alpine

# Копируем собранное приложение в nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

