import '../config/env.js';
import mongoose from 'mongoose';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_civic_db';
const pgConnectionString = process.env.DATABASE_URL;

async function migrate() {
  console.log('🚀 Starting MongoDB to Supabase Migration...');

  let client;
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB!');

    // 2. Connect to PostgreSQL (Supabase)
    if (!pgConnectionString || pgConnectionString.startsWith('mongodb')) {
      throw new Error('DATABASE_URL is not set to a valid PostgreSQL connection string. Please update your .env file first.');
    }
    console.log('Connecting to Supabase PostgreSQL database...');
    client = new pg.Client({
      connectionString: pgConnectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
    console.log('✅ Connected to Supabase!');

    // 3. Initialize schema tables in PostgreSQL
    console.log('Initializing schema tables in PostgreSQL...');
    const schemaPath = path.resolve(__dirname, '../config/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ PostgreSQL Schema verified/created successfully!');

    const db = mongoose.connection.db;

    // Start a transaction in PostgreSQL
    await client.query('BEGIN');

    // Maps to track MongoDB String IDs -> PostgreSQL Integer IDs
    const userMap = new Map();
    const complaintMap = new Map();

    // 4. Migrate Users
    console.log('\n--- Migrating Users ---');
    const mongoUsers = await db.collection('users').find({}).toArray();
    console.log(`Found ${mongoUsers.length} users in MongoDB.`);

    for (const user of mongoUsers) {
      // Check if user already exists in PG (by email)
      const existingUserRes = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existingUserRes.rows.length > 0) {
        const pgUserId = existingUserRes.rows[0].id;
        userMap.set(user._id.toString(), pgUserId);
        console.log(`User ${user.email} already exists in PostgreSQL (ID: ${pgUserId}). Skipping insertion.`);
        continue;
      }

      const insertUserQuery = `
        INSERT INTO users (
          name, email, password, role, phone, address, department, department_code, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;
      const values = [
        user.name,
        user.email,
        user.password,
        user.role || 'citizen',
        user.phone || '',
        user.address || '',
        user.department || '',
        user.departmentCode || '',
        user.createdAt || new Date(),
        user.updatedAt || new Date()
      ];

      const res = await client.query(insertUserQuery, values);
      const newUserId = res.rows[0].id;
      userMap.set(user._id.toString(), newUserId);
      console.log(`Migrated user: ${user.email} -> PG ID: ${newUserId}`);
    }

    // 5. Migrate Complaints
    console.log('\n--- Migrating Complaints ---');
    const mongoComplaints = await db.collection('complaints').find({}).toArray();
    console.log(`Found ${mongoComplaints.length} complaints in MongoDB.`);

    for (const comp of mongoComplaints) {
      // Check if complaint already exists in PG
      const existingCompRes = await client.query('SELECT id FROM complaints WHERE complaint_id = $1', [comp.complaintId]);
      if (existingCompRes.rows.length > 0) {
        const pgCompId = existingCompRes.rows[0].id;
        complaintMap.set(comp._id.toString(), pgCompId);
        console.log(`Complaint ${comp.complaintId} already exists in PostgreSQL. Skipping.`);
        continue;
      }

      // Map citizen MongoDB ID to PostgreSQL Integer ID
      let citizenId = null;
      if (comp.citizen) {
        citizenId = userMap.get(comp.citizen.toString()) || null;
      }

      const insertCompQuery = `
        INSERT INTO complaints (
          complaint_id, title, category, description, location, formatted_address,
          house_number, residency, street, area, locality, city, district, state,
          pincode, country, landmark, coordinates, latitude, longitude, severity,
          status, image_url, image_verification_checked, image_verification_ai_generated_score,
          image_verification_deepfake_score, image_verification_result, image_verification_checked_at,
          resolution_image_url, citizen_id, citizen_name, citizen_email, department,
          assigned_officer, expected_resolution, resolved_at, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, $38
        ) RETURNING id
      `;

      const values = [
        comp.complaintId,
        comp.title,
        comp.category,
        comp.description,
        comp.location,
        comp.formattedAddress || comp.location,
        comp.houseNumber || '',
        comp.residency || '',
        comp.street || '',
        comp.area || '',
        comp.locality || '',
        comp.city || '',
        comp.district || '',
        comp.state || '',
        comp.pincode || '',
        comp.country || '',
        comp.landmark || '',
        comp.coordinates,
        comp.latitude,
        comp.longitude,
        comp.severity || 'Medium',
        comp.status || 'Submitted',
        comp.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
        comp.imageVerification?.checked || false,
        comp.imageVerification?.aiGeneratedScore || 0,
        comp.imageVerification?.deepfakeScore || 0,
        comp.imageVerification?.result || null,
        comp.imageVerification?.checkedAt || null,
        comp.resolutionImageUrl || '',
        citizenId,
        comp.citizenName || 'Anonymous Citizen',
        comp.citizenEmail || 'citizen@civic.org',
        comp.department,
        comp.assignedOfficer || 'Unassigned',
        comp.expectedResolution || 'Within 48 Hours',
        comp.resolvedAt || null,
        comp.createdAt || new Date(),
        comp.updatedAt || new Date()
      ];

      const res = await client.query(insertCompQuery, values);
      const newCompId = res.rows[0].id;
      complaintMap.set(comp._id.toString(), newCompId);
      console.log(`Migrated complaint: ${comp.complaintId} -> PG ID: ${newCompId}`);

      // Migrate timeline records for this complaint
      if (comp.timeline && Array.isArray(comp.timeline)) {
        for (const timeItem of comp.timeline) {
          const insertTimelineQuery = `
            INSERT INTO complaint_timelines (complaint_id, status, date, note, created_at)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertTimelineQuery, [
            newCompId,
            timeItem.status,
            timeItem.date,
            timeItem.note,
            comp.createdAt || new Date()
          ]);
        }
        console.log(`  - Migrated ${comp.timeline.length} timeline records`);
      }

      // Migrate comment records for this complaint
      if (comp.comments && Array.isArray(comp.comments)) {
        for (const commItem of comp.comments) {
          const insertCommentQuery = `
            INSERT INTO complaint_comments (complaint_id, author, author_role, text, date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await client.query(insertCommentQuery, [
            newCompId,
            commItem.author,
            commItem.authorRole || 'citizen',
            commItem.text,
            commItem.date,
            commItem.createdAt || new Date(),
            commItem.updatedAt || new Date()
          ]);
        }
        console.log(`  - Migrated ${comp.comments.length} comment records`);
      }
    }

    // 6. Migrate Notifications
    console.log('\n--- Migrating Notifications ---');
    const mongoNotifications = await db.collection('notifications').find({}).toArray();
    console.log(`Found ${mongoNotifications.length} notifications in MongoDB.`);

    for (const notif of mongoNotifications) {
      // Map recipient MongoDB ID to PostgreSQL Integer ID
      let recipientId = null;
      if (notif.recipient) {
        recipientId = userMap.get(notif.recipient.toString()) || null;
      }

      const insertNotifQuery = `
        INSERT INTO notifications (
          recipient_id, recipient_email, target_role, title, message, unread, type, complaint_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      const values = [
        recipientId,
        notif.recipientEmail || '',
        notif.targetRole || 'all',
        notif.title,
        notif.message,
        notif.unread !== undefined ? notif.unread : true,
        notif.type || 'system',
        notif.complaintId || '',
        notif.createdAt || new Date(),
        notif.updatedAt || new Date()
      ];

      await client.query(insertNotifQuery, values);
      console.log(`Migrated notification: "${notif.title}" for recipient email: ${notif.recipientEmail}`);
    }

    // Commit Transaction
    await client.query('COMMIT');
    console.log('\n✨ Database transaction committed successfully!');

    // 7. Verify Migration Count
    console.log('\n--- Verification Summary ---');
    const pgUsersCount = await client.query('SELECT COUNT(*) FROM users');
    const pgComplaintsCount = await client.query('SELECT COUNT(*) FROM complaints');
    const pgNotificationsCount = await client.query('SELECT COUNT(*) FROM notifications');

    const pgUsers = parseInt(pgUsersCount.rows[0].count, 10);
    const pgComplaints = parseInt(pgComplaintsCount.rows[0].count, 10);
    const pgNotifications = parseInt(pgNotificationsCount.rows[0].count, 10);

    console.log(`Users: MongoDB = ${mongoUsers.length} | PostgreSQL = ${pgUsers}`);
    console.log(`Complaints: MongoDB = ${mongoComplaints.length} | PostgreSQL = ${pgComplaints}`);
    console.log(`Notifications: MongoDB = ${mongoNotifications.length} | PostgreSQL = ${pgNotifications}`);

    if (pgUsers >= mongoUsers.length && pgComplaints >= mongoComplaints.length && pgNotifications >= mongoNotifications.length) {
      console.log('\n🎉 SUCCESS: Data migration verified successfully!');
    } else {
      console.warn('\n⚠️ WARNING: Some record counts did not match. Please verify the database state.');
    }

    process.exit(0);
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
        console.log('🔄 Rolled back transaction due to error.');
      } catch (rollbackErr) {
        console.error('Failed to rollback transaction:', rollbackErr);
      }
    }
    console.error('\n💥 Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    if (client) {
      await client.end();
    }
  }
}

migrate();
