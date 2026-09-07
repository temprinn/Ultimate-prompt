SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ultimate_prompts;

-- Demo users (no Pro / no billing tiers)
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

INSERT INTO prompts (
  id, created_by, title, description, body, usage_count, created_at
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '33333333-3333-3333-3333-333333333333',
  'แผนคอนเทนต์ Marketing รายสัปดาห์',
  'สร้างปฏิทินคอนเทนต์พร้อมมุมมองช่องทางและ CTA',
  'คุณคือนักวางแผนคอนเทนต์การตลาด สร้างแผนคอนเทนต์รายสัปดาห์พร้อมหัวข้อ ช่องทาง CTA และเป้าหมายของแต่ละโพสต์ จัดเป็นตารางอ่านง่าย',
  20,
  '2026-08-12 08:00:00.000'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'สคริปต์ปิดการขาย B2B',
  'โครงบทสนทนาขายสำหรับทีม Sales ที่ต้องการปิดดีลเร็วขึ้น',
  'คุณคือโค้ชการขาย B2B เขียนสคริปต์ปิดการขายตั้งแต่ทักทาย ค้นหาความต้องการ จัดการข้อโต้แย้ง จนถึงการขอปิดดีล',
  12,
  '2026-08-18 14:30:00.000'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '33333333-3333-3333-3333-333333333333',
  'Agentic Workflow จัดการงาน Operations',
  'แตกงานปฏิบัติการเป็นลำดับเอเจนต์พร้อมจุดตรวจคุณภาพ',
  'คุณคือผู้ออกแบบ Agentic Workflow แตกงาน Operations เป็นลำดับเอเจนต์ พร้อมอินพุต เอาต์พุต จุดตรวจคุณภาพ และเงื่อนไขเลื่อนขั้น',
  15,
  '2026-08-25 02:00:00.000'
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  body = VALUES(body),
  usage_count = VALUES(usage_count);

INSERT IGNORE INTO prompt_tool_types (prompt_id, tool_type_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id FROM tool_types WHERE slug = 'chat';

INSERT IGNORE INTO prompt_categories (prompt_id, category_id)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id FROM categories WHERE slug = 'marketing';

INSERT IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't1111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't2222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 't3333333-3333-3333-3333-333333333333');

INSERT IGNORE INTO prompt_tool_types (prompt_id, tool_type_id)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id FROM tool_types WHERE slug = 'chat';

INSERT IGNORE INTO prompt_categories (prompt_id, category_id)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', id FROM categories WHERE slug = 'sales';

INSERT IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 't4444444-4444-4444-4444-444444444444'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 't2222222-2222-2222-2222-222222222222');

INSERT IGNORE INTO prompt_tool_types (prompt_id, tool_type_id)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc', id FROM tool_types WHERE slug = 'agentic';

INSERT IGNORE INTO prompt_categories (prompt_id, category_id)
SELECT 'cccccccc-cccc-cccc-cccc-cccccccccccc', id FROM categories WHERE slug = 'operations';

INSERT IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 't5555555-5555-5555-5555-555555555555'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 't6666666-6666-6666-6666-666666666666');
