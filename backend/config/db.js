import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables.');
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Test the connection
      const client = await pool.connect();
      console.log(`✅ PostgreSQL Connected successfully to database!`);
      client.release();
      return;
    } catch (error) {
      console.error(`❌ PostgreSQL Connection Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt === retries) {
        throw error;
      }
      console.log(`⏳ Retrying in 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

export const query = (text, params) => pool.query(text, params);
export { pool };
export default connectDB;
