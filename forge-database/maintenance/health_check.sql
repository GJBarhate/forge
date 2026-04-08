-- forge-database/maintenance/health_check.sql
-- ═══════════════════════════════════════════════════════════
-- FORGE DATABASE HEALTH CHECK
-- Run: mysql -u forge_user -p forge_db < maintenance/health_check.sql
-- ═══════════════════════════════════════════════════════════

USE forge_db;

SELECT '═══════════════════════════════════════' AS '';
SELECT '  FORGE DATABASE HEALTH CHECK REPORT   ' AS '';
SELECT CONCAT('  Run at: ', NOW())               AS '';
SELECT '═══════════════════════════════════════' AS '';

-- ── 1. Row counts for all 5 tables ──────────────────────────
SELECT '── 1. Row Counts ──' AS check_name;
SELECT 'users'          AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'projects',       COUNT(*) FROM projects
UNION ALL SELECT 'iterations',     COUNT(*) FROM iterations
UNION ALL SELECT 'artifacts',      COUNT(*) FROM artifacts
UNION ALL SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;

-- ── 2. Projects by status distribution ──────────────────────
SELECT '── 2. Project Status Distribution ──' AS check_name;
SELECT
  status,
  COUNT(*) AS project_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM projects), 1) AS percentage
FROM projects
GROUP BY status
ORDER BY project_count DESC;

-- ── 3. Top 5 users by active project count ──────────────────
SELECT '── 3. Top 5 Users by Active Project Count ──' AS check_name;
SELECT
  u.email,
  u.name,
  COUNT(p.id) AS active_project_count,
  MAX(p.created_at) AS last_project_created
FROM users u
LEFT JOIN projects p ON p.user_id = u.id AND p.deleted_at IS NULL
GROUP BY u.id, u.email, u.name
ORDER BY active_project_count DESC
LIMIT 5;

-- ── 4. Average artifact count per completed iteration ────────
SELECT '── 4. Average Artifacts per Completed Iteration ──' AS check_name;
SELECT
  ROUND(AVG(artifact_count), 2) AS avg_artifacts_per_completed_iteration,
  MIN(artifact_count) AS min_artifacts,
  MAX(artifact_count) AS max_artifacts,
  COUNT(*) AS total_complete_iterations
FROM (
  SELECT i.id, COUNT(a.id) AS artifact_count
  FROM iterations i
  LEFT JOIN artifacts a ON a.iteration_id = i.id
  WHERE i.status = 'COMPLETE'
  GROUP BY i.id
) AS iteration_artifact_counts;

-- ── 5. Failed iterations in the last 24 hours ───────────────
SELECT '── 5. Failed Iterations (Last 24 Hours) ──' AS check_name;
SELECT
  i.id AS iteration_id,
  i.project_id,
  p.name AS project_name,
  u.email AS user_email,
  i.created_at AS failed_at
FROM iterations i
JOIN projects p ON p.id = i.project_id
JOIN users u ON u.id = p.user_id
WHERE i.status = 'FAILED'
  AND i.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY i.created_at DESC;

-- ── 6. Security: expired but non-revoked refresh tokens ─────
SELECT '── 6. Security — Expired Non-Revoked Tokens ──' AS check_name;
SELECT
  COUNT(*) AS expired_non_revoked_count,
  MIN(expires_at) AS oldest_expired,
  MAX(expires_at) AS newest_expired
FROM refresh_tokens
WHERE revoked = 0
  AND expires_at < NOW();

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN 'PASS — No security debt found'
    ELSE CONCAT('WARN — ', COUNT(*), ' expired tokens need cleanup')
  END AS security_status
FROM refresh_tokens
WHERE revoked = 0 AND expires_at < NOW();

-- ── 7. Top 10 largest artifact JSON payloads ────────────────
SELECT '── 7. Top 10 Largest Artifact JSON Payloads ──' AS check_name;
SELECT
  a.id AS artifact_id,
  a.type,
  a.iteration_id,
  LENGTH(JSON_UNQUOTE(JSON_EXTRACT(a.content, '$'))) AS approximate_bytes,
  ROUND(LENGTH(JSON_UNQUOTE(JSON_EXTRACT(a.content, '$'))) / 1024, 2) AS approximate_kb,
  a.created_at
FROM artifacts a
ORDER BY LENGTH(JSON_UNQUOTE(JSON_EXTRACT(a.content, '$'))) DESC
LIMIT 10;

-- ── 8. Maximum iteration tree depth (recursive CTE) ─────────
SELECT '── 8. Maximum Iteration Tree Depth ──' AS check_name;
WITH RECURSIVE iteration_tree AS (
  -- Base case: root iterations (no parent)
  SELECT id, project_id, parent_id, 1 AS depth
  FROM iterations
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: children
  SELECT i.id, i.project_id, i.parent_id, it.depth + 1
  FROM iterations i
  INNER JOIN iteration_tree it ON i.parent_id = it.id
)
SELECT
  MAX(depth) AS max_tree_depth,
  AVG(depth) AS avg_tree_depth,
  COUNT(DISTINCT CASE WHEN depth = 1 THEN id END) AS root_iterations,
  COUNT(*) AS total_iterations_in_tree
FROM iteration_tree;

-- ── 9. Database size per table (MB) ─────────────────────────
SELECT '── 9. Table Sizes (Data + Index) ──' AS check_name;
SELECT
  table_name,
  ROUND(data_length / 1024 / 1024, 3) AS data_mb,
  ROUND(index_length / 1024 / 1024, 3) AS index_mb,
  ROUND((data_length + index_length) / 1024 / 1024, 3) AS total_mb,
  table_rows AS estimated_rows
FROM information_schema.TABLES
WHERE table_schema = 'forge_db'
  AND table_name IN ('users','projects','iterations','artifacts','refresh_tokens')
ORDER BY (data_length + index_length) DESC;

-- ── 10. Recent activity: last 10 projects across all users ───
SELECT '── 10. Last 10 Projects Created ──' AS check_name;
SELECT
  p.id AS project_id,
  u.email AS user_email,
  p.name AS project_name,
  p.status,
  p.created_at,
  COUNT(i.id) AS iteration_count
FROM projects p
JOIN users u ON u.id = p.user_id
LEFT JOIN iterations i ON i.project_id = p.id
GROUP BY p.id, u.email, p.name, p.status, p.created_at
ORDER BY p.created_at DESC
LIMIT 10;

SELECT '═══════════════════════════════════════' AS '';
SELECT '  Health check complete.               ' AS '';
SELECT '═══════════════════════════════════════' AS '';
