SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ultimate_prompts
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ultimate_prompts;

CREATE TABLE users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NULL,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(512) NULL,
  role ENUM('free', 'admin') NOT NULL DEFAULT 'free',
  email_verified_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_accounts (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  provider VARCHAR(64) NOT NULL COMMENT 'google',
  provider_account_id VARCHAR(255) NOT NULL COMMENT 'Google sub',
  type VARCHAR(32) NOT NULL DEFAULT 'oidc',
  access_token TEXT NULL,
  refresh_token TEXT NULL,
  id_token TEXT NULL,
  token_type VARCHAR(64) NULL,
  scope VARCHAR(512) NULL,
  expires_at INT NULL,
  session_state VARCHAR(255) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_auth_accounts_provider_account (provider, provider_account_id),
  KEY idx_auth_accounts_user_id (user_id),
  CONSTRAINT fk_auth_accounts_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_token (session_token),
  KEY idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompts (
  id CHAR(36) NOT NULL,
  created_by CHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(512) NOT NULL,
  body MEDIUMTEXT NOT NULL,
  usage_count INT UNSIGNED NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_prompts_created_by (created_by),
  KEY idx_prompts_created_at (created_at),
  KEY idx_prompts_usage_count (usage_count),
  KEY idx_prompts_rating_avg (rating_avg),
  FULLTEXT KEY ft_prompts_search (title, description, body),
  CONSTRAINT fk_prompts_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tool_types (
  id CHAR(36) NOT NULL,
  slug VARCHAR(64) NOT NULL,
  label VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tool_types_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id CHAR(36) NOT NULL,
  slug VARCHAR(64) NOT NULL,
  label VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
  id CHAR(36) NOT NULL,
  name VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompt_tool_types (
  prompt_id CHAR(36) NOT NULL,
  tool_type_id CHAR(36) NOT NULL,
  PRIMARY KEY (prompt_id, tool_type_id),
  KEY idx_prompt_tool_types_tool (tool_type_id),
  CONSTRAINT fk_prompt_tool_types_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prompt_tool_types_tool
    FOREIGN KEY (tool_type_id) REFERENCES tool_types (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompt_categories (
  prompt_id CHAR(36) NOT NULL,
  category_id CHAR(36) NOT NULL,
  PRIMARY KEY (prompt_id, category_id),
  KEY idx_prompt_categories_category (category_id),
  CONSTRAINT fk_prompt_categories_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prompt_categories_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompt_tags (
  prompt_id CHAR(36) NOT NULL,
  tag_id CHAR(36) NOT NULL,
  PRIMARY KEY (prompt_id, tag_id),
  KEY idx_prompt_tags_tag (tag_id),
  CONSTRAINT fk_prompt_tags_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_prompt_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorites (
  user_id CHAR(36) NOT NULL,
  prompt_id CHAR(36) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, prompt_id),
  KEY idx_favorites_prompt_id (prompt_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_favorites_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompt_copies (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL COMMENT 'null เมื่อ guest คัดลอกพรอมต์ free',
  prompt_id CHAR(36) NOT NULL,
  copied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_prompt_copies_user_prompt (user_id, prompt_id),
  KEY idx_prompt_copies_user_id (user_id),
  KEY idx_prompt_copies_prompt_id (prompt_id),
  KEY idx_prompt_copies_copied_at (copied_at),
  CONSTRAINT fk_prompt_copies_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_prompt_copies_prompt
    FOREIGN KEY (prompt_id) REFERENCES prompts (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prompt_ratings (
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
