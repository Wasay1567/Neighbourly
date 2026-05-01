variable "key_name" {
  description = "The name of the SSH key pair"
  type        = string
  default     = "neighbourly-kp"
}

variable "public_key_path" {
  description = "The path to the public key file"
  type        = string
  default     = ".ssh/neighbourly-key.pub"
}

variable "ami_id" {
  description = "The AMI ID for the EC2 instance"
  type        = string
  default     = "ami-091138d0f0d41ff90"
}

variable "instance_type" {
  description = "The instance type for the EC2 instance"
  type        = string
  default     = "t2.small"
}

variable "security_group_name" {
  description = "The name of the security group"
  type        = string
  default     = "neighbourly-sg"
}