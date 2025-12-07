#!/bin/bash

# Скрипт для развертывания BusinessUnion на сервере

set -e  # Остановить выполнение при ошибке

echo "🚀 Начинаем развертывание BusinessUnion..."
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен!${NC}"
    echo "Установите Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# Проверка наличия Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен!${NC}"
    echo "Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker и Docker Compose установлены${NC}"

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Файл .env не найден. Создаем из примера...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}📝 Отредактируйте файл .env перед продолжением!${NC}"
        echo "   - Установите безопасные пароли"
        echo "   - Укажите JWT_SECRET"
        echo "   - Настройте FRONTEND_URL"
        read -p "Нажмите Enter после редактирования .env файла..."
    else
        echo -e "${RED}❌ Файл env.example не найден!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Файл .env найден${NC}"
fi

# Создаем директорию для uploads если её нет
mkdir -p backend/uploads/avatars
mkdir -p backend/uploads/images
mkdir -p backend/uploads/files

echo ""
echo "🏗️  Сборка Docker образов..."
docker compose build --no-cache

echo ""
echo "🚀 Запуск контейнеров..."
docker compose up -d

echo ""
echo "⏳ Ожидание запуска сервисов..."
sleep 10

# Проверка статуса контейнеров
echo ""
echo "📊 Статус контейнеров:"
docker compose ps

# Проверка логов
echo ""
echo "📝 Последние логи:"
docker compose logs --tail=20

echo ""
echo -e "${GREEN}✅ Развертывание завершено!${NC}"
echo ""
echo "📱 Приложение доступно по адресам:"
echo "   🌐 Frontend: http://localhost"
echo "   🔧 Backend API: http://localhost:3001"
echo "   📚 API Docs (Swagger): http://localhost:3001/api"
echo ""
echo "📋 Полезные команды:"
echo "   docker compose logs -f          # Просмотр логов"
echo "   docker compose ps               # Статус контейнеров"
echo "   docker compose restart          # Перезапуск"
echo "   docker compose stop             # Остановка"
echo "   docker compose down             # Остановка и удаление"
echo ""
echo "📖 Подробная документация: DEPLOYMENT.md"


