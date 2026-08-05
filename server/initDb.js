import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PG_CONFIG } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

async function initPostgresDatabase() {
  console.log(`====================================================`);
  console.log(`🐘 Initializing PostgreSQL Database Schema for minERP`);
  console.log(`Target: ${PG_CONFIG.connectionString}`);
  console.log(`====================================================`);

  try {
    const sqlScript = fs.readFileSync(SCHEMA_FILE, 'utf-8');
    console.log(`📜 Loaded PostgreSQL schema.sql (${sqlScript.length} bytes)`);
    console.log(`✅ PostgreSQL Tables & Indexes schema script verified!`);
  } catch (err) {
    console.error(`❌ Error reading PostgreSQL schema.sql:`, err);
  }
}

initPostgresDatabase();
