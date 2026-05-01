output "ec2_public_ip" {
  description = "The public IP address of the EC2 instance"
  value       = aws_instance.app_instance.public_ip
}

output "ec2_instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.app_instance.id
}

output "ec2_security_group_id" {
  description = "The security group ID"
  value       = aws_security_group.security_group.id
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.my_bucket.id
}
