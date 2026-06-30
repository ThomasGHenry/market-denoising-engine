terraform {
  required_version = ">= 1.6"
  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.13"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.0"
    }
    resend = {
      source  = "registry.terraform.io/armaaar/resend"
      version = "~> 1.0"
    }
    dreamhost = {
      source  = "adamantal/dreamhost"
      version = "~> 0.3"
    }
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "vercel" {
  api_token = var.vercel_token
}

provider "resend" {
  api_key = var.resend_api_key
}

provider "dreamhost" {
  api_key = var.dreamhost_api_key
}

resource "neon_project" "mde" {
  name       = var.project_name
  region_id  = var.neon_region
  pg_version = 17

  branch {
    database_name = "mde"
    role_name     = "mde_owner"
  }
}

locals {
  database_url = join("", [
    "postgresql://",
    neon_project.mde.database_user,
    ":",
    neon_project.mde.database_password,
    "@",
    neon_project.mde.database_host_pooler,
    "/",
    neon_project.mde.database_name,
    "?pgbouncer=true&connection_limit=1&sslmode=require",
  ])
}

resource "vercel_project" "mde" {
  name           = var.project_name
  framework      = "nextjs"
  root_directory = "apps/web"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

resource "vercel_project_environment_variables" "mde" {
  project_id = vercel_project.mde.id

  variables = [
    {
      key       = "DATABASE_URL"
      value     = local.database_url
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "DATABASE_URL_UNPOOLED"
      value     = neon_project.mde.connection_uri
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "AUTH_SECRET"
      value     = var.auth_secret
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "AUTH_URL"
      value     = "https://market-denoising-engine-thomas-g-henry-llc.vercel.app"
      target    = ["production"]
      sensitive = false
    },
    {
      key       = "AUTH_GITHUB_ID"
      value     = var.auth_github_id
      target    = ["production"]
      sensitive = true
    },
    {
      key       = "AUTH_GITHUB_SECRET"
      value     = var.auth_github_secret
      target    = ["production"]
      sensitive = true
    },
    {
      key       = "AUTH_RESEND_KEY"
      value     = var.auth_resend_key
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "AUTH_EMAIL_FROM"
      value     = "MDE <auth@thomasghenry.com>"
      target    = ["production", "preview"]
      sensitive = false
    },
  ]
}

resource "resend_domain" "thomasghenry" {
  name   = "thomasghenry.com"
  region = "us-east-1"
}

resource "dreamhost_dns_record" "resend" {
  for_each = { for r in resend_domain.thomasghenry.records : r.name => r }
  record   = each.value.name
  type     = each.value.type
  value    = each.value.value
}
