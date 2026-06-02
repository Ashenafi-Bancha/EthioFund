-- EthioFund test seed (TC seed verification)
-- Passwords: Admin@1234, Donor@1234, Org@1234 (bcrypt via pgcrypto)

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'EthioFund Admin',
  'admin@ethiofund.com',
  '+251911000001',
  crypt('Admin@1234', gen_salt('bf', 12)),
  'admin',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'Test Donor',
  'donor@ethiofund.com',
  '+251911000002',
  crypt('Donor@1234', gen_salt('bf', 12)),
  'donor',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'Test Organizer',
  'organizer@ethiofund.com',
  '+251911000003',
  crypt('Org@1234', gen_salt('bf', 12)),
  'organizer',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO admins (admin_id, access_level)
SELECT user_id, 'super_admin'
FROM users
WHERE email = 'admin@ethiofund.com'
ON CONFLICT (admin_id) DO UPDATE
SET access_level = EXCLUDED.access_level;

-- Campaign ID 1: approved medical (public, donatable) with payout details
INSERT INTO campaigns (
  title, description, story, location, goal_amount, raised_amount, total_donors,
  duration_days, verified, status, category, organizer_id, bank_account, payout_phone
)
SELECT
  'Medical Support Campaign',
  'Help cover urgent medical treatment and recovery costs for a community member in need.',
  'This campaign supports essential medical care and follow-up treatment.',
  'Addis Ababa, Ethiopia',
  50000.00,
  25000.00,
  12,
  30,
  TRUE,
  'active',
  'medical',
  u.user_id,
  'CBE-1000123456789',
  '+251911000003'
FROM users u
WHERE u.email = 'organizer@ethiofund.com'
  AND NOT EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.title = 'Medical Support Campaign' AND c.organizer_id = u.user_id
  );

-- Campaign ID 2: pending education (hidden from public feed)
INSERT INTO campaigns (
  title, description, story, location, goal_amount, raised_amount, total_donors,
  duration_days, verified, status, category, organizer_id, bank_account, payout_phone
)
SELECT
  'Education Support Pending Review',
  'Support school supplies and tuition assistance for students in rural Ethiopia.',
  'Pending admin review before publication.',
  'Oromia, Ethiopia',
  30000.00,
  0.00,
  0,
  30,
  FALSE,
  'pending',
  'education',
  u.user_id,
  'Awash Bank-2000987654321',
  '+251911000003'
FROM users u
WHERE u.email = 'organizer@ethiofund.com'
  AND NOT EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.title = 'Education Support Pending Review' AND c.organizer_id = u.user_id
  );

-- Campaign ID 3: rejected funeral (hidden from public feed)
INSERT INTO campaigns (
  title, description, story, location, goal_amount, raised_amount, total_donors,
  duration_days, verified, status, category, organizer_id, bank_account, payout_phone
)
SELECT
  'Funeral Support Rejected Example',
  'Support funeral and memorial costs for a grieving family in the community.',
  'This campaign was rejected during admin review.',
  'Amhara, Ethiopia',
  20000.00,
  0.00,
  0,
  14,
  FALSE,
  'rejected',
  'funeral',
  u.user_id,
  'Dashen Bank-3000111222333',
  '+251911000003'
FROM users u
WHERE u.email = 'organizer@ethiofund.com'
  AND NOT EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.title = 'Funeral Support Rejected Example' AND c.organizer_id = u.user_id
  );

-- Sample contact form messages for admin inbox
INSERT INTO contact_messages (name, email, message, status)
SELECT v.name, v.email, v.message, v.status
FROM (
  VALUES
    ('Marta Haile', 'marta@example.com', 'I need help verifying my medical campaign documents.', 'new'),
    ('Samuel Tesfaye', 'samuel@example.com', 'Our Chapa payment failed twice. Can you assist?', 'new'),
    ('Hanna Bekele', 'hanna@example.com', 'Thank you for approving our community project.', 'read')
) AS v(name, email, message, status)
WHERE NOT EXISTS (SELECT 1 FROM contact_messages LIMIT 1);
