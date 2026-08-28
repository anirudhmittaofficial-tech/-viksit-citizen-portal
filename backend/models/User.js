import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Match user entered password to hashed password in database
export const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Find user by email
export const findUserByEmail = async (email) => {
  const res = await query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email.trim()]
  );
  return res.rows[0] || null;
};

// Find user by ID
export const findUserById = async (id) => {
  const res = await query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
};

// Create a new user
export const createUser = async ({ name, email, password, role = 'citizen', phone = '', address = '' }) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const res = await query(
    `INSERT INTO users (name, email, password, role, phone, address, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    [name.trim(), email.trim().toLowerCase(), hashedPassword, role, phone, address]
  );
  return res.rows[0];
};

// Update user details or credentials
export const updateUser = async (id, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    // Map camelCase keys to snake_case column names
    let columnName = key;
    if (key === 'departmentCode') columnName = 'department_code';
    if (key === 'resetPasswordToken') columnName = 'reset_password_token';
    if (key === 'resetPasswordExpire') columnName = 'reset_password_expire';

    if (key === 'password' && value) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(value, salt);
      fields.push(`${columnName} = $${index++}`);
      values.push(hashedPassword);
    } else {
      fields.push(`${columnName} = $${index++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const res = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${index} RETURNING *`,
    values
  );
  return res.rows[0] || null;
};

// Find user by active password reset token
export const findUserByResetToken = async (hashedToken) => {
  const res = await query(
    'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > CURRENT_TIMESTAMP',
    [hashedToken]
  );
  return res.rows[0] || null;
};

