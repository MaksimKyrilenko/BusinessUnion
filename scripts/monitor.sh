#!/bin/bash

# Скрипт мониторинга состояния приложения

PROJECT_DIR="/opt/businessunion"

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}  BusinessUnion Monitor${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

cd "$PROJECT_DIR" 2>/dev/null || { echo "Error: Project directory not found"; exit 1; }

# 1. Статус контейнеров
echo -e "${YELLOW}[1] Container Status${NC}"
echo "----------------------------"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Использование ресурсов
echo -e "${YELLOW}[2] Resource Usage${NC}"
echo "----------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# 3. Проверка доступности сервисов
echo -e "${YELLOW}[3] Service Health${NC}"
echo "----------------------------"

# Frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|301\|302"; then
    echo -e "Frontend:  ${GREEN}✓ Available${NC}"
else
    echo -e "Frontend:  ${RED}✗ Unavailable${NC}"
fi

# Backend API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api | grep -q "200\|404"; then
    echo -e "Backend:   ${GREEN}✓ Available${NC}"
else
    echo -e "Backend:   ${RED}✗ Unavailable${NC}"
fi

# Database
if docker exec businessunion-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo -e "Database:  ${GREEN}✓ Available${NC}"
else
    echo -e "Database:  ${RED}✗ Unavailable${NC}"
fi
echo ""

# 4. Использование диска
echo -e "${YELLOW}[4] Disk Usage${NC}"
echo "----------------------------"
echo "Docker system:"
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"
echo ""
echo "Upload directory:"
du -sh backend/uploads/ 2>/dev/null || echo "N/A"
echo ""

# 5. Последние логи (ошибки)
echo -e "${YELLOW}[5] Recent Errors (last 5)${NC}"
echo "----------------------------"
docker compose logs --tail=100 2>/dev/null | grep -i "error\|exception\|fatal" | tail -5 || echo "No recent errors"
echo ""

# 6. Uptime
echo -e "${YELLOW}[6] Container Uptime${NC}"
echo "----------------------------"
docker ps --filter "name=businessunion" --format "table {{.Names}}\t{{.Status}}"
echo ""

echo -e "${BLUE}==================================${NC}"
echo "Last updated: $(date)"
echo -e "${BLUE}==================================${NC}"


