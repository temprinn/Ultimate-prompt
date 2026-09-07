-- Unique copy per user + delayed star ratings for popularity
USE ultimate_prompts;

-- Keep earliest copy per (user_id, prompt_id), drop duplicates
DELETE pc
FROM prompt_copies pc
INNER JOIN prompt_copies newer
  ON pc.user_id <=> newer.user_id
 AND pc.prompt_id = newer.prompt_id
 AND (
   pc.copied_at > newer.copied_at
   OR (pc.copied_at = newer.copied_at AND pc.id > newer.id)
 );

-- Sync usage_count to unique logged-in copies
UPDATE prompts p
SET usage_count = (
  SELECT COUNT(*)
  FROM prompt_copies pc
  WHERE pc.prompt_id = p.id AND pc.user_id IS NOT NULL
);

SET @uq_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'prompt_copies'
    AND index_name = 'uq_prompt_copies_user_prompt'
);

SET @sql := IF(
  @uq_exists = 0,
  'ALTER TABLE prompt_copies ADD UNIQUE KEY uq_prompt_copies_user_prompt (user_id, prompt_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @rating_avg_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'prompts'
    AND column_name = 'rating_avg'
);

SET @sql := IF(
  @rating_avg_exists = 0,
  'ALTER TABLE prompts
     ADD COLUMN rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00 AFTER usage_count,
     ADD COLUMN rating_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER rating_avg,
     ADD KEY idx_prompts_rating_avg (rating_avg)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS prompt_ratings (
  user_id CHAR(36) NOT NULL,
  prompt_id CHAR(36) NOT NULL,
  stars TINYINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, prompt_id),
  KEY idx_prompt_ratings_prompt_id (prompt_id),
  CONSTRAINT chk_prompt_ratings_stars CHECK (stars BETWEEN 1 AND 5),
  CONSTRAINT fk_prompt_ratings_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prompt_ratings_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
