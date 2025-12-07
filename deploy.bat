@echo off
REM Скрипт для развертывания BusinessUnion на Windows

echo ================================
echo BusinessUnion Deployment Script
echo ================================
echo.

REM Проверка наличия Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker не установлен!
    echo Установите Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Проверка наличия Docker Compose
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose не установлен!
    pause
    exit /b 1
)

echo [OK] Docker и Docker Compose установлены
echo.

REM Проверка наличия .env файла
if not exist .env (
    echo [WARNING] Файл .env не найден. Создаем из примера...
    if exist env.example (
        copy env.example .env
        echo [INFO] Файл .env создан из env.example
        echo [WARNING] Отредактируйте файл .env перед продолжением!
        echo    - Установите безопасные пароли
        echo    - Укажите JWT_SECRET
        echo    - Настройте FRONTEND_URL
        pause
    ) else (
        echo [ERROR] Файл env.example не найден!
        pause
        exit /b 1
    )
) else (
    echo [OK] Файл .env найден
)

echo.

REM Создаем директории для uploads
if not exist backend\uploads\avatars mkdir backend\uploads\avatars
if not exist backend\uploads\images mkdir backend\uploads\images
if not exist backend\uploads\files mkdir backend\uploads\files

echo Сборка Docker образов...
docker compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Ошибка при сборке образов!
    pause
    exit /b 1
)

echo.
echo Запуск контейнеров...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] Ошибка при запуске контейнеров!
    pause
    exit /b 1
)

echo.
echo Ожидание запуска сервисов...
timeout /t 10 /nobreak >nul

echo.
echo ================================
echo Статус контейнеров:
echo ================================
docker compose ps

echo.
echo ================================
echo Последние логи:
echo ================================
docker compose logs --tail=20

echo.
echo ================================
echo [SUCCESS] Развертывание завершено!
echo ================================
echo.
echo Приложение доступно по адресам:
echo    Frontend: http://localhost
echo    Backend API: http://localhost:3001
echo    API Docs (Swagger): http://localhost:3001/api
echo.
echo Полезные команды:
echo    docker compose logs -f          - Просмотр логов
echo    docker compose ps               - Статус контейнеров
echo    docker compose restart          - Перезапуск
echo    docker compose stop             - Остановка
echo    docker compose down             - Остановка и удаление
echo.
echo Подробная документация: DEPLOYMENT.md
echo.
pause

