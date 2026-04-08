-- forge-database/migrations/001_initial_schema.sql
-- ============================================================
-- Migration 001: Initial schema
-- Applied: manually or via migration runner
-- Description: Create all core tables, indexes, constraints, and views
-- ============================================================

-- Migration metadata
CREATE TABLE IF NOT EXISTS _forge_migrations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  applied_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guard: skip if already applied
SET @already_applied = (SELECT COUNT(*) FROM _forge_migrations WHERE name = '001_initial_schema');
-- If @already_applied > 0, the following statements will be no-ops due to IF NOT EXISTS

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(30)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100) NULL,
  created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id         VARCHAR(30)  NOT NULL,
  user_id    VARCHAR(30)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  status     ENUM('PROCESSING','COMPLETE','FAILED') NOT NULL DEFAULT 'PROCESSING',
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3)  NULL,
  PRIMARY KEY (id),
  INDEX idx_projects_user_id (user_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_deleted_at (deleted_at),
  INDEX idx_projects_user_created (user_id, created_at),
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS iterations (
  id          VARCHAR(30)  NOT NULL,
  project_id  VARCHAR(30)  NOT NULL,
  parent_id   VARCHAR(30)  NULL,
  voice_input LONGTEXT     NULL,
  image_url   VARCHAR(500) NULL,
  text_input  LONGTEXT     NULL,
  status      ENUM('PROCESSING','COMPLETE','FAILED') NOT NULL DEFAULT 'PROCESSING',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_iterations_project_id (project_id),
  INDEX idx_iterations_parent_id (parent_id),
  INDEX idx_iterations_project_created (project_id, created_at),
  CONSTRAINT fk_iterations_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_iterations_parent  FOREIGN KEY (parent_id)  REFERENCES iterations(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS artifacts (
  id           VARCHAR(30)  NOT NULL,
  iteration_id VARCHAR(30)  NOT NULL,
  type         ENUM('PRD','SCHEMA','COMPONENT_TREE','TASK_BOARD') NOT NULL,
  content      JSON         NOT NULL,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX idx_artifacts_iteration_id (iteration_id),
  INDEX idx_artifacts_type (type),
  UNIQUE KEY uq_artifacts_iteration_type (iteration_id, type),
  CONSTRAINT fk_artifacts_iteration FOREIGN KEY (iteration_id) REFERENCES iterations(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_artifacts_content CHECK (JSON_VALID(content))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         VARCHAR(30)  NOT NULL,
  user_id    VARCHAR(30)  NOT NULL,
  token_hash VARCHAR(64)  NOT NULL,
  expires_at DATETIME(3)  NOT NULL,
  revoked    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_token_hash (token_hash),
  INDEX idx_refresh_tokens_user_id (user_id),
  INDEX idx_refresh_tokens_expires_revoked (expires_at, revoked),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

CREATE OR REPLACE VIEW v_active_projects AS
SELECT p.*, u.email AS user_email, u.name AS user_name,
       COUNT(i.id) AS iteration_count
FROM projects p
JOIN users u ON u.id = p.user_id
LEFT JOIN iterations i ON i.project_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.user_id, p.name, p.status, p.created_at, p.updated_at, p.deleted_at, u.email, u.name;

CREATE OR REPLACE VIEW v_latest_iterations AS
SELECT i.*
FROM iterations i
INNER JOIN (
  SELECT project_id, MAX(created_at) AS max_created
  FROM iterations
  GROUP BY project_id
) latest ON i.project_id = latest.project_id AND i.created_at = latest.max_created;

CREATE OR REPLACE VIEW v_iteration_artifacts AS
SELECT
  i.id AS iteration_id,
  i.project_id,
  i.status,
  i.created_at,
  GROUP_CONCAT(a.type ORDER BY a.type SEPARATOR ',') AS artifact_types,
  COUNT(a.id) AS artifact_count
FROM iterations i
LEFT JOIN artifacts a ON a.iteration_id = i.id
GROUP BY i.id, i.project_id, i.status, i.created_at;

-- Record migration
INSERT IGNORE INTO _forge_migrations (name) VALUES ('001_initial_schema');

SELECT 'Migration 001_initial_schema applied successfully.' AS status;
