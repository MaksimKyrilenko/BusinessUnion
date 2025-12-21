import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommunitiesTables1761220000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем таблицу категорий сообществ
        await queryRunner.query(`
            CREATE TABLE \`community_category\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`icon\` varchar(255) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Создаем таблицу сообществ
        await queryRunner.query(`
            CREATE TABLE \`community\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`image\` varchar(255) NULL,
                \`isPrivate\` tinyint NOT NULL DEFAULT 0,
                \`categoryId\` int NOT NULL,
                \`creatorId\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_community_categoryId\` (\`categoryId\`),
                INDEX \`IDX_community_creatorId\` (\`creatorId\`)
            ) ENGINE=InnoDB
        `);

        // Создаем таблицу участников сообществ
        await queryRunner.query(`
            CREATE TABLE \`community_member\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`communityId\` int NOT NULL,
                \`isModerator\` tinyint NOT NULL DEFAULT 0,
                \`joinedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_community_member_userId\` (\`userId\`),
                INDEX \`IDX_community_member_communityId\` (\`communityId\`),
                UNIQUE INDEX \`IDX_community_member_unique\` (\`userId\`, \`communityId\`)
            ) ENGINE=InnoDB
        `);

        // Создаем таблицу постов сообществ
        await queryRunner.query(`
            CREATE TABLE \`community_post\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`content\` text NOT NULL,
                \`image\` varchar(255) NULL,
                \`likesCount\` int NOT NULL DEFAULT 0,
                \`commentsCount\` int NOT NULL DEFAULT 0,
                \`authorId\` int NOT NULL,
                \`communityId\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_community_post_authorId\` (\`authorId\`),
                INDEX \`IDX_community_post_communityId\` (\`communityId\`)
            ) ENGINE=InnoDB
        `);

        // Добавляем внешние ключи
        await queryRunner.query(`
            ALTER TABLE \`community\` 
            ADD CONSTRAINT \`FK_community_category\` 
            FOREIGN KEY (\`categoryId\`) REFERENCES \`community_category\`(\`id\`) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`community\` 
            ADD CONSTRAINT \`FK_community_creator\` 
            FOREIGN KEY (\`creatorId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`community_member\` 
            ADD CONSTRAINT \`FK_community_member_user\` 
            FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`community_member\` 
            ADD CONSTRAINT \`FK_community_member_community\` 
            FOREIGN KEY (\`communityId\`) REFERENCES \`community\`(\`id\`) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`community_post\` 
            ADD CONSTRAINT \`FK_community_post_author\` 
            FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE \`community_post\` 
            ADD CONSTRAINT \`FK_community_post_community\` 
            FOREIGN KEY (\`communityId\`) REFERENCES \`community\`(\`id\`) ON DELETE CASCADE
        `);

        // Добавляем начальные категории
        await queryRunner.query(`
            INSERT INTO \`community_category\` (\`name\`, \`icon\`) VALUES
            ('Стартапы', 'fas fa-rocket'),
            ('Инвесторы', 'fas fa-chart-line'),
            ('Бизнес', 'fas fa-briefcase'),
            ('Крипто', 'fas fa-coins')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем внешние ключи
        await queryRunner.query(`ALTER TABLE \`community_post\` DROP FOREIGN KEY \`FK_community_post_community\``);
        await queryRunner.query(`ALTER TABLE \`community_post\` DROP FOREIGN KEY \`FK_community_post_author\``);
        await queryRunner.query(`ALTER TABLE \`community_member\` DROP FOREIGN KEY \`FK_community_member_community\``);
        await queryRunner.query(`ALTER TABLE \`community_member\` DROP FOREIGN KEY \`FK_community_member_user\``);
        await queryRunner.query(`ALTER TABLE \`community\` DROP FOREIGN KEY \`FK_community_creator\``);
        await queryRunner.query(`ALTER TABLE \`community\` DROP FOREIGN KEY \`FK_community_category\``);

        // Удаляем таблицы
        await queryRunner.query(`DROP TABLE \`community_post\``);
        await queryRunner.query(`DROP TABLE \`community_member\``);
        await queryRunner.query(`DROP TABLE \`community\``);
        await queryRunner.query(`DROP TABLE \`community_category\``);
    }
}





















