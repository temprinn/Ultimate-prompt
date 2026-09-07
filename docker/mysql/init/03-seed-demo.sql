SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ultimate_prompts;

-- Local/dev helper users only (no demo prompts for production)
INSERT INTO users (id, email, name, role, email_verified_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'free@example.com', 'Free Tester', 'free', UTC_TIMESTAMP(3)),
  ('33333333-3333-3333-3333-333333333333', 'admin@example.com', 'Admin Tester', 'admin', UTC_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role);

DELETE FROM sessions WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM favorites WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM prompt_copies WHERE user_id = '22222222-2222-2222-2222-222222222222';
DELETE FROM users WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO tags (id, name) VALUES
  ('t1111111-1111-1111-1111-111111111111', 'Marketing'),
  ('t2222222-2222-2222-2222-222222222222', 'Chat'),
  ('t3333333-3333-3333-3333-333333333333', 'Claude'),
  ('t4444444-4444-4444-4444-444444444444', 'Sales'),
  ('t5555555-5555-5555-5555-555555555555', 'Operations'),
  ('t6666666-6666-6666-6666-666666666666', 'Agentic')
ON DUPLICATE KEY UPDATE name = VALUES(name);
