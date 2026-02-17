📦 Deployment Guide – TourHub

This document explains how environment variables and deployment work for both backend and frontend in production.

🧱 Architecture Overview

Production consists of:

PostgreSQL (Docker)

Spring Boot backend (Docker)

Next.js frontend (Docker)

Prometheus

Grafana

Stripe (external)

SMTP provider (external)

🔐 Environment Variable Strategy

There are two types of variables in this project:

1️⃣ Runtime Variables (Backend)

These are injected into the backend container via:

docker-compose.prod.yml

They are defined in the VM’s .env file and referenced in compose.

📍 Location (on VM)
/path/to/project/.env

Required Backend Variables
POSTGRES_DB=tourdb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strongpassword

JWT_SECRET=super_long_random_string

STRIPE*API_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec*...

SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=app_password
CONTACT_RECEIVER=admin@tourhub.space

These are consumed by Spring Boot via environment variables.

2️⃣ Build-Time Variables (Frontend)

⚠️ Important:
Frontend NEXT*PUBLIC*\* variables are baked into the app at build time, not runtime.

They are injected during GitHub Actions Docker build via:

build-args:
NEXT*PUBLIC*...

These values become part of .next build output.

Required Frontend Variables (GitHub Environment Secrets)

Set these under:

GitHub → Settings → Environments → production → Secrets

NEXT_PUBLIC_API_BASE_URL=https://api.tourhub.space

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_or_test_key

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

⚠️ If you change these, you must trigger a new Docker build.

🐳 Docker Compose (Production)

On the VM:

docker compose -f docker-compose.prod.yml up -d

Backend reads runtime variables from:

.env file

docker-compose environment: section

Frontend does NOT read runtime env for NEXT*PUBLIC*\*.

🔄 Deployment Flow
Backend Deployment

Push to main

GitHub builds backend image

SSH deploy job:

Pulls new image

Runs:

docker compose up -d backend

Backend variables come from VM .env.

Frontend Deployment

Push to main

GitHub builds frontend Docker image with build args

SSH deploy job pulls image

Container restarts

If Stripe publishable key is wrong → rebuild image.

💳 Stripe Configuration

Production requires:

In Stripe Dashboard:

Live API key

Live webhook endpoint:

https://api.tourhub.space/stripe/webhook

Correct webhook signing secret

🔎 Debugging Environment Variables
Check what backend container is using:
docker exec -it store_manager_backend printenv | grep STRIPE

Check frontend baked key inside container:
docker exec -it tourhub-frontend sh
grep -R pk\_ /app/.next

If key missing → CI build args misconfigured.

🗂 Where Variables Live (Quick Reference)
Variable Type Defined Where Used When
Backend secrets VM .env Runtime
Stripe API key VM .env Runtime
Stripe publishable key GitHub Environment Secret Build time
Firebase keys GitHub Environment Secret Build time
DB credentials VM .env Runtime
🛡 Production Safety Checklist

Before go-live:

Stripe live API key active

Stripe live webhook configured

SMTP working

JWT secret strong

Database backup created

Grafana admin password changed

No test keys in production

📌 Important Rules

Backend reads environment variables at container start.

Frontend reads NEXT*PUBLIC*\* at build time only.

Changing frontend env requires rebuild.

Changing backend env requires container restart.

Stripe test and live keys must never mix.

🏁 Final Notes

If something works locally but not in production:

80% chance → environment mismatch

15% chance → Stripe key mismatch

5% chance → CORS or routing

Most production bugs in this project will be env-related.

Keep this file updated whenever adding new secrets.
