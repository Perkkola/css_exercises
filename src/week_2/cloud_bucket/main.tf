variable "bucket_name" {
  type = string
}

variable "folder_name" {
  type = string
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google"{
  project = "css-fransperkkola-2026"
  region  = "europe-north1"
  zone    = "europe-north1"
}

resource "google_storage_bucket" "cloud_bucket" {
  name = var.bucket_name
  location = "europe-north1"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "empty_folder" {
  name   = var.folder_name
  content = " "
  bucket = google_storage_bucket.cloud_bucket.name
}
