# Используем официальный образ Node.js как базовый
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev для сборки)
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build && \
    echo "=== Build completed, checking dist structure ===" && \
    find dist -name "*.js" -type f | head -20 && \
    (test -f dist/main.js || test -f dist/src/main.js) || (echo "ERROR: main.js not found after build!" && ls -la dist/ && exit 1)

# Продакшн образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для установки production зависимостей
COPY package*.json ./

# Устанавливаем production зависимости + ts-node для миграций
RUN npm install --omit=dev --legacy-peer-deps && \
    npm install --save-dev ts-node tsconfig-paths --legacy-peer-deps && \
    npm cache clean --force

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.build.json ./tsconfig.build.json

# Проверяем что dist/main.js существует
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found!" && ls -la dist/ && exit 1)

# Создаем директорию для uploads
RUN mkdir -p /app/uploads/avatars /app/uploads/images /app/uploads/files && \
    chown -R node:node /app/uploads

# Используем непривилегированного пользователя
USER node

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["npm", "run", "start:prod"]

