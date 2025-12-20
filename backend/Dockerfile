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
RUN npm run build

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

# Проверяем что dist/src/main.js существует
RUN test -f dist/src/main.js || (echo "ERROR: dist/src/main.js not found!" && ls -la dist/ && ls -la dist/src/ 2>/dev/null || echo "src directory not found" && exit 1)

# Устанавливаем su-exec и curl для health check
RUN apk add --no-cache su-exec curl

# Копируем entrypoint скрипт
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Открываем порт
EXPOSE 3001

# Запускаем через entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

