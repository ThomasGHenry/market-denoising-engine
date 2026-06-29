variable "github_token" {
  description = "GitHub personal access token for the GitHub provider"
  type        = string
  sensitive   = true
}

variable "repo_name" {
  description = "Repository name"
  type        = string
  default     = "market-denoising-engine"
}

variable "repo_owner" {
  description = "GitHub owner (user or org)"
  type        = string
  default     = "ThomasGHenry"
}

variable "auth_github_id" {
  description = "GitHub OAuth App Client ID — passed to TF_VAR_auth_github_id Actions secret"
  type        = string
  sensitive   = true
}

variable "auth_github_secret" {
  description = "GitHub OAuth App Client Secret — passed to TF_VAR_auth_github_secret Actions secret"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "NextAuth AUTH_SECRET — passed to TF_VAR_auth_secret Actions secret"
  type        = string
  sensitive   = true
}

variable "auth_resend_key" {
  description = "Resend API key — passed to TF_VAR_auth_resend_key Actions secret"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon personal API key — passed to TF_VAR_neon_api_key Actions secret"
  type        = string
  sensitive   = true
}

variable "vercel_token" {
  description = "Vercel personal API token — passed to TF_VAR_vercel_token Actions secret"
  type        = string
  sensitive   = true
}
