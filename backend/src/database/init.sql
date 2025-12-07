-- Инициализация базы данных BusinessUnion
-- Этот файл будет автоматически выполнен при первом запуске MySQL контейнера

-- Создаем базу данных если она не существует
CREATE DATABASE IF NOT EXISTS businessunion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Используем созданную базу данных
USE businessunion;

-- Устанавливаем timezone
SET time_zone = '+00:00';

-- Базовая структура будет создана через TypeORM миграции

