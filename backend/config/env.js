import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables relative to backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOVERNMENT_EMAIL',
  'GOVERNMENT_PASSWORD',
  'GOVERNMENT_DEPARTMENT_CODE',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'HIVE_API_KEY'
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('💥 CRITICAL: Missing required environment variables in backend/.env:');
  missingVars.forEach((v) => console.error(`  - ${v}`));
  throw new Error(`Server cannot start. Missing required environment variables: ${missingVars.join(', ')}`);
}
