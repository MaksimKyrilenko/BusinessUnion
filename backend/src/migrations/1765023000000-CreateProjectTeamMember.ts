import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectTeamMember1765023000000 implements MigrationInterface {
    name = 'CreateProjectTeamMember1765023000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем таблицу project_team_member
        await queryRunner.query(`
            CREATE TABLE \`project_team_member\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`projectId\` int NOT NULL,
                \`userId\` int NOT NULL,
                \`role\` enum('team_lead', 'admin', 'member') NOT NULL DEFAULT 'member',
                \`joinedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_project_team_member_projectId\` (\`projectId\`),
                INDEX \`IDX_project_team_member_userId\` (\`userId\`),
                UNIQUE INDEX \`IDX_project_team_member_unique\` (\`projectId\`, \`userId\`),
                CONSTRAINT \`FK_project_team_member_project\` FOREIGN KEY (\`projectId\`) REFERENCES \`project\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_project_team_member_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);

        // Добавляем колонку teamChatId в таблицу project
        await queryRunner.query(`
            ALTER TABLE \`project\` 
            ADD COLUMN \`teamChatId\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем колонку teamChatId из таблицы project
        await queryRunner.query(`
            ALTER TABLE \`project\` 
            DROP COLUMN \`teamChatId\`
        `);

        // Удаляем таблицу project_team_member
        await queryRunner.query(`DROP TABLE \`project_team_member\``);
    }
}

