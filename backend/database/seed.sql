INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'EthioFund Admin',
  'admin@ethiofund.com',
  '0911223344',
  crypt('Admin@123', gen_salt('bf')),
  'admin',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'Ashenafi Bancha',
  'organizer@ethiofund.com',
  '0938103340',
  crypt('Organizer@123', gen_salt('bf')),
  'organizer',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'Aster Abebe',
  'donor1@ethiofund.com',
  '0911000002',
  crypt('Donor@123', gen_salt('bf')),
  'donor',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO users (full_name, email, phone_number, password_hash, role, status)
VALUES (
  'Mekonnen Tadesse',
  'donor2@ethiofund.com',
  '0911000003',
  crypt('Donor@123', gen_salt('bf')),
  'donor',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

INSERT INTO admins (admin_id, access_level)
SELECT user_id, 'super_admin'
FROM users
WHERE email = 'admin@ethiofund.com'
ON CONFLICT (admin_id) DO UPDATE
SET access_level = EXCLUDED.access_level;

WITH organizer AS (
  SELECT user_id FROM users WHERE email = 'organizer@ethiofund.com' LIMIT 1
)
INSERT INTO campaigns (
  title,
  description,
  story,
  location,
  goal_amount,
  raised_amount,
  total_donors,
  duration_days,
  image_url,
  verified,
  status,
  category,
  organizer_id
)
SELECT
  seed_data.title,
  seed_data.description,
  seed_data.story,
  seed_data.location,
  seed_data.goal_amount,
  seed_data.raised_amount,
  seed_data.total_donors,
  seed_data.duration_days,
  seed_data.image_url,
  seed_data.verified,
  seed_data.status,
  seed_data.category,
  organizer.user_id
FROM (
  VALUES
    (
      'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa',
      'Help cover urgent surgery, medicine, and recovery care for Hana at Tikur Anbessa Specialized Hospital in Addis Ababa, Ethiopia.',
      'Hana is a mother in Addis Ababa who needs urgent surgery and post-operative support. Donations will help pay for hospital admission, treatment, medicine, and recovery costs so she can return home safely to her family.',
      'Addis Ababa, Ethiopia',
      450000.00,
      238000.00,
      94,
      19,
      'https://images.unsplash.com/photo-1580281657527-47f249e8f91c?auto=format&fit=crop&w=1200&q=80',
      TRUE,
      'active',
      'medical'
    ),
    (
      'Ethiopia Education Support for Rural Oromia Students',
      'Support desks, books, school supplies, and learning materials for students in rural Oromia, Ethiopia.',
      'Children in rural Oromia still travel long distances to reach under-resourced schools. This campaign supports classroom materials, textbooks, and study supplies so more students can stay in school and learn with dignity.',
      'Oromia Region, Ethiopia',
      320000.00,
      176000.00,
      112,
      26,
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      TRUE,
      'approved',
      'education'
    )
) AS seed_data (
  title,
  description,
  story,
  location,
  goal_amount,
  raised_amount,
  total_donors,
  duration_days,
  image_url,
  verified,
  status,
  category
) CROSS JOIN organizer;

INSERT INTO campaign_updates (campaign_id, content)
SELECT c.campaign_id, u.content
FROM (
  VALUES
    ('Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa', 'The medical team has completed Hana''s pre-surgery evaluation and is preparing for the procedure this week.'),
    ('Ethiopia Education Support for Rural Oromia Students', 'The first batch of books and classroom supplies has reached the partner schools in rural Oromia.')
) AS u(title, content)
JOIN campaigns c ON c.title = u.title;

INSERT INTO milestones (campaign_id, title, description, target_amount, is_completed, completed_at)
VALUES
  (
    (SELECT campaign_id FROM campaigns WHERE title = 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa' LIMIT 1),
    'Surgery Deposit',
    'Cover the initial surgery deposit and hospital admission costs.',
    150000.00::NUMERIC,
    TRUE,
    NOW()
  ),
  (
    (SELECT campaign_id FROM campaigns WHERE title = 'Ethiopia Education Support for Rural Oromia Students' LIMIT 1),
    'Classroom Materials',
    'Purchase desks, books, and basic learning supplies for the new term.',
    120000.00::NUMERIC,
    FALSE,
    NULL::TIMESTAMP
  );

INSERT INTO donations (amount, payment_status, is_anonymous, message, donor_id, campaign_id)
SELECT d.amount, 'successful', FALSE, d.message, u.user_id, c.campaign_id
FROM (
  VALUES
    ('donor1@ethiofund.com', 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa', 120000.00, 'For Hana and her recovery.'),
    ('donor2@ethiofund.com', 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa', 118000.00, 'May the surgery go well.'),
    ('donor1@ethiofund.com', 'Ethiopia Education Support for Rural Oromia Students', 90000.00, 'Education for rural children.'),
    ('donor2@ethiofund.com', 'Ethiopia Education Support for Rural Oromia Students', 86000.00, 'Helping students stay in school.')
) AS d(donor_email, campaign_title, amount, message)
JOIN users u ON u.email = d.donor_email
JOIN campaigns c ON c.title = d.campaign_title;

INSERT INTO comments (content, user_id, campaign_id, moderation_status, moderation_reason, moderation_score, moderated_at)
SELECT cmt.content, u.user_id, c.campaign_id, 'approved', 'seeded demo comment', 0.995, NOW()
FROM (
  VALUES
    ('donor1@ethiofund.com', 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa', 'Sending strength and prayers for Hana and her family.'),
    ('donor2@ethiofund.com', 'Ethiopia Emergency Medical Surgery Support for Hana in Addis Ababa', 'Thank you for sharing this transparent update.'),
    ('donor1@ethiofund.com', 'Ethiopia Education Support for Rural Oromia Students', 'This is exactly the kind of support our students need.'),
    ('donor2@ethiofund.com', 'Ethiopia Education Support for Rural Oromia Students', 'May this bring more learning opportunities to rural students.')
) AS cmt(user_email, campaign_title, content)
JOIN users u ON u.email = cmt.user_email
JOIN campaigns c ON c.title = cmt.campaign_title;
