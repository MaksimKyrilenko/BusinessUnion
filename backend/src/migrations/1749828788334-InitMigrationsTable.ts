import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigrationsTable1749828788334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Проверяем существует ли уже таблица миграций
        const hasTable = await queryRunner.hasTable("migrations");
        
        if (!hasTable) {
            // Создаем таблицу миграций, если она не существует
            await queryRunner.query(`
                CREATE TABLE "migrations" (
                    "id" int NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    "timestamp" bigint NOT NULL,
                    "name" varchar(255) NOT NULL
                )
            `);
        }
        
        // Добавляем записи о предыдущих миграциях, которые уже выполнены
        const migrationsToAdd = [
            { timestamp: 1749811426379, name: "AddContactAndEducationFields" }
        ];
        
        for (const migration of migrationsToAdd) {
            // Проверяем, существует ли уже запись о такой миграции
            const exists = await queryRunner.query(
                `SELECT COUNT(*) as count FROM migrations WHERE timestamp = ? AND name = ?`,
                [migration.timestamp, migration.name]
            );
            
            if (exists[0].count === 0) {
                await queryRunner.query(
                    `INSERT INTO migrations (timestamp, name) VALUES (?, ?)`,
                    [migration.timestamp, migration.name]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем записи о добавленных миграциях
        await queryRunner.query(`
            DELETE FROM migrations 
            WHERE name = 'AddContactAndEducationFields'
        `);
    }
}
