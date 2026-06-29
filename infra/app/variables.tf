variable "vercel_token" {
  description = "Vercel personal API token — BW item: thomasghenry-vercel-token"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon personal API key — BW item: buenvecino-neon-api-key"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "GitHub repository in owner/repo format"
  type        = string
  default     = "ThomasGHenry/market-denoising-engine"
}

variable "neon_region" {
  description = "Neon region ID — https://neon.tech/docs/introduction/regions"
  type        = string
  default     = "aws-us-east-1"
}

variable "project_name" {
  description = "Resource name used for both the Vercel project and the Neon project"
  type        = string
  default     = "market-denoising-engine"
}
