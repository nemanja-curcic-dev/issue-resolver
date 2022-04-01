import { MigrationInterface, QueryRunner } from 'typeorm';

export class issue1648821142411 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE `issues` (' +
                '`id` int(10) unsigned NOT NULL AUTO_INCREMENT,' +
                '`title` varchar(100) NOT NULL,' +
                '`description` text NOT NULL,' +
                '`status` varchar(15) NOT NULL,' +
                'PRIMARY KEY (`id`)' +
                ') ENGINE=InnoDB DEFAULT CHARSET=utf8'
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP table `issues`');
    }
}
