#!/bin/bash

# Скрипт восстановления из резервной копии

set -e

PROJECT_DIR="/opt/businessunion"
BACKUP_DIR="/opt/backups/businessunion"

echo "=== BusinessUnion Restore Script ==="
echo ""

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lht "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -10
    exit 1
fi

BACKUP_FILE="$1"

# Проверяем существование файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Backup file: $BACKUP_FILE"
echo ""

# Предупреждение
echo "⚠️  WARNING ⚠️"
echo "This will REPLACE the current database with the backup!"
echo "Make sure you have a recent backup before proceeding."
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Переходим в директорию проекта
cd "$PROJECT_DIR"

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

echo ""
echo "Starting restore..."

# Разархивируем если нужно
TEMP_SQL="/tmp/restore_temp.sql"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "1. Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"
else
    cp "$BACKUP_FILE" "$TEMP_SQL"
fi

# Восстанавливаем базу данных
echo "2. Restoring database..."
docker exec -i businessunion-mysql mysql \
    -u root -p"$DB_ROOT_PASSWORD" \
    "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo "   ✓ Database restored successfully!"
else
    echo "   ✗ Database restore failed!"
    rm -f "$TEMP_SQL"
    exit 1
fi

# Удаляем временный файл
rm -f "$TEMP_SQL"

# Перезапускаем backend
echo "3. Restarting backend..."
docker compose restart backend

echo ""
echo "✓ Restore completed successfully!"
echo ""
echo "Please verify that the application is working correctly."


