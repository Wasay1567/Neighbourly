#!/bin/bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install docker.io docker-compose-v2 awscli -y
sudo usermod -aG docker $USER
sudo newgrp docker

# Create backup script
sudo tee /usr/local/bin/backup-postgres.sh > /dev/null <<'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/tmp/postgres-backups"
BUCKET_NAME="neighbourly-backup-bucket"
CONTAINER_NAME="postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_backup_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup postgres database
docker exec $CONTAINER_NAME pg_dump -U neighbourly_user neighbourly_db | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$BUCKET_NAME/backups/$BACKUP_FILE"

# Clean up old local backups (keep last 3)
ls -t "$BACKUP_DIR"/postgres_backup_*.sql.gz | tail -n +4 | xargs -r rm

echo "Backup completed: $BACKUP_FILE"
EOF

# Make backup script executable
sudo chmod +x /usr/local/bin/backup-postgres.sh

# Create cron job to run backup daily at 2 AM
(sudo crontab -l 2>/dev/null || echo "") | grep -v backup-postgres || echo "0 2 * * * /usr/local/bin/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1" | sudo crontab -