import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';
import fs from 'fs';

const getDatabasePath = (): string => {
  const dbPath = process.env.DATABASE_PATH || './data/todos.sqlite';
  const resolvedPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.join(process.cwd(), dbPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return resolvedPath;
};

let dataSource: DataSource | null = null;

export const getDataSource = async (): Promise<DataSource> => {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  const dbPath = getDatabasePath();

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    entities: [Todo],
    synchronize: true,
    logging: false
  });

  await dataSource.initialize();
  return dataSource;
};
