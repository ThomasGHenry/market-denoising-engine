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

variable "auth_secret" {
  description = "NextAuth AUTH_SECRET — generate with: openssl rand -hex 32"
  type        = string
  sensitive   = true
}

variable "auth_github_id" {
  description = "GitHub OAuth App Client ID — github.com/settings/developers"
  type        = string
  sensitive   = true
}

variable "auth_github_secret" {
  description = "GitHub OAuth App Client Secret — github.com/settings/developers"
  type        = string
  sensitive   = true
}

variable "auth_resend_key" {
  description = "Resend API key for transactional email"
  type        = string
  sensitive   = true
}
