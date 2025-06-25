import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegionAndSocialLinks1749815291994 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем новое поле region в таблицу profile
        await queryRunner.query(`ALTER TABLE profile ADD COLUMN region VARCHAR(255) NULL`);
        
        // Обновляем существующие записи socialLinks
        // Берем текущие данные и добавляем новые поля
        const profiles = await queryRunner.query(`SELECT id, socialLinks FROM profile WHERE socialLinks IS NOT NULL`);
        
        for (const profile of profiles) {
            if (profile.socialLinks) {
                let socialLinks;
                try {
                    socialLinks = JSON.parse(profile.socialLinks);
                } catch (e) {
                    socialLinks = {};
                }
                
                // Добавляем новые поля, если их нет
                socialLinks.vk = socialLinks.vk || null;
                socialLinks.instagram = socialLinks.instagram || null;
                socialLinks.facebook = socialLinks.facebook || null;
                
                // Обновляем запись
                await queryRunner.query(`UPDATE profile SET socialLinks = ? WHERE id = ?`, 
                    [JSON.stringify(socialLinks), profile.id]);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем поле region
        await queryRunner.query(`ALTER TABLE profile DROP COLUMN region`);
        
        // Обновляем записи socialLinks, чтобы удалить новые поля
        const profiles = await queryRunner.query(`SELECT id, socialLinks FROM profile WHERE socialLinks IS NOT NULL`);
        
        for (const profile of profiles) {
            if (profile.socialLinks) {
                let socialLinks;
                try {
                    socialLinks = JSON.parse(profile.socialLinks);
                } catch (e) {
                    socialLinks = {};
                }
                
                // Удаляем новые поля
                delete socialLinks.vk;
                delete socialLinks.instagram;
                delete socialLinks.facebook;
                
                // Обновляем запись
                await queryRunner.query(`UPDATE profile SET socialLinks = ? WHERE id = ?`, 
                    [JSON.stringify(socialLinks), profile.id]);
            }
        }
    }
} 