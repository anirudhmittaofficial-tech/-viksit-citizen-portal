import '../config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB, { pool, query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runOptimization() {
  console.log('🚀 Running database schema organization and index optimization...');

  try {
    await connectDB(3);

    const schemaPath = path.resolve(__dirname, '../config/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema queries and creating performance indexes...');
    await query(sql);

    console.log('✅ Database schema verified, organized, and indexes applied successfully!');

    // Show summary of created tables & indexes
    const tableRes = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n📊 Active Tables in Database:');
    tableRes.rows.forEach(r => console.log(`  - ${r.table_name}`));

    const indexRes = await query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `);
    console.log(`\n⚡ Active Performance Indexes (${indexRes.rows.length} total):`);
    indexRes.rows.forEach(r => console.log(`  - [${r.tablename}] ${r.indexname}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Database organization failed:', err.message);
    process.exit(1);
  }
}

runOptimization();
