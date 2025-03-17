-- Удаляем существующие таблицы
DROP TABLE IF EXISTS profile;
DROP TABLE IF EXISTS user;

-- Создаем таблицу пользователей
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    userType ENUM('businessman', 'investor', 'crypto_trader', 'startup_founder') DEFAULT 'businessman',
    isActive BOOLEAN DEFAULT TRUE,
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lastLoginAt TIMESTAMP NULL
);

-- Создаем таблицу профилей
CREATE TABLE profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avatar VARCHAR(255),
    bio TEXT,
    company VARCHAR(255),
    position VARCHAR(255),
    website VARCHAR(255),
    socialLinks JSON,
    rating DECIMAL(3,2) DEFAULT 0,
    completedDeals INT DEFAULT 0,
    specialization JSON,
    interests JSON,
    investmentSize DECIMAL(15,2),
    userId INT UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
); 