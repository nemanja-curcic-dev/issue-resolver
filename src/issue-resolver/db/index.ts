import { DataSource } from 'typeorm';
import path from 'path';
import { Envs } from '../misc/envs';

const dataSource = new DataSource({
    type: 'mysql',
    database: Envs.DATABASE_URL.match(/(?!.*\/)(.*)/)?.[1] || '',
    url: Envs.DATABASE_URL,
    migrationsRun: true,
    migrations: [
        path.join(__dirname + '/migrations/*.ts'),
        path.join(__dirname + '/migrations/*.js'),
    ],
    entities: [
        path.join(__dirname + '/models/*.ts'),
        path.join(__dirname + '/models/*.js'),
    ],
});

export default dataSource;