terraform {
  # GCS backend — configure bucket before running tofu init
  # TODO: Set bucket name before applying
  backend "gcs" {
    bucket = "TODO-configure-your-gcs-bucket-name"
    prefix = "tgh-template/github"
  }

  # Cloudflare R2 alternative:
  # backend "s3" {
  #   bucket                      = "TODO-configure-your-r2-bucket-name"
  #   key                         = "tgh-template/github/terraform.tfstate"
  #   region                      = "auto"
  #   endpoint                    = "https://TODO.r2.cloudflarestorage.com"
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  #   skip_region_validation      = true
  # }
}
