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
