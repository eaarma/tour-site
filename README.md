# TourHub – Full-Stack Tour Booking Platform

TourHub is a production-ready, multi-tenant tour booking and eCommerce platform that allows tour operators to manage listings, schedules, and bookings, while users can browse, book, and manage tours.

The system is designed with a focus on real-world requirements: secure authentication, payment processing, booking consistency, and operational observability.

---

## 🚀 Features

- Multi-tenant shop system (tour operators)
- Public and private tour pricing models
- Booking system with reservation and availability control
- JWT authentication with refresh token flow
- Stripe payment integration with webhook-driven confirmation
- Cancellation and refund system with idempotent Stripe refunds
- Role-based access control (users, managers)
- Email notifications (booking & cancellation)
- Production monitoring with Prometheus and Grafana

---

## 🏗 Tech Stack

### Backend
- Java 21, Spring Boot
- PostgreSQL, JPA (Hibernate)
- Flyway (database migrations)
- Spring Security (JWT authentication)
- Stripe API (payments & webhooks)

### Frontend
- Next.js (React + TypeScript)
- Redux Toolkit
- Tailwind CSS / DaisyUI

### Infrastructure
- Docker & Docker Compose
- CI/CD with GitHub Actions
- Nginx reverse proxy
- Linux (VM deployment)
- Prometheus & Grafana (monitoring & alerting)

---

## 🔐 Architecture Highlights

- Webhook-driven payment confirmation (no frontend trust)
- Pessimistic locking for booking & refund consistency
- Idempotent Stripe refund handling
- Clear separation between public and authenticated flows
- Environment-aware configuration (dev / prod parity)

---

## 🌍 Deployment

The application is deployed in a production environment using:

- Dockerized services (backend, frontend, database)
- Nginx reverse proxy with HTTPS (Let’s Encrypt)
- Monitoring stack (Prometheus, Grafana, Alertmanager)
- CI/CD pipeline deploying immutable images via GitHub Actions

---

## 🧠 What I Focused On

This project was built to go beyond typical tutorial applications, with emphasis on:

- Production-ready architecture
- Secure authentication and payment flows
- Observability and monitoring
- Deployment consistency and infrastructure setup
- Handling real-world edge cases (cancellations, refunds, race conditions)

---

## 📬 Contact

If you're interested in this project or my work:

Email: Edward5445@gmail.com
LinkedIn: https://www.linkedin.com/in/edward-aarma-7a95b8254/
