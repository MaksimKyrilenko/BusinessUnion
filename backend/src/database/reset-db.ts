import { createConnection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

async function resetDatabase() {
  try {
    // Загружаем переменные окружения
    dotenv.config();
    
    const connection = await createConnection({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'qwertzxc228',
      database: process.env.DB_NAME || 'union_db',
    });

    console.log('Connected to database');

    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'reset.sql'),
      'utf8',
    );

    const queries = sqlScript
      .split(';')
      .filter(query => query.trim().length > 0);

    for (const query of queries) {
      await connection.query(query);
      console.log('Executed query:', query.trim());
    }

    console.log('Database reset completed successfully');
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 