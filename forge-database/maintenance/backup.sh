#!/bin/bash
# forge-database/maintenance/backup.sh
# ============================================================
# Forge Database Backup Script
# Usage: ./maintenance/backup.sh [environment]
# Example: ./maintenance/backup.sh production
# ============================================================

set -euo pipefail

ENV=${1:-development}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/forge_${ENV}_${TIMESTAMP}.sql.gz"

# Create backup dir if not exists
mkdir -p "$BACKUP_DIR"

# Load .env if present
if [ -f "../.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -v '^#' ../.env | grep -v '^$')
  set +a
fi

# Connection settings (env vars override defaults)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-forge_user}"
DB_PASS="${DB_PASS:-forge_secure_password_change_me}"
DB_NAME="${DB_NAME:-forge_db}"

echo "============================================"
echo "Forge Database Backup"
echo "============================================"
echo "Environment : $ENV"
echo "Database    : $DB_NAME @ $DB_HOST:$DB_PORT"
echo "Output file : $BACKUP_FILE"
echo "Started at  : $(date)"
echo "--------------------------------------------"

# Run backup
mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  --complete-insert \
  --hex-blob \
  --default-character-set=utf8mb4 \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup completed : $BACKUP_FILE ($BACKUP_SIZE)"

# Retain only last 30 backups for this environment
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}/forge_${ENV}_"*.sql.gz 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 30 ]; then
  echo "Pruning old backups (keeping last 30)..."
  ls -t "${BACKUP_DIR}/forge_${ENV}_"*.sql.gz | tail -n +31 | xargs -r rm
fi

RETAINED=$(ls "${BACKUP_DIR}/forge_${ENV}_"*.sql.gz 2>/dev/null | wc -l)
echo "Backups retained : $RETAINED"
echo "Finished at      : $(date)"
echo "============================================"
