-- Smart Civic Platform - PostgreSQL Database Schema
-- Optimized, normalized, and indexed for high performance and integrity.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'citizen',
  phone VARCHAR(50) DEFAULT '',
  address TEXT DEFAULT '',
  department VARCHAR(255) DEFAULT '',
  department_code VARCHAR(50) DEFAULT '',
  reset_password_token VARCHAR(255) DEFAULT NULL,
  reset_password_expire TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  complaint_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  house_number VARCHAR(255) DEFAULT '',
  residency VARCHAR(255) DEFAULT '',
  street VARCHAR(255) DEFAULT '',
  area VARCHAR(255) DEFAULT '',
  locality VARCHAR(255) DEFAULT '',
  city VARCHAR(255) DEFAULT '',
  district VARCHAR(255) DEFAULT '',
  state VARCHAR(255) DEFAULT '',
  pincode VARCHAR(50) DEFAULT '',
  country VARCHAR(255) DEFAULT '',
  landmark VARCHAR(255) DEFAULT '',
  coordinates VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  severity VARCHAR(50) NOT NULL DEFAULT 'Medium',
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
  image_url TEXT DEFAULT '',
  image_verification_checked BOOLEAN DEFAULT FALSE,
  image_verification_ai_generated_score DOUBLE PRECISION DEFAULT 0,
  image_verification_deepfake_score DOUBLE PRECISION DEFAULT 0,
  image_verification_result VARCHAR(50) DEFAULT NULL,
  image_verification_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  resolution_image_url TEXT DEFAULT '',
  citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  citizen_name VARCHAR(255) DEFAULT 'Anonymous Citizen',
  citizen_email VARCHAR(255) DEFAULT 'citizen@civic.org',
  department VARCHAR(255) NOT NULL,
  assigned_officer VARCHAR(255) DEFAULT 'Unassigned',
  expected_resolution VARCHAR(255) DEFAULT 'Within 48 Hours',
  resolved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Complaint Timeline Table
CREATE TABLE IF NOT EXISTS complaint_timelines (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Complaint Comments Table
CREATE TABLE IF NOT EXISTS complaint_comments (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_role VARCHAR(50) NOT NULL DEFAULT 'citizen',
  text TEXT NOT NULL,
  date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) DEFAULT '',
  target_role VARCHAR(50) DEFAULT 'all',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  unread BOOLEAN DEFAULT TRUE,
  type VARCHAR(50) DEFAULT 'system',
  complaint_id VARCHAR(50) DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & INTEGRITY INDEXES
-- ============================================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Complaints Indexes (for search, filter, sorting, and user associations)
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_email ON complaints(citizen_email);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status_department ON complaints(status, department);

-- Timelines & Comments Relational Indexes
CREATE INDEX IF NOT EXISTS idx_timelines_complaint_id ON complaint_timelines(complaint_id);
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON complaint_comments(complaint_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email ON notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(unread);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
