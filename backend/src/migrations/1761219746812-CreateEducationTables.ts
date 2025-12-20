import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEducationTables1761219746812 implements MigrationInterface {
    name = 'CreateEducationTables1761219746812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`courses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`fullDescription\` text NULL, \`category\` enum ('startup', 'investor', 'businessman', 'crypto_trader') NOT NULL DEFAULT 'startup', \`difficulty\` enum ('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner', \`durationWeeks\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`icon\` varchar(255) NULL, \`imageUrl\` text NULL, \`videoUrl\` text NULL, \`curriculum\` json NULL, \`requirements\` json NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`enrolledCount\` int NOT NULL DEFAULT '0', \`rating\` decimal(3,2) NULL, \`reviewCount\` int NOT NULL DEFAULT '0', \`instructorId\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`course_enrollments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`courseId\` int NOT NULL, \`status\` enum ('pending', 'approved', 'completed', 'cancelled') NOT NULL DEFAULT 'pending', \`paidAmount\` decimal(10,2) NULL, \`enrolledAt\` timestamp NULL, \`completedAt\` timestamp NULL, \`progress\` int NOT NULL DEFAULT '0', \`notes\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_e6714597bea722629fa7d32124a\` FOREIGN KEY (\`instructorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_enrollments\` ADD CONSTRAINT \`FK_ab72c7fa06784137e905f1f8b8e\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_enrollments\` ADD CONSTRAINT \`FK_d77e489db35c7d325700d799be6\` FOREIGN KEY (\`courseId\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`course_enrollments\` DROP FOREIGN KEY \`FK_d77e489db35c7d325700d799be6\``);
        await queryRunner.query(`ALTER TABLE \`course_enrollments\` DROP FOREIGN KEY \`FK_ab72c7fa06784137e905f1f8b8e\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_e6714597bea722629fa7d32124a\``);
        await queryRunner.query(`DROP TABLE \`course_enrollments\``);
        await queryRunner.query(`DROP TABLE \`courses\``);
    }

}
