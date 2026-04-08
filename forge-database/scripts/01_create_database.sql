-- forge-database/scripts/01_create_database.sql
-- ============================================================
-- Run as MySQL root: mysql -u root -p < scripts/01_create_database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS forge_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'forge_user'@'localhost' IDENTIFIED BY 'forge_secure_password_change_me';
CREATE USER IF NOT EXISTS 'forge_user'@'%' IDENTIFIED BY 'forge_secure_password_change_me';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON forge_db.* TO 'forge_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON forge_db.* TO 'forge_user'@'%';

FLUSH PRIVILEGES;

USE forge_db;

SELECT 'Database and user created successfully.' AS status;
