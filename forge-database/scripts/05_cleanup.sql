-- forge-database/scripts/05_cleanup.sql
-- ============================================================
-- Safely drop all Forge objects in correct dependency order.
-- WARNING: This destroys all data. Used for reset/testing.
-- Run: mysql -u forge_user -p forge_db < scripts/05_cleanup.sql
-- ============================================================

USE forge_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_iteration_artifacts;
DROP VIEW IF EXISTS v_latest_iterations;
DROP VIEW IF EXISTS v_active_projects;

DROP TABLE IF EXISTS artifacts;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS iterations;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Uncomment to drop the entire database:
-- DROP DATABASE IF EXISTS forge_db;

SELECT 'Cleanup complete. All tables and views dropped.' AS status;
