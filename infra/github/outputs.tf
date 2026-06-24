output "repo_url" {
  description = "Repository URL"
  value       = github_repository.repo.html_url
}

output "repo_full_name" {
  description = "Repository full name (owner/repo)"
  value       = github_repository.repo.full_name
}
