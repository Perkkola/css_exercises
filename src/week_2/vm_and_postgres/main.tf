variable "vm_name_input" {
    type = string
}

variable "db_name_input" {
    type = string
}

variable "db_password" {
    type = string
    sensitive = true
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
  zone    = "europe-central2-b"
}

resource "google_compute_network" "vpc_network" {
  name = "tofu-network"
  auto_create_subnetworks = "true"
}

resource "google_compute_firewall" "firewall" {
  name    = "tofu-firewall"
  network = google_compute_network.vpc_network.name


  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["web"]

}


resource "google_compute_instance" "vm_instance" {
  name         = var.vm_name_input
  machine_type = "f1-micro"
  deletion_protection = false
  tags = ["web"]
  boot_disk {
    initialize_params {
        image = "debian-cloud/debian-13"
        labels = {
            course = "css-gcp"
        }
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {

    }
  }

  labels = {
    "course": "css-gcp"
  }

  metadata_startup_script = "sudo apt update && sudo apt -y install nginx && sudo systemctl status nginx && sudo systemctl start nginx"
}

resource "google_compute_global_address" "private_ip_address" {
  provider = google-beta

  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  project       = "css-fransperkkola-2026"
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  provider = google-beta
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
  deletion_policy = "ABANDON"
}

resource "google_sql_database_instance" "sql_instance" {
  name             = var.db_name_input
  database_version = "POSTGRES_17"
  region           = "europe-north1"
  
  depends_on = [google_service_networking_connection.private_vpc_connection]
  deletion_protection = false

  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
    deletion_protection_enabled = false
    availability_type = "ZONAL"
    edition = "ENTERPRISE"

    ip_configuration {
      ipv4_enabled = false
      private_network= google_compute_network.vpc_network.self_link
      enable_private_path_for_google_cloud_services = true
    }

  }
}

resource "google_sql_user" "app_user" {
  name     = "app_user"
  instance = google_sql_database_instance.sql_instance.name
  password = var.db_password
}

output "vm_name" {
  value = google_compute_instance.vm_instance.name
}

output "public_ip" {
  value = google_compute_instance.vm_instance.network_interface.0.access_config.0.nat_ip
}

output "cloudsql_instance_name" {
  value = google_sql_database_instance.sql_instance.name
}

output "cloudsql_private_ip" {
  value = google_sql_database_instance.sql_instance.private_ip_address
}