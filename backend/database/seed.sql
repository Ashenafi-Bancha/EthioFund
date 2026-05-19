CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH admin_user AS (
  INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
  VALUES (
    'System Admin',
    'admin@ethiofund.com',
    '0911000000',
    crypt('Admin@123', gen_salt('bf')),
    'admin',
    'active'
  )
  ON CONFLICT (email) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone_number = EXCLUDED.phone_number,
      role = EXCLUDED.role,
      status = EXCLUDED.status
  RETURNING user_id
)
INSERT INTO admins (admin_id, access_level)
SELECT user_id, 'super_admin'
FROM admin_user
ON CONFLICT (admin_id) DO UPDATE
SET access_level = EXCLUDED.access_level;
