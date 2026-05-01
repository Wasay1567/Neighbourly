terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
  }

  required_version = ">= 1.2"

  backend "s3" {
    bucket         = "neighbourly-infra-tf-state"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock-table"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
}


# resource "aws_s3_bucket" "terraform_state_bucket" {
#   bucket        = "neighbourly-infra-tf-state"
#   force_destroy = true

#   # lifecycle {
#   #   prevent_destroy = true
#   # }
# }

# resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
#   bucket = aws_s3_bucket.terraform_state_bucket.id

#   versioning_configuration {
#     status = "Enabled"
#   }
# }

# resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_crypto_conf" {
#   bucket = aws_s3_bucket.terraform_state_bucket.id

#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm = "AES256"
#     }
#   }
# }

# resource "aws_s3_bucket_public_access_block" "terraform_state" {
#   bucket                  = aws_s3_bucket.terraform_state_bucket.id
#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }

# resource "aws_dynamodb_table" "terraform_state_lock_table" {
#   name         = "terraform-state-lock-table"
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "LockID"

#   attribute {
#     name = "LockID"
#     type = "S"
#   }
# }