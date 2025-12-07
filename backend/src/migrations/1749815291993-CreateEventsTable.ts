import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEventsTable1749815291993 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "events",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "date",
                        type: "timestamp",
                        isNullable: false,
                    },
                    {
                        name: "location",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "color",
                        type: "varchar",
                        length: "20",
                        default: "'#4CAF50'",
                    },
                    {
                        name: "createdById",
                        type: "int",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Создаем таблицу для связи many-to-many между событиями и пользователями (участники)
        await queryRunner.createTable(
            new Table({
                name: "events_participants_users",
                columns: [
                    {
                        name: "eventsId",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "usersId",
                        type: "int",
                        isPrimary: true,
                    },
                ],
            }),
            true
        );

        // Добавляем внешний ключ для createdById
        await queryRunner.createForeignKey(
            "events",
            new TableForeignKey({
                columnNames: ["createdById"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "SET NULL",
            })
        );

        // Добавляем внешние ключи для таблицы связей
        await queryRunner.createForeignKey(
            "events_participants_users",
            new TableForeignKey({
                columnNames: ["eventsId"],
                referencedColumnNames: ["id"],
                referencedTableName: "events",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "events_participants_users",
            new TableForeignKey({
                columnNames: ["usersId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем таблицу связей
        await queryRunner.dropTable("events_participants_users");
        
        // Удаляем основную таблицу
        await queryRunner.dropTable("events");
    }
}
