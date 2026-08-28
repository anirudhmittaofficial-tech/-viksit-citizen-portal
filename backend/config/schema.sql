-- Users Table
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
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
  image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  image_verification_checked BOOLEAN DEFAULT FALSE,
  image_verification_ai_generated_score DOUBLE PRECISION DEFAULT 0,
  image_verification_deepfake_score DOUBLE PRECISION DEFAULT 0,
  image_verification_result VARCHAR(50) DEFAULT NULL,
  image_verification_checked_at TIMESTAMP DEFAULT NULL,
  resolution_image_url TEXT DEFAULT '',
  citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  citizen_name VARCHAR(255) DEFAULT 'Anonymous Citizen',
  citizen_email VARCHAR(255) DEFAULT 'citizen@civic.org',
  department VARCHAR(255) NOT NULL,
  assigned_officer VARCHAR(255) DEFAULT 'Unassigned',
  expected_resolution VARCHAR(255) DEFAULT 'Within 48 Hours',
  resolved_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint Timeline Table
CREATE TABLE IF NOT EXISTS complaint_timelines (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint Comments Table
CREATE TABLE IF NOT EXISTS complaint_comments (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_role VARCHAR(50) NOT NULL DEFAULT 'citizen',
  text TEXT NOT NULL,
  date VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);

