-- Скрипт для заполнения базы данных тестовыми данными
-- Использование: docker exec -i businessunion-mysql mysql -u root -prootpassword businessunion < backend/seed-data.sql

-- Получаем ID первого пользователя
SET @authorId = (SELECT id FROM user LIMIT 1);

-- Если пользователей нет, выводим ошибку
SELECT IF(@authorId IS NULL, 'ОШИБКА: Сначала зарегистрируйте пользователя!', CONCAT('Используем пользователя ID: ', @authorId)) AS status;

-- Создаём стартапы (только если есть пользователь)
INSERT INTO project (title, description, investmentNeeded, investmentCollected, expectedRoi, status, stage, location, categoryId, category, additionalInfo, authorId)
SELECT * FROM (
  SELECT 'EcoDelivery' as title, 'Экологичная служба доставки на электротранспорте. Мы используем электровелосипеды и электроскутеры для доставки товаров в городской черте.' as description, 5000000 as investmentNeeded, 1200000 as investmentCollected, 25 as expectedRoi, 'active' as status, 'mvp' as stage, 'Москва' as location, 1 as categoryId, '{"id":1,"name":"Логистика"}' as category, '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":8}' as additionalInfo, @authorId as authorId
  UNION SELECT 'MedTech AI', 'Платформа для диагностики заболеваний с использованием искусственного интеллекта.', 15000000, 3500000, 40, 'active', 'growth', 'Санкт-Петербург', 2, '{"id":2,"name":"Медицина"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":15}', @authorId
  UNION SELECT 'FarmBot', 'Автоматизированная система для умного земледелия. Роботы и дроны для мониторинга посевов.', 25000000, 8000000, 35, 'active', 'scaling', 'Краснодар', 3, '{"id":3,"name":"Агротех"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":22}', @authorId
  UNION SELECT 'EduPlay', 'Образовательная платформа с геймификацией для детей 6-14 лет.', 8000000, 2000000, 30, 'active', 'mvp', 'Казань', 4, '{"id":4,"name":"EdTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":10}', @authorId
  UNION SELECT 'CryptoWallet Pro', 'Безопасный мультивалютный криптокошелёк с встроенной биржей и стейкингом.', 12000000, 6000000, 50, 'active', 'growth', 'Москва', 5, '{"id":5,"name":"FinTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":12}', @authorId
  UNION SELECT 'SmartHome Hub', 'Универсальный хаб для умного дома, объединяющий устройства разных производителей.', 10000000, 0, 28, 'pending', 'idea', 'Новосибирск', 6, '{"id":6,"name":"IoT"}', '{"hasBusinessPlan":true,"hasTeam":false,"hasMVP":false,"teamSize":3}', @authorId
  UNION SELECT 'FoodShare', 'Приложение для обмена излишками еды между ресторанами и потребителями.', 3000000, 1500000, 20, 'active', 'mvp', 'Екатеринбург', 7, '{"id":7,"name":"FoodTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":6}', @authorId
  UNION SELECT 'VR Training', 'VR-платформа для корпоративного обучения в виртуальной реальности.', 20000000, 5000000, 45, 'active', 'growth', 'Москва', 4, '{"id":4,"name":"EdTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":18}', @authorId
  UNION SELECT 'GreenEnergy', 'Разработка и установка солнечных панелей нового поколения с КПД 30%.', 50000000, 15000000, 35, 'active', 'scaling', 'Сочи', 8, '{"id":8,"name":"CleanTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":35}', @authorId
  UNION SELECT 'PetCare', 'Онлайн-платформа для владельцев домашних животных: телеветеринария, доставка кормов.', 7000000, 2500000, 25, 'active', 'mvp', 'Нижний Новгород', 9, '{"id":9,"name":"PetTech"}', '{"hasBusinessPlan":true,"hasTeam":true,"hasMVP":true,"teamSize":9}', @authorId
) AS tmp
WHERE @authorId IS NOT NULL
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Создаём сообщества
INSERT INTO community (name, description, categoryId, isPrivate, creatorId)
SELECT * FROM (
  SELECT 'Стартаперы России' as name, 'Сообщество для основателей стартапов. Обмен опытом, поиск партнёров и инвесторов.' as description, 1 as categoryId, 0 as isPrivate, @authorId as creatorId
  UNION SELECT 'IT-предприниматели', 'Клуб для владельцев IT-компаний и технологических стартапов.', 2, 0, @authorId
  UNION SELECT 'Инвесторы и бизнес-ангелы', 'Закрытое сообщество для инвесторов. Обсуждение сделок, due diligence.', 3, 1, @authorId
  UNION SELECT 'Маркетинг для стартапов', 'Всё о продвижении стартапов: growth hacking, контент-маркетинг, SMM.', 4, 0, @authorId
  UNION SELECT 'FinTech Club', 'Сообщество для специалистов в области финансовых технологий.', 5, 0, @authorId
  UNION SELECT 'Женщины в бизнесе', 'Поддержка и развитие женского предпринимательства.', 6, 0, @authorId
  UNION SELECT 'Социальное предпринимательство', 'Бизнес с социальной миссией. Импакт-инвестиции.', 7, 0, @authorId
  UNION SELECT 'Франчайзинг', 'Всё о франшизах: покупка, продажа, развитие сетей.', 8, 0, @authorId
  UNION SELECT 'E-commerce мастера', 'Сообщество для владельцев интернет-магазинов и маркетплейсов.', 9, 0, @authorId
  UNION SELECT 'Криптоинвесторы', 'Обсуждение криптовалют, DeFi, NFT и Web3 проектов.', 10, 0, @authorId
) AS tmp
WHERE @authorId IS NOT NULL
ON DUPLICATE KEY UPDATE name = VALUES(name);

SELECT 'Готово! Добавлено 10 стартапов и 10 сообществ.' AS result;
