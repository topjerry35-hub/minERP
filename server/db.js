import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// PostgreSQL Connection String configuration (kept for compatibility)
export const PG_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/minerp_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log(`[PostgreSQL DB] Configured using Prisma Client connecting to: ${PG_CONFIG.connectionString}`);
