# Todo List App — Final DevOps Project

A full-stack Todo List application built with Spring Boot and Next.js, featuring a complete DevOps pipeline with CI/CD, monitoring, logging, alerting, security scanning, and automated environment setup.

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Deployment Workflow](#deployment-workflow)
- [Environment Setup](#environment-setup)
- [Security Implementation](#security-implementation)
- [Monitoring and Logging](#monitoring-and-logging)
- [Reliability Improvements](#reliability-improvements)
- [Screenshots](#screenshots)

---

## Project Architecture

```
Final Project DevOps/
├── backend/                  # Spring Boot REST API (Java 21)
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 # Next.js 16 frontend (TypeScript + Tailwind)
│   ├── src/
│   ├── Dockerfile
│   └── next.config.ts
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml    # Scrape config
│   │   └── alert_rules.yml   # Alerting rules
│   ├── grafana/
│   │   └── provisioning/     # Auto-provisioned datasources + dashboards
│   └── loki/
│       ├── loki-config.yml   # Loki log storage config
│       └── promtail-config.yml # Log collector config
├── scripts/
│   ├── health-check.sh       # Service health check script
│   ├── rollback.sh           # Manual rollback script
│   └── setup.sh              # Automated local setup script
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI: build, lint, security scanning
│       └── cd.yml            # CD: deploy to Vercel with rollback
└── docker-compose.yml        # Full local stack orchestration
```

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Spring Boot 4.1, Java 21, JPA |
| Database | PostgreSQL 17 |
| Monitoring | Prometheus + Grafana |
| Logging | Loki + Promtail |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) + Railway (backend + DB) |
| Containerization | Docker + Docker Compose |

### Data Flow

```
Next.js Frontend (:3000)
        │
        ▼
Spring Boot Backend (:8080)
        │
        ├─ /actuator/prometheus ──► Prometheus (:9090) ──► Grafana (:3010)
        │                                │
        │                          alert_rules.yml
        │
        └─ stdout logs ──► Promtail ──► Loki (:3100) ──► Grafana
```

---

## Deployment Workflow

### CI/CD Pipeline

Every push to `main` triggers the following pipeline:

**CI (ci.yml)**
1. Build and lint the Next.js frontend
2. Run frontend dependency vulnerability scan (`npm audit` + Trivy)
3. Run backend dependency vulnerability scan (OWASP + Trivy)
4. Scan for leaked secrets across the entire repository
5. Scan Dockerfiles and docker-compose.yml for misconfigurations

**CD (cd.yml)**
1. Triggers only after CI passes successfully
2. Pulls Vercel environment configuration
3. Builds the production Next.js bundle
4. Deploys to Vercel using rolling update strategy
5. Automatically rolls back to the previous deployment if deploy fails

### Deployment Targets

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://final-project-dev-ops.vercel.app |
| Backend | Railway | https://final-project-devops-production.up.railway.app |
| Database | Railway (PostgreSQL) | managed |

### Rolling Update Strategy

Vercel deploys new versions gradually — the new deployment becomes live only after it passes health checks. If the deploy step fails, the `rollback` job in `cd.yml` automatically triggers `vercel rollback` to restore the previous working version instantly.

---

## Environment Setup

### Prerequisites

- Docker Desktop
- Node.js 20+
- Git

### Quick Start (Single Command)

```bash
# Clone the repository
git clone https://github.com/PhkhakadzeJumber/final-project-DevOps.git
cd final-project-DevOps

# Run the automated setup script
./scripts/setup.sh
```

The setup script automatically:
1. Checks Docker and Node.js are installed
2. Installs frontend dependencies
3. Builds and starts all services with Docker Compose

### Services After Setup

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api/todos |
| Actuator Health | http://localhost:8080/actuator/health |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3010 (admin/admin) |
| Loki | http://localhost:3100/ready |

### Manual Start

```bash
docker compose up --build
```

### Stop and Clean

```bash
docker compose down -v
```

---

## Security Implementation

Security is integrated directly into the CI pipeline and runs automatically on every push to `main`.

### 1. Frontend Dependency Scanning

`npm audit` checks all Node.js packages for known vulnerabilities. Trivy performs a deep filesystem scan of the frontend directory.

### 2. Backend Dependency Scanning

OWASP Dependency Check scans all Maven dependencies against the National Vulnerability Database. Trivy also scans the backend filesystem for vulnerable packages.

### 3. Secrets Scanning

Trivy scans the entire repository for accidentally committed secrets, API keys, tokens, and passwords before every deployment.

### 4. Docker and IaC Security Scanning

Trivy config scan checks all Dockerfiles and `docker-compose.yml` for security misconfigurations such as running as root, exposed sensitive ports, or missing security headers.

### Security Tools Used

| Tool | Purpose | Free |
|---|---|---|
| Trivy | Filesystem, secrets, config scanning | ✅ |
| OWASP Dependency Check | Java/Maven CVE scanning | ✅ |
| npm audit | Node.js package vulnerability scanning | ✅ |

All security checks use `exit-code: 0` so findings are reported as warnings without blocking deployment — appropriate for a development project.

---

## Monitoring and Logging

### Monitoring (Prometheus + Grafana)

Prometheus scrapes metrics from the Spring Boot backend every 15 seconds via `/actuator/prometheus` exposed by Micrometer. Grafana visualizes these metrics with auto-provisioned datasources.

**Available Metrics:**
- JVM heap memory usage
- HTTP request rate and response times
- Active database connections
- Application uptime

**Grafana Dashboard:**
Import dashboard ID `4701` in Grafana for a full Spring Boot metrics dashboard.

### Alerting Rules

Three alert rules are configured in `monitoring/prometheus/alert_rules.yml`:

| Alert | Condition | Severity |
|---|---|---|
| BackendDown | Backend unreachable for 30s | Critical |
| HighMemoryUsage | JVM heap > 85% | Warning |
| HighHttpErrorRate | 5xx errors > 0.1/sec | Critical |

### Logging (Loki + Promtail)

Promtail collects logs from all Docker containers via the Docker socket and ships them to Loki. Grafana queries Loki using LogQL for log visualization and filtering.

**Log retention:** 24 hours (temporary, cleared on container restart)

**Query logs in Grafana Explore:**
```
{service="backend"}
{service="frontend"}
{level="ERROR"}
```

---

## Reliability Improvements

### Health Checks

Automated health check script pings both frontend and backend:

```bash
./scripts/health-check.sh
```

Spring Boot Actuator exposes a health endpoint at `/actuator/health`.

### Rollback Procedure

**Automatic:** The CD pipeline automatically rolls back Vercel if deployment fails.

**Manual:** Run the rollback script:
```bash
export VERCEL_TOKEN=your_token
./scripts/rollback.sh
```

### Failure Recovery

All Docker services are configured with `restart: unless-stopped` — they automatically restart on crash without manual intervention.

### Service Availability

- Frontend: Vercel (99.99% SLA)
- Backend: Railway (managed uptime)
- Local: Docker health checks ensure Postgres is ready before backend starts

---

## Screenshots

### Application UI
![Todo App UI](screenshots/todo-ui.png)
*[PLACEHOLDER — Add screenshot of the running Todo List application at localhost:3000]*

### CI/CD Pipeline
![GitHub Actions Pipeline](screenshots/github-actions.png)
*[PLACEHOLDER — Add screenshot of GitHub Actions showing CI and CD workflows passing]*

### Prometheus Targets
![Prometheus Targets](screenshots/prometheus-targets.png)
*[PLACEHOLDER — Add screenshot of Prometheus targets page showing backend scrape as UP]*

### Grafana Dashboard
![Grafana Dashboard](screenshots/grafana-dashboard.png)
*[PLACEHOLDER — Add screenshot of Grafana dashboard showing Spring Boot metrics]*

### Loki Logs in Grafana
![Loki Logs](screenshots/loki-logs.png)
*[PLACEHOLDER — Add screenshot of Grafana Explore showing Loki log stream]*

### Alert Rules
![Alert Rules](screenshots/alert-rules.png)
*[PLACEHOLDER — Add screenshot of Prometheus Alerts tab showing configured rules]*

### Docker Compose Services
![Docker Services](screenshots/docker-services.png)
*[PLACEHOLDER — Add screenshot of all containers running in Docker Desktop or terminal]*

### Security Scan Results
![Security Scan](screenshots/security-scan.png)
*[PLACEHOLDER — Add screenshot of GitHub Actions security scan job results]*

### Deployed Frontend on Vercel
![Vercel Deployment](screenshots/vercel-deployment.png)
*[PLACEHOLDER — Add screenshot of the live Vercel deployment]*

### Railway Backend Deployment
![Railway Deployment](screenshots/railway-deployment.png)
*[PLACEHOLDER — Add screenshot of Railway showing backend service running]*