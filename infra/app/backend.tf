terraform {
  backend "s3" {
    bucket = "mde-tofu-state"
    key    = "app/terraform.tfstate"

    region   = "auto"
    endpoint = "https://f6c1744bbffb823f40e0e8abc9555cf2.r2.cloudflarestorage.com"

    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    use_path_style              = true
  }
}
