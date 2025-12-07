#!/bin/bash

# Скрипт автоматического резервного копирования

set -e

# Директории
BACKUP_DIR="/opt/backups/businessunion"
PROJECT_DIR="/opt/businessunion"
RETENTION_DAYS=7

# Создаем директорию для backups если её нет
mkdir -p "$BACKUP_DIR"

# Имя файла с текущей датой
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
FILES_BACKUP="$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"

echo "=== BusinessUnion Backup Script ==="
echo "Timestamp: $TIMESTAMP"
echo ""

# Переходим в директорию проекта
cd "$PROJECT_DIR"

# Загружаем переменные окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found!"
    exit 1
fi

# 1. Backup базы данных
echo "1. Creating database backup..."
docker exec businessunion-mysql mysqldump \
    -u root -p"$DB_ROOT_PASSWORD" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    "$DB_NAME" > "$DB_BACKUP"

if [ $? -eq 0 ]; then
    echo "   ✓ Database backup created: $DB_BACKUP"
    # Сжимаем backup
    gzip "$DB_BACKUP"
    echo "   ✓ Backup compressed: ${DB_BACKUP}.gz"
else
    echo "   ✗ Database backup failed!"
    exit 1
fi

# 2. Backup файлов uploads
echo "2. Creating uploads backup..."
tar -czf "$FILES_BACKUP" -C "$PROJECT_DIR" backend/uploads/

if [ $? -eq 0 ]; then
    echo "   ✓ Uploads backup created: $FILES_BACKUP"
else
    echo "   ✗ Uploads backup failed!"
fi

# 3. Удаляем старые backups (старше RETENTION_DAYS дней)
echo "3. Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "   ✓ Old backups cleaned"

# 4. Показываем статистику
echo ""
echo "=== Backup Summary ==="
echo "Database backup size: $(du -h ${DB_BACKUP}.gz | cut -f1)"
echo "Uploads backup size: $(du -h $FILES_BACKUP | cut -f1)"
echo "Total backups in directory: $(ls -1 $BACKUP_DIR | wc -l)"
echo "Disk usage in backup directory: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "✓ Backup completed successfully!"

# Логирование
echo "$(date): Backup completed successfully" >> "$BACKUP_DIR/backup.log"

