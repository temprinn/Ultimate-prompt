-- Migrate existing DB: drop Pro / billing leftovers (keep sessions / auth tokens)
USE ultimate_prompts;

UPDATE users SET role = 'free' WHERE role = 'pro';

ALTER TABLE users
  MODIFY COLUMN role ENUM('free', 'admin') NOT NULL DEFAULT 'free';

ALTER TABLE users
  DROP COLUMN tier;

ALTER TABLE prompts
  DROP INDEX idx_prompts_access_level,
  DROP COLUMN access_level;
