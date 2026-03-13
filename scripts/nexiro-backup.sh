#!/bin/bash
BACKUP_DIR=/var/backups/nexiro-flux
DATE=$(date +%Y-%m-%d_%H%M)
KEEP_DAYS=14

mysqldump -u nexiro -pNexiroFlux@2026! nexiro_flux_central --single-transaction --routines --triggers | gzip > "${BACKUP_DIR}/db_${DATE}.sql.gz"

# حذف النسخ القديمة (أكثر من 14 يوم)
find "${BACKUP_DIR}" -name 'db_*.sql.gz' -mtime +${KEEP_DAYS} -delete

echo "[$(date)] Backup done: db_${DATE}.sql.gz ($(du -h ${BACKUP_DIR}/db_${DATE}.sql.gz | cut -f1))"
