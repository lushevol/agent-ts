import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type DatabaseSchema = typeof schema;
export type DatabaseClient = NodePgDatabase<DatabaseSchema>;

export interface CreateDbOptions {
  connectionString?: string;
  pool?: Pool;
}

export function createDb(options: CreateDbOptions = {}): DatabaseClient {
  const connectionString = options.connectionString ?? process.env.DATABASE_URL;
  if (!options.pool && !connectionString) {
    throw new Error('DATABASE_URL must be provided to create a database connection.');
  }

  const pool = options.pool ?? new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export { schema };
