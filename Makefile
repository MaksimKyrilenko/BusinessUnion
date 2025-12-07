.PHONY: help build up down restart logs logs-backend logs-frontend logs-db ps backup restore clean

help: ## Показать эту справку
	@echo "BusinessUnion - Доступные команды:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Собрать Docker образы
	docker compose build --no-cache

up: ## Запустить все сервисы
	docker compose up -d

down: ## Остановить все сервисы
	docker compose down

restart: ## Перезапустить все сервисы
	docker compose restart

restart-backend: ## Перезапустить только backend
	docker compose restart backend

restart-frontend: ## Перезапустить только frontend
	docker compose restart frontend

logs: ## Показать логи всех сервисов
	docker compose logs -f

logs-backend: ## Показать логи backend
	docker compose logs -f backend

logs-frontend: ## Показать логи frontend
	docker compose logs -f frontend

logs-db: ## Показать логи базы данных
	docker compose logs -f mysql

ps: ## Показать статус контейнеров
	docker compose ps

shell-backend: ## Открыть shell в backend контейнере
	docker exec -it businessunion-backend sh

shell-db: ## Открыть MySQL shell
	docker exec -it businessunion-mysql mysql -u root -p

backup: ## Создать backup базы данных
	@echo "Создание backup базы данных..."
	@mkdir -p backups
	docker exec businessunion-mysql mysqldump -u root -p$$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) businessunion > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup создан в backups/"

backup-uploads: ## Создать backup файлов
	@echo "Создание backup файлов..."
	@mkdir -p backups
	tar -czf backups/uploads_$$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
	@echo "Backup файлов создан в backups/"

clean: ## Очистить неиспользуемые Docker ресурсы
	docker system prune -f
	docker volume prune -f

rebuild: down build up ## Полная пересборка и перезапуск

update: ## Обновить приложение из git
	git pull origin beta1.4
	docker compose down
	docker compose up -d --build
	@echo "Приложение обновлено!"

status: ## Показать подробный статус
	@echo "=== Статус контейнеров ==="
	@docker compose ps
	@echo ""
	@echo "=== Использование ресурсов ==="
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
	@echo ""
	@echo "=== Использование дисков ==="
	@docker system df

init: ## Первоначальная настройка
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "Файл .env создан. Отредактируйте его перед запуском!"; \
	else \
		echo ".env файл уже существует"; \
	fi
	@mkdir -p backend/uploads/avatars backend/uploads/images backend/uploads/files
	@mkdir -p backups
	@echo "Инициализация завершена!"

test: ## Запустить тесты
	npm run test:functional
	npm run test:performance

