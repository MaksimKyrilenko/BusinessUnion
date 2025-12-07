import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeProjectImageToLongtext1765022495774 implements MigrationInterface {
    name = 'ChangeProjectImageToLongtext1765022495774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Изменяем тип колонки image на longtext для поддержки base64 изображений
        await queryRunner.query(`ALTER TABLE \`project\` MODIFY COLUMN \`image\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Возвращаем тип колонки image обратно на text
        await queryRunner.query(`ALTER TABLE \`project\` MODIFY COLUMN \`image\` text NULL`);
    }

}
