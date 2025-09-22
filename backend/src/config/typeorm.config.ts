import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT! || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'shalom_dhis2',
  entities: [User],
  synchronize: true, // uniquement pour dev, pas en prod
};
