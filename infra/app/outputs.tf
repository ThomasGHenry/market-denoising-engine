output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.mde.id
}

output "vercel_project_id" {
  description = "Vercel project ID"
  value       = vercel_project.mde.id
}

output "vercel_preview_url" {
  description = "Set as VERCEL_PREVIEW_URL on the 'preview' GitHub environment secret"
  value       = "${var.project_name}.vercel.app"
}

output "database_url" {
  description = "Pooled DATABASE_URL — set as DATABASE_URL_PROD on the 'production' GitHub environment secret"
  value       = local.database_url
  sensitive   = true
}

output "database_url_unpooled" {
  description = "Non-pooled DATABASE_URL_UNPOOLED for Prisma migrations"
  value       = neon_project.mde.connection_uri
  sensitive   = true
}

output "post_apply_steps" {
  description = "Manual steps required after tofu apply"
  value       = <<-EOT
    GitHub → Settings → Environments → production:
      VERCEL_TOKEN      = <from BW: thomasghenry-vercel-token>
      DATABASE_URL_PROD = run: tofu output -raw database_url

    Note: preview environment secrets (VERCEL_PREVIEW_URL, DATABASE_URL_UNPOOLED)
    are now managed by infra/github via terraform_remote_state.
  EOT
}
