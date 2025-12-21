import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactAndEducationFields1749811426379 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE profile 
            ADD COLUMN phoneNumber VARCHAR(255) NULL,
            ADD COLUMN address VARCHAR(255) NULL,
            ADD COLUMN education TEXT NULL,
            ADD COLUMN certifications JSON NULL,
            ADD COLUMN languages JSON NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE profile 
            DROP COLUMN phoneNumber,
            DROP COLUMN address,
            DROP COLUMN education,
            DROP COLUMN certifications,
            DROP COLUMN languages
        `);
    }

}
