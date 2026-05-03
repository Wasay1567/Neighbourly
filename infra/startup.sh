#!/bin/bash
# 1. Update system and install dependencies
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Setup Docker GPG Key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Add Official Docker Repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine and Compose V2 Plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Enable and start Docker service
systemctl enable docker
systemctl start docker

# 6. Add the 'ubuntu' user to the docker group
# This ensures permissions are ready for your first SSH login
usermod -aG docker ubuntu

# 7. Safety Fix: Update socket permissions immediately 
# This acts as a failsafe so 'docker ps' works without needing a second login session
chown root:docker /var/run/docker.sock
chmod 660 /var/run/docker.sock

echo "Docker and Compose V2 installation complete for user: ubuntu"

sudo apt install unzip curl -y
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

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