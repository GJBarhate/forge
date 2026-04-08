#!/bin/bash
# forge-database/maintenance/restore.sh
# ============================================================
# Forge Database Restore Script
# Usage: ./maintenance/restore.sh <backup_file.sql.gz>
# Example: ./maintenance/restore.sh ./backups/forge_production_20240315_020000.sql.gz
# ============================================================

set -euo pipefail

# ── Argument validation ──────────────────────────────────────
if [ $# -eq 0 ]; then
  echo "ERROR: No backup file specified."
  echo "Usage: $0 <path_to_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [[ "$BACKUP_FILE" != *.sql.gz ]]; then
  echo "ERROR: Backup file must be a .sql.gz file."
  exit 1
fi

# ── Load .env ────────────────────────────────────────────────
if [ -f "../.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -v '^#' ../.env | grep -v '^$')
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-forge_user}"
DB_PASS="${DB_PASS:-forge_secure_password_change_me}"
DB_NAME="${DB_NAME:-forge_db}"
MYSQL_ROOT_USER="${MYSQL_ROOT_USER:-root}"

# ── Display backup info ──────────────────────────────────────
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -c %y "$BACKUP_FILE" 2>/dev/null || stat -f %Sm "$BACKUP_FILE" 2>/dev/null || echo "Unknown")

echo "============================================"
echo "Forge Database Restore"
echo "============================================"
echo "Backup file : $BACKUP_FILE"
echo "File size   : $BACKUP_SIZE"
echo "Created     : $BACKUP_DATE"
echo "Target DB   : $DB_NAME @ $DB_HOST:$DB_PORT"
echo "============================================"
echo ""
echo "WARNING: This will DESTROY ALL DATA in $DB_NAME."
echo ""
printf "Type 'CONFIRM' to proceed: "
read -r CONFIRMATION

if [ "$CONFIRMATION" != "CONFIRM" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo ""
echo "Starting restore at $(date)..."

# ── Drop and recreate the database (requires root) ───────────
echo "Step 1/3: Dropping and recreating database..."
mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$MYSQL_ROOT_USER" \
  -p \
  -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ── Restore from backup ──────────────────────────────────────
echo "Step 2/3: Restoring from backup (this may take a moment)..."
gunzip -c "$BACKUP_FILE" | mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$MYSQL_ROOT_USER" \
  -p \
  "$DB_NAME"

echo "Restore complete at $(date)"

# ── Verify restore ───────────────────────────────────────────
echo ""
echo "Step 3/3: Verifying restore..."
echo "--------------------------------------------"

mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --table \
  "$DB_NAME" \
  -e "
    SELECT 'users'          AS table_name, COUNT(*) AS row_count FROM users
    UNION ALL
    SELECT 'projects',       COUNT(*) FROM projects
    UNION ALL
    SELECT 'iterations',     COUNT(*) FROM iterations
    UNION ALL
    SELECT 'artifacts',      COUNT(*) FROM artifacts
    UNION ALL
    SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;
  "

echo "--------------------------------------------"
echo "Restore verification complete."
echo "============================================"
