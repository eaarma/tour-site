📘 Production Deployment Runbook

This document describes how production deployments work, what is automated, what is manual, and how to recover from failure.

1️⃣ High-Level Architecture

Components:

Frontend: Next.js (Dockerized)

Backend: Spring Boot (Dockerized)

Database: PostgreSQL (Docker volume)

Reverse proxy: Nginx (host-level)

CI/CD: GitHub Actions

Registry: GitHub Container Registry (GHCR)

Hosting: Single Linux VM (Docker + Docker Compose)

Key principle:

CI builds immutable images. CD deploys them verbatim.

No builds happen on the server.

2️⃣ Environments & Branching Model
Branches

main → production

PRs → validation only (no deployment)

Environments

Local → Docker / IDE

CI → ephemeral GitHub runner

Production → VM via Docker Compose

3️⃣ CI Pipeline (Build & Push)
Trigger

Push to main

Pull request (build only, no deploy)

Backend CI does:

Checkout code

Start PostgreSQL service

Run:

gradlew test

flywayMigrate

flywayValidate

Build Docker image:

ghcr.io/<org>/store-manager-backend:<commit-sha>

Push image to GHCR

Frontend CI does:

Checkout code

Install dependencies

Lint (TypeScript + ESLint)

Build Next.js (prod)

Build Docker image:

ghcr.io/<org>/tourhub-frontend:<commit-sha>

Push image to GHCR

🚨 Important guarantees:

No schema drift allowed

Images are immutable

CI must pass before any deploy happens

4️⃣ CD Pipeline (Assisted Continuous Deployment)
Trigger

Successful CI on main

Deployment method

SSH into production VM

Docker Compose is used as the orchestrator

Only the changed service is redeployed

5️⃣ Production Server Layout
/home/edward/store-manager/
├── docker-compose.prod.yml
├── .env
└── postgres_data/ (Docker volume)

.env (Compose-time variables)

Example:

BACKEND_IMAGE_TAG=<commit-sha>
FRONTEND_IMAGE_TAG=<commit-sha>

SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://postgres:5432/tourdb
DB_USERNAME=postgres
DB_PASSWORD=**\*\***
JWT_SECRET=**\*\***
SERVER_PORT=8080

⚠️ .env is required for production
⚠️ Never commit secrets

6️⃣ Deployment Flow (Automated)
Backend deploy (via GitHub Actions)

SSH into VM

cd /home/edward/store-manager

Export:

BACKEND_IMAGE_TAG=<commit-sha>

Run:

docker compose pull backend
docker compose up -d --no-deps backend

Verify:

https://api.tourhub.space/actuator/health

Frontend deploy

Same pattern, scoped to frontend:

docker compose pull frontend
docker compose up -d --no-deps frontend

Health check:

http://127.0.0.1:3001

7️⃣ Manual Deployment (Fallback)

If GitHub Actions is unavailable:

ssh edward@<vm-ip>
cd ~/store-manager

export BACKEND_IMAGE_TAG=<sha>
export FRONTEND_IMAGE_TAG=<sha>

docker compose pull
docker compose up -d

8️⃣ Rollback Procedure

Rollbacks are image-based, not Git-based.

Steps:

Find previous working image:

docker images | grep store-manager-backend

Update .env:

BACKEND_IMAGE_TAG=<previous-sha>

Redeploy:

docker compose up -d --no-deps backend

✅ Database is untouched
✅ No Flyway undo in prod
✅ Forward-only migrations

9️⃣ Observability & Verification
Health

Backend: /actuator/health

Frontend: HTTP 200 on root

Logs
docker logs store-manager-backend
docker logs tourhub-frontend

Containers
docker compose ps

🔐 Security Notes

SSH access via key-based auth only

Secrets live in .env on VM

GHCR authentication required on VM

Containers run as non-root where possible

10️⃣ What This System Intentionally Does Not Do

❌ No Kubernetes

❌ No auto-scaling

❌ No canary releases

❌ No infra-as-code (Terraform)

These are future decisions, not missing pieces.
