import '../config/env.js';
import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

const email = 'saiprofessionalnext@gmail.com';
const rawPassword = 'Project31';
const departmentCode = 'PWD-2026';
const department = 'PWD';
const role = 'government';
const name = 'PWD Officer';

async function run() {
  try {
    console.log(`Connecting to DB to check/insert government user: ${email}...`);
    
    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    
    // Check if user exists
    const checkRes = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (checkRes.rows.length > 0) {
      const userId = checkRes.rows[0].id;
      console.log(`User already exists with ID ${userId}. Updating credentials and details...`);
      await query(
        `UPDATE users 
         SET password = $1, role = $2, department = $3, department_code = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5`,
        [hashedPassword, role, department, departmentCode, userId]
      );
      console.log(`✅ User updated successfully!`);
    } else {
      console.log(`User does not exist. Creating new government user...`);
      await query(
        `INSERT INTO users (name, email, password, role, department, department_code, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [name, email.toLowerCase(), hashedPassword, role, department, departmentCode]
      );
      console.log(`✅ User created successfully!`);
    }
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error inserting/updating user:`, err);
    process.exit(1);
  }
}

run();
