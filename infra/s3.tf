resource "aws_s3_bucket" "my_bucket" {
  bucket = "neighbourly-backup-bucket"

  tags = {
    Name        = "neighbourly-backup-bucket"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_public_access_block" "public_access_block" {
  bucket = aws_s3_bucket.my_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "encryption_configuration" {
  bucket = aws_s3_bucket.my_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "lifecycle_configuration" {
  bucket = aws_s3_bucket.my_bucket.id

  rule {
    id     = "delete-old-backups"
    status = "Enabled"
    filter {
      prefix = "backups/"
    }

    expiration {
      days = 5
    }
  }
}
