# Используем официальный образ Node.js как базовый
FROM node:18-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && \
    npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Продакшн образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки production зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && \
    npm cache clean --force

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

# Создаем директорию для uploads
RUN mkdir -p /app/uploads/avatars /app/uploads/images /app/uploads/files && \
    chown -R node:node /app/uploads

# Используем непривилегированного пользователя
USER node

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "run", "start:prod"]

