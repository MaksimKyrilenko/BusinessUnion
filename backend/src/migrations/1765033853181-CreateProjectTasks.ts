import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectTasks1765033853181 implements MigrationInterface {
    name = 'CreateProjectTasks1765033853181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем таблицу project_tasks
        await queryRunner.query(`
            CREATE TABLE \`project_tasks\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`projectId\` int NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`status\` enum('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
                \`assignedToId\` int NULL,
                \`createdById\` int NOT NULL,
                \`dueDate\` datetime NULL,
                \`priority\` enum('low', 'medium', 'high') NULL DEFAULT 'medium',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_project_tasks_projectId\` (\`projectId\`),
                INDEX \`IDX_project_tasks_assignedToId\` (\`assignedToId\`),
                INDEX \`IDX_project_tasks_createdById\` (\`createdById\`),
                CONSTRAINT \`FK_project_tasks_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_project_tasks_assignedTo\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL,
                CONSTRAINT \`FK_project_tasks_createdBy\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем таблицу project_tasks
        await queryRunner.query(`DROP TABLE \`project_tasks\``);
    }
}

