-- Remove unused prompt rating columns and table
USE ultimate_prompts;

DROP TABLE IF EXISTS prompt_ratings;

ALTER TABLE prompts
  DROP INDEX idx_prompts_rating_avg,
  DROP COLUMN rating_avg,
  DROP COLUMN rating_count;
