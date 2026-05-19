CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(13) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'organizer', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  admin_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  access_level VARCHAR(30) NOT NULL DEFAULT 'super_admin'
);

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  story TEXT,
  location VARCHAR(120) NOT NULL DEFAULT 'Ethiopia',
  goal_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) DEFAULT 0,
  total_donors INT NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 30,
  image_url VARCHAR(255),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'closed', 'rejected', 'suspended')),
  category VARCHAR(30) NOT NULL CHECK (category IN ('medical', 'education', 'funeral', 'emergency', 'community')),
  organizer_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS total_donors INT NOT NULL DEFAULT 0;

ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS share_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS campaign_media (
  media_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  file_url VARCHAR(255) NOT NULL,
  media_type VARCHAR(20) DEFAULT 'image',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_updates (
  update_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  posted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  milestone_id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  target_amount DECIMAL(12,2) NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  donation_id SERIAL PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  donation_date TIMESTAMP DEFAULT NOW(),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  donor_id INT NOT NULL REFERENCES users(user_id),
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id VARCHAR(50) PRIMARY KEY,
  donation_id INT NOT NULL REFERENCES donations(donation_id),
  gateway_name VARCHAR(30) NOT NULL DEFAULT 'chapa',
  transaction_status VARCHAR(20) NOT NULL CHECK (transaction_status IN ('pending', 'successful', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  tx_ref VARCHAR(60) UNIQUE NOT NULL,
  donation_id INT REFERENCES donations(donation_id) ON DELETE SET NULL,
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
  donor_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'chapa',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INT NOT NULL REFERENCES users(user_id),
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id),
  moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending_review', 'rejected')),
  moderation_reason TEXT,
  moderation_score DECIMAL(4,3),
  moderated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  withdrawal_id SERIAL PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bank_account VARCHAR(100),
  request_date TIMESTAMP DEFAULT NOW(),
  campaign_id INT NOT NULL REFERENCES campaigns(campaign_id)
);

CREATE TABLE IF NOT EXISTS reports (
  report_id SERIAL PRIMARY KEY,
  report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('campaign', 'donation', 'user', 'financial')),
  generated_date TIMESTAMP DEFAULT NOW(),
  generated_by INT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
  activity VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
